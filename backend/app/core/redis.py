import redis.asyncio as redis
from app.core.config import settings

# We support TWO modes:
# 1. Standard Redis (TCP) - Recommended for heavy loads and blocking pops
# 2. Upstash HTTP (REST) - Great for Serverless/Vercel where TCP is flaky

if settings.UPSTASH_REDIS_REST_URL and settings.UPSTASH_REDIS_REST_TOKEN:
    # Use Upstash HTTP Client (Serverless friendly)
    from upstash_redis.asyncio import Redis as UpstashRedis
    print("🚀 Using Upstash HTTP Redis (Serverless Mode)")
    redis_client = UpstashRedis(
        url=settings.UPSTASH_REDIS_REST_URL,
        token=settings.UPSTASH_REDIS_REST_TOKEN
    )
else:
    # Use Standard TCP Redis
    print("🔌 Using Standard TCP Redis")
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        password=settings.REDIS_PASSWORD,
        decode_responses=True
    )

async def get_redis():
    return redis_client
