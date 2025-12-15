from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Redis Job Scheduler"
    
    # Redis (Standard)
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    # Redis (Upstash HTTP - Optional)
    UPSTASH_REDIS_REST_URL: str | None = None
    UPSTASH_REDIS_REST_TOKEN: str | None = None
    
    # MongoDB
    MONGO_URL: str = "mongodb://mongo:27017"
    MONGO_DB_NAME: str = "job_scheduler"
    
    # Worker
    WORKER_ID: str = "worker-1"
    
    class Config:
        case_sensitive = True

settings = Settings()
