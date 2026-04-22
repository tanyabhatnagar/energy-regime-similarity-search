from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import os
import tempfile
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.data_schemas import (
    DataLoadRequest, MessageResponse, SimilaritySearchRequest,
    SimilaritySearchResponse, RegimeResponse, WindowResponse,
    TrainResponse, TransitionMatrixResponse, UserCreate, Token, SearchHistoryItem, SystemStatsResponse
)
from app.services.data_service import load_data, preprocess_and_window
from app.services.ml_service import train_hmm_model, similarity_search, get_transition_matrix
from app.models.data_models import Regimes, Windows, SearchHistory, TimeSeriesData
from app.models.user_models import User
from app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select, func

router = APIRouter()

@router.get("/health", response_model=MessageResponse)
def health_check():
    return {"message": "Service is healthy"}

@router.post("/auth/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(username=user_in.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/data/stats", response_model=SystemStatsResponse)
def get_system_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        dp = db.scalar(select(func.count(TimeSeriesData.id))) or 0
        win = db.scalar(select(func.count(Windows.id))) or 0
        reg = db.scalar(select(func.count(func.distinct(Regimes.regime_label)))) or 0
        return {
            "data_points": dp,
            "active_windows": win,
            "regimes_mapped": reg,
            "system_status": "Healthy"
        }
    except Exception as e:
        return {
            "data_points": 0,
            "active_windows": 0,
            "regimes_mapped": 0,
            "system_status": f"Error: {e}"
        }

@router.post("/data/load", response_model=MessageResponse)
def load_data_endpoint(request: DataLoadRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        load_data(db, filepath=request.filepath, use_default=request.use_default)
        return {"message": "Data loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/data/upload", response_model=MessageResponse)
def upload_data_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            tmp.write(file.file.read())
            temp_path = tmp.name
            
        try:
            load_data(db, filepath=temp_path, use_default=False)
        finally:
            os.remove(temp_path)
            
        return {"message": "Custom CSV data uploaded and loaded successfully"}
    except Exception as e:
        import traceback
        error_detail = f"Error: {str(e)}\n\nTraceback: {traceback.format_exc()}"
        raise HTTPException(status_code=400, detail=error_detail)

@router.post("/data/preprocess", response_model=MessageResponse)
def preprocess_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        preprocess_and_window(db, window_size_hours=24)
        return {"message": "Data preprocessed and windowed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/model/train", response_model=TrainResponse)
def train_model_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        train_score, val_score = train_hmm_model(db, n_components=4)
        return {
            "message": "Model trained and regimes assigned successfully",
            "train_score": train_score,
            "validation_score": val_score
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/model/regimes", response_model=List[RegimeResponse])
def get_regimes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        results = db.execute(select(Regimes)).scalars().all()
        response = []
        for r in results:
            w = r.window
            response.append({
                "window_id": r.window_id,
                "start_time": w.start_time,
                "end_time": w.end_time,
                "regime_label": r.regime_label
            })
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/similarity/search", response_model=SimilaritySearchResponse)
def run_similarity_search(request: SimilaritySearchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        query_w, results = similarity_search(
            db, 
            start_time=request.start_time, 
            end_time=request.end_time,
            top_k=request.top_k
        )
        response_data = SimilaritySearchResponse(query_window=query_w, results=results)
        
        # Log to history
        history_record = SearchHistory(
            user_id=current_user.id,
            start_time=request.start_time.isoformat(),
            end_time=request.end_time.isoformat(),
            top_k=request.top_k,
            results_json=response_data.model_dump(mode="json")
        )
        db.add(history_record)
        db.commit()
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/similarity/history", response_model=List[SearchHistoryItem])
def get_search_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        query = select(SearchHistory).filter(SearchHistory.user_id == current_user.id).order_by(SearchHistory.timestamp.desc())
        results = db.execute(query).scalars().all()
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/windows/{id}", response_model=WindowResponse)
def get_window(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        window = db.execute(select(Windows).filter(Windows.id == id)).scalars().first()
        if not window:
            raise HTTPException(status_code=404, detail="Window not found")
        return window
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/model/retrain", response_model=TrainResponse)
def retrain_model_endpoint(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Simple alias to train model for now
    return train_model_endpoint(db)

@router.get("/model/transition-matrix", response_model=TransitionMatrixResponse)
def get_transition_matrix_endpoint(current_user: User = Depends(get_current_user)):
    try:
        matrix = get_transition_matrix()
        return {"matrix": matrix}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
