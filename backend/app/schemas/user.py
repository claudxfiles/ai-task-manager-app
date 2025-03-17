from pydantic import BaseModel, EmailStr, Field, UUID4
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    """Esquema base para usuarios"""
    email: EmailStr
    name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    """Esquema para crear un usuario"""
    password: str

class UserUpdate(BaseModel):
    """Esquema para actualizar un usuario"""
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    """Modelo de usuario en la base de datos"""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    hashed_password: str

class User(UserBase):
    """Modelo de usuario para API responses"""
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserProfile(BaseModel):
    """Perfil extendido del usuario"""
    id: str
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    subscription_tier: str = "free"
    email_notifications: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    preferences: Optional[Dict[str, Any]] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: str
    exp: int
