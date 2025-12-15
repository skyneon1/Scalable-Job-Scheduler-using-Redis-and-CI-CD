from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.core.database import db
from app.core.redis import redis_client
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db.connect()
    try:
        await redis_client.ping()
        print("Connected to Redis")
    except Exception as e:
        print(f"Redis connection failed: {e}")
    
    yield
    
    # Shutdown
    db.close()
    await redis_client.close()

app = FastAPI(title="Redis Job Scheduler", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Job Scheduler API"}
