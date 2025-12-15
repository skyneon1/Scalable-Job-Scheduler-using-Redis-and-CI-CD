import json
from datetime import datetime
from app.core.redis import redis_client
from app.core.database import db
from app.models.job import Job, JobStatus, JobCreate

class QueueService:
    async def enqueue_job(self, job_data: JobCreate) -> Job:
        try:
            # 1. Create Job in MongoDB
            job_dict = job_data.model_dump()
            job_dict["status"] = JobStatus.QUEUED
            job_dict["created_at"] = datetime.utcnow()
            job_dict["retry_count"] = 0
            job_dict["max_retries"] = 3
            
            if job_data.scheduled_at:
                job_dict["status"] = JobStatus.DELAYED

            result = await db.db["jobs"].insert_one(job_dict)
            job_dict["_id"] = str(result.inserted_id)
            job = Job(**job_dict)

            # 2. Push to Redis
            await self._push_to_redis(job)
            
            # 3. Publish Event
            await redis_client.publish("events:jobs", json.dumps({
                "job_id": job.id,
                "status": job.status,
                "user_id": job.user_id
            }))
            
            return job
        except Exception as e:
            print(f"ERROR ENQUEUING JOB: {e}")
            import traceback
            traceback.print_exc()
            raise e

    async def retry_job(self, job_id: str):
        from bson import ObjectId
        
        # Fetch job
        job_data = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
        if not job_data:
            return False
            
        # Reset basic fields
        job_data["status"] = JobStatus.QUEUED
        job_data["retry_count"] = 0
        job_data["error"] = None
        job_data["scheduled_at"] = None # Reset delay if it was a delayed job
        
        # Update DB
        await db.db["jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {
                "status": JobStatus.QUEUED, 
                "retry_count": 0, 
                "error": None,
                "scheduled_at": None,
                "created_at": datetime.utcnow() # Reset time to now for sorting
            }}
        )
        
        job_data["_id"] = str(job_data["_id"])
        job = Job(**job_data)
        
        # Push to Redis
        await self._push_to_redis(job)
        
        # Notify
        await redis_client.publish("events:jobs", json.dumps({
            "job_id": job.id,
            "status": "queued",
            "user_id": job.user_id,
            "msg": "Job Manually Retried"
        }))
        return True

    async def cancel_job(self, job_id: str):
        from bson import ObjectId
        
        job_data = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
        if not job_data:
            return False

        # Try to remove from Redis if possible 
        # (Note: Removing from List is expensive O(N), usually we just let it fail/check status on pop)
        # But we CAN easily remove from Delayed ZSET
        if job_data.get("status") == JobStatus.DELAYED:
            await redis_client.zrem("queue:delayed", job_id)

        # Update DB Status
        await db.db["jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"status": "cancelled"}}
        )

        await redis_client.publish("events:jobs", json.dumps({
            "job_id": job_id,
            "status": "cancelled",
            "user_id": job_data.get("user_id", "unknown")
        }))
        return True

    async def boost_job(self, job_id: str):
        from bson import ObjectId
        
        job_data = await db.db["jobs"].find_one({"_id": ObjectId(job_id)})
        if not job_data or job_data["status"] not in [JobStatus.QUEUED, JobStatus.DELAYED]:
            return False
            
        old_priority = job_data.get("priority", 2)
        if old_priority == 3:
            return True # Already high priority
            
        # 1. Remove from old queue/set
        if job_data["status"] == JobStatus.DELAYED:
            await redis_client.zrem("queue:delayed", job_id)
        else:
            old_queue = self._get_queue_key(old_priority)
            await redis_client.lrem(old_queue, 0, job_id)
            
        # 2. Update DB
        await db.db["jobs"].update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {
                "priority": 3,
                "status": JobStatus.QUEUED,
                "scheduled_at": None,
                "msg": "Boosted"
            }}
        )
        
        # 3. Push to High Priority Queue (Right/Tail for FIFO immediate consumption)
        await redis_client.rpush("queue:immediate:high", job_id)
        
        await redis_client.publish("events:jobs", json.dumps({
            "job_id": job_id,
            "status": "queued",
            "priority": 3,
            "msg": "Job Boosted! ⚡"
        }))
        return True
        return True
    
    async def _push_to_redis(self, job: Job):
        if job.scheduled_at:
            # Add to Delayed ZSET
            score = job.scheduled_at.timestamp()
            await redis_client.zadd("queue:delayed", {str(job.id): score})
        else:
            # Add to Priority Queue
            queue_key = self._get_queue_key(job.priority)
            await redis_client.lpush(queue_key, str(job.id))

    def _get_queue_key(self, priority: int) -> str:
        if priority == 3: return "queue:immediate:high"
        if priority == 1: return "queue:immediate:low"
        return "queue:immediate:normal"

queue_service = QueueService()
