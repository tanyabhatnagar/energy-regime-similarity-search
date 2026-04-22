from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class DataLoadRequest(BaseModel):
    filepath: Optional[str] = None
    use_default: bool = True

class SimilaritySearchRequest(BaseModel):
    start_time: datetime
    end_time: datetime
    top_k: int = 5

class WindowResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime
    data: Any

    class Config:
        from_attributes = True

class SimilarityResultItem(BaseModel):
    target_window: WindowResponse
    log_likelihood_score: float
    rank: int

class SimilaritySearchResponse(BaseModel):
    query_window: WindowResponse
    results: List[SimilarityResultItem]

class RegimeResponse(BaseModel):
    window_id: int
    start_time: datetime
    end_time: datetime
    regime_label: int

class MessageResponse(BaseModel):
    message: str

class TrainResponse(BaseModel):
    message: str
    train_score: float
    validation_score: float

class TransitionMatrixResponse(BaseModel):
    matrix: List[List[float]]

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SearchHistoryItem(BaseModel):
    id: int
    timestamp: datetime
    start_time: str
    end_time: str
    top_k: int
    results_json: Any

    class Config:
        from_attributes = True

class SystemStatsResponse(BaseModel):
    data_points: int
    active_windows: int
    regimes_mapped: int
    system_status: str
