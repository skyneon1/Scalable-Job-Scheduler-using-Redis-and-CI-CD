from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URL)
        self.db = self.client[settings.MONGO_DB_NAME]
        print("Connected to MongoDB")

    def close(self):
        self.client.close()
        print("Disconnected from MongoDB")

db = Database()

async def get_database():
    return db.db
