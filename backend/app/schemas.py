from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Esquemas para metas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    plan: Optional[str] = None
    status: str = "pendiente"

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class GoalPlanGenerate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None

# Otros esquemas existentes... 