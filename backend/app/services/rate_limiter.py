from app.core.redis import redis_client
from fastapi import HTTPException

class RateLimiter:
    def __init__(self, limit: int = 10, window: int = 60):
        self.limit = limit
        self.window = window

    async def is_allowed(self, user_id: str) -> bool:
        try:
            key = f"ratelimit:{user_id}"
            current = await redis_client.incr(key)
            if current == 1:
                await redis_client.expire(key, self.window)
            
            return current <= self.limit
        except Exception as e:
            print(f"Rate Limiter Error (Allowing Request): {e}")
            return True

rate_limiter = RateLimiter()
