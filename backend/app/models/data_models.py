from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime

class TimeSeriesData(Base):
    __tablename__ = "time_series_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    value = Column(Float)
    feature_name = Column(String, index=True)

class Windows(Base):
    __tablename__ = "windows"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, index=True)
    end_time = Column(DateTime, index=True)
    data = Column(JSON)  # Store windowed data array

    regime = relationship("Regimes", back_populates="window", uselist=False)

class Regimes(Base):
    __tablename__ = "regimes"

    id = Column(Integer, primary_key=True, index=True)
    window_id = Column(Integer, ForeignKey("windows.id"))
    regime_label = Column(Integer, index=True)
    
    window = relationship("Windows", back_populates="regime")

class SimilarityResults(Base):
    __tablename__ = "similarity_results"

    id = Column(Integer, primary_key=True, index=True)
    query_window_id = Column(Integer, ForeignKey("windows.id"))
    target_window_id = Column(Integer, ForeignKey("windows.id"))
    log_likelihood_score = Column(Float, index=True)
    rank = Column(Integer)

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    start_time = Column(String)
    end_time = Column(String)
    top_k = Column(Integer)
    results_json = Column(JSON)  # serializable dump of the search results
