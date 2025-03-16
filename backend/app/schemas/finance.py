from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    income = "income"
    expense = "expense"

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    type: TransactionType
    category: str
    description: Optional[str] = None
    date: datetime
    payment_method: Optional[str] = None

class TransactionCreate(TransactionBase):
    user_id: str

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[TransactionType] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    payment_method: Optional[str] = None

class TransactionInDB(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_deleted: bool = False

class Transaction(TransactionInDB):
    pass

class FinancialGoalBase(BaseModel):
    title: str
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(0, ge=0)
    deadline: Optional[datetime] = None
    category: str

class FinancialGoalCreate(FinancialGoalBase):
    user_id: str

class FinancialGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    deadline: Optional[datetime] = None
    category: Optional[str] = None

class FinancialGoalInDB(FinancialGoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_deleted: bool = False

class FinancialGoal(FinancialGoalInDB):
    pass 