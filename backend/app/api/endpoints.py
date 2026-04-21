from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.schemas.data_schemas import (
    DataLoadRequest, MessageResponse, SimilaritySearchRequest,
    SimilaritySearchResponse, RegimeResponse, WindowResponse,
    TrainResponse, TransitionMatrixResponse
)
from app.services.data_service import load_data, preprocess_and_window
from app.services.ml_service import train_hmm_model, similarity_search, get_transition_matrix
from app.models.data_models import Regimes, Windows
from sqlalchemy import select

router = APIRouter()

@router.get("/health", response_model=MessageResponse)
def health_check():
    return {"message": "Service is healthy"}

@router.post("/data/load", response_model=MessageResponse)
def load_data_endpoint(request: DataLoadRequest, db: Session = Depends(get_db)):
    try:
        load_data(db, filepath=request.filepath, use_default=request.use_default)
        return {"message": "Data loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/data/preprocess", response_model=MessageResponse)
def preprocess_endpoint(db: Session = Depends(get_db)):
    try:
        preprocess_and_window(db, window_size_hours=24)
        return {"message": "Data preprocessed and windowed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/model/train", response_model=TrainResponse)
def train_model_endpoint(db: Session = Depends(get_db)):
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
def get_regimes(db: Session = Depends(get_db)):
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
def run_similarity_search(request: SimilaritySearchRequest, db: Session = Depends(get_db)):
    try:
        query_w, results = similarity_search(
            db, 
            start_time=request.start_time, 
            end_time=request.end_time,
            top_k=request.top_k
        )
        return {
            "query_window": query_w,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/windows/{id}", response_model=WindowResponse)
def get_window(id: int, db: Session = Depends(get_db)):
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
def retrain_model_endpoint(db: Session = Depends(get_db)):
    # Simple alias to train model for now
    return train_model_endpoint(db)

@router.get("/model/transition-matrix", response_model=TransitionMatrixResponse)
def get_transition_matrix_endpoint():
    try:
        matrix = get_transition_matrix()
        return {"matrix": matrix}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
