from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router as api_router
from app.db.database import Base, engine

# Create the database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Energy Regime Similarity Search System",
    description="API for time-series similarity search using HMM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "message": "Energy Regime Similarity Search API is running.",
        "docs": "/docs",
        "health": "/health"
    }
