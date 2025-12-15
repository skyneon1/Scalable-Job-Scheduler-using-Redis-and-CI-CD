import asyncio
import json
import time
from datetime import datetime
from bson import ObjectId
from app.core.config import settings
from app.core.redis import redis_client
from app.core.database import db
from app.models.job import JobStatus

QUEUES = ["queue:immediate:high", "queue:immediate:normal", "queue:immediate:low"]

class Worker:
    def __init__(self):
        self.running = True

    async def start(self):
        print(f"Worker {settings.WORKER_ID} started")
        db.connect()
        
        while self.running:
            try:
                # 1. Check Delayed Jobs
                await self.process_delayed_jobs()
                
                # 2. Process Queues
                # BRPOP blocks until a job is available
                # We need to use redis-py's blocking pop which takes multiple keys
                # It returns a tuple (queue_name, value)
                result = await redis_client.brpop(QUEUES, timeout=1)
                
                if result:
                    queue_name, job_id = result
                    await self.process_job(job_id)
                
            except Exception as e:
                print(f"Worker Error: {e}")
                await asyncio.sleep(1)

    async def process_delayed_jobs(self):
        # Check for jobs ready to run (score <= current_timestamp)
        now = datetime.utcnow().timestamp()
        
        # ZRANGEBYSCORE to get ready jobs
        jobs = await redis_client.zrangebyscore("queue:delayed", 0, now)
        
        for job_id in jobs:
            # Remove from delayed
            removed = await redis_client.zrem("queue:delayed", job_id)
            if removed:
                # Need to find the original priority to push to correct queue
                # For simplicity, we just look up the job or send to normal
                job_data = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
                if job_data:
                    priority = job_data.get("priority", 2)
                    queue = "queue:immediate:normal"
                    if priority == 3: queue = "queue:immediate:high"
                    elif priority == 1: queue = "queue:immediate:low"
                    
                    await redis_client.lpush(queue, job_id)
                    print(f"Moved delayed job {job_id} to {queue}")

    async def process_job(self, job_id: str):
        from bson import ObjectId
        
        # 1. Acquire Lock
        lock_key = f"lock:job:{job_id}"
        is_locked = await redis_client.set(lock_key, settings.WORKER_ID, nx=True, ex=300) # 5 min lock
        
        if not is_locked:
            return

        print(f"Processing job {job_id}")
        
        try:
            # Update status to ACTIVE
            await db.db["jobs"].update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"status": JobStatus.ACTIVE, "started_at": datetime.utcnow()}}
            )
            await self.publish_event(job_id, JobStatus.ACTIVE)

            # Fetch payload
            job = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
            if not job:
                return

            # --- SIMULATE EXECUTION ---
            # In a real system, you'd dispatch based on job['type']
            await asyncio.sleep(2) # Fake work
            
            # Simulate random failure
            # import random
            # if random.random() < 0.2:
            #     raise Exception("Random Failure")

            # Update status to COMPLETED
            await db.db["jobs"].update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"status": JobStatus.COMPLETED, "completed_at": datetime.utcnow(), "result": {"msg": "Success"}}}
            )
            await self.publish_event(job_id, JobStatus.COMPLETED)

        except Exception as e:
            print(f"Job {job_id} Failed: {str(e)}")
            await self.handle_failure(job_id, str(e))
        finally:
            await redis_client.delete(lock_key)

    async def handle_failure(self, job_id: str, error: str):
        from bson import ObjectId
        
        job = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
        retry_count = job.get("retry_count", 0)
        max_retries = job.get("max_retries", 3)
        
        if retry_count < max_retries:
            # Exponential Backoff
            delay = 2 ** retry_count # 1s, 2s, 4s...
            next_retry = datetime.utcnow().timestamp() + delay
            
            await db.db["jobs"].update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"status": JobStatus.DELAYED, "retry_count": retry_count + 1, "error": error}}
            )
            await redis_client.zadd("queue:delayed", {job_id: next_retry})
            await self.publish_event(job_id, "retrying", {"retry_in": delay})
        else:
            # Dead Letter
            await db.db["jobs"].update_one(
                {"_id": ObjectId(job_id)},
                {"$set": {"status": JobStatus.FAILED, "error": error}}
            )
            await redis_client.lpush("queue:dead_letter", job_id)
            await self.publish_event(job_id, JobStatus.FAILED)

    async def publish_event(self, job_id, status, extra=None):
        payload = {"job_id": str(job_id), "status": status}
        if extra: payload.update(extra)
        await redis_client.publish("events:jobs", json.dumps(payload))

if __name__ == "__main__":
    worker = Worker()
    # Basic asyncio run
    loop = asyncio.get_event_loop()
    loop.run_until_complete(worker.start())
