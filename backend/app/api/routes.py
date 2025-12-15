from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from typing import List
from app.models.job import Job, JobCreate
from app.services.queue_service import queue_service
from app.services.rate_limiter import rate_limiter
from app.core.database import db
from app.core.redis import redis_client
from bson import ObjectId
import asyncio
import json

router = APIRouter()

@router.post("/jobs", response_model=Job, status_code=201)
async def create_job(job: JobCreate):
    # Rate Limiting
    if not await rate_limiter.is_allowed(job.user_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    return await queue_service.enqueue_job(job)

@router.get("/jobs", response_model=List[Job])
async def list_jobs(limit: int = 50):
    cursor = db.db["jobs"].find().sort("created_at", -1).limit(limit)
    jobs = await cursor.to_list(length=limit)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

@router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    job = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job["_id"] = str(job["_id"])
    return job

@router.get("/stats")
async def get_stats():
    # Gather stats from Redis
    queues = ["queue:immediate:high", "queue:immediate:normal", "queue:immediate:low", "queue:dead_letter"]
    stats = {}
    for q in queues:
        stats[q] = await redis_client.llen(q)
    
    stats["delayed"] = await redis_client.zcard("queue:delayed")
    return stats

@router.post("/jobs/{job_id}/retry")
async def retry_job(job_id: str):
    success = await queue_service.retry_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found or cannot be retried")
    return {"status": "Job retried"}

@router.delete("/jobs/{job_id}")
async def cancel_job(job_id: str):
    success = await queue_service.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "Job cancelled"}

@router.post("/jobs/{job_id}/boost")
async def boost_job(job_id: str):
    success = await queue_service.boost_job(job_id)
    if not success:
        raise HTTPException(status_code=400, detail="Job cannot be boosted (must be queued/delayed)")
    return {"status": "Job boosted ⚡"}

@router.get("/cron/process")
async def process_jobs_cron():
    """
    Vercel Cron Handler: Simulates the worker by processing a few jobs.
    Since Vercel has timeouts, we process only one batch.
    """
    from app.worker import process_job
    import asyncio
    
    # Try to pop a job from high priority then normal
    # This is a 'serverless worker' simulation
    
    did_work = False
    
    # 1. High Priority
    job_id_str = await redis_client.lpop("queue:immediate:high")
    if job_id_str:
        await process_job(job_id_str)
        did_work = True
        
    # 2. Normal Priority (if we have time/capacity)
    if not did_work:
        job_id_str = await redis_client.lpop("queue:immediate")
        if job_id_str:
            await process_job(job_id_str)
            did_work = True
            
    return {"status": "Cron run completed", "did_work": did_work}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("events:jobs")
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message["data"])
            await asyncio.sleep(0.01)
    except WebSocketDisconnect:
        await pubsub.unsubscribe("events:jobs")
