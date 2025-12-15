from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId

from typing import Annotated
from pydantic import BeforeValidator

# Pydantic v2 compatible ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class JobStatus(str, Enum):
    QUEUED = "queued"
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    DELAYED = "delayed"

class JobPriority(int, Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3

class JobCreate(BaseModel):
    type: str
    payload: Dict[str, Any]
    priority: JobPriority = JobPriority.NORMAL
    scheduled_at: Optional[datetime] = None
    user_id: str

class Job(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    status: JobStatus = JobStatus.QUEUED
    type: str
    payload: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    priority: JobPriority
    created_at: datetime = Field(default_factory=datetime.utcnow)
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    user_id: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
