from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/energy_regimes"
    MODEL_SAVE_DIR: str = "saved_models"
    
    class Config:
        env_file = ".env"

settings = Settings()
