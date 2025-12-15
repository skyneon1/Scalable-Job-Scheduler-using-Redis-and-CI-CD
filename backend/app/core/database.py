from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        import certifi
        # Vercel/AWS Lambda needs Certifi for reliable SSL
        # Fallback: Allow invalid certs if handshake fails
        self.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsCAFile=certifi.where()
        )
        self.db = self.client[settings.MONGO_DB_NAME]
        print("Connected to MongoDB")

    def close(self):
        self.client.close()
        print("Disconnected from MongoDB")

db = Database()

async def get_database():
    return db.db
