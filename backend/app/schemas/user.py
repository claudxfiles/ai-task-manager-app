from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    email_notifications: Optional[bool] = None
    subscription_tier: Optional[str] = None

class UserInDB(UserBase):
    id: str
    avatar_url: Optional[str] = None
    email_notifications: bool = True
    subscription_tier: str = "free"
    created_at: datetime
    updated_at: Optional[datetime] = None

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    exp: int
