from typing import Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import ValidationError

from app.core.config import settings
from app.db.database import get_supabase_client
from app.schemas.user import User, TokenPayload
from app.utils.security import verify_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Autentica un usuario verificando su email y contraseña
    """
    supabase = get_supabase_client()
    
    try:
        # Intentar autenticar con Supabase
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user = response.user
        
        if not user:
            return None
        
        # Obtener datos del perfil
        profile_response = supabase.table("profiles").select("*").eq("id", user.id).execute()
        
        if not profile_response.data:
            return None
        
        profile = profile_response.data[0]
        
        # Crear objeto de usuario
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": profile.get("full_name"),
            "avatar_url": profile.get("avatar_url"),
            "email_notifications": profile.get("email_notifications", True),
            "subscription_tier": profile.get("subscription_tier", "free"),
            "created_at": user.created_at,
            "updated_at": profile.get("updated_at")
        }
        
        return User(**user_data)
    except Exception as e:
        print(f"Error de autenticación: {e}")
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Obtiene el usuario actual a partir del token JWT
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodificar el token
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
        
        # Verificar que el token no ha expirado
        if datetime.fromtimestamp(token_data.exp) < datetime.now():
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception
    
    # Obtener el usuario de la base de datos
    supabase = get_supabase_client()
    
    try:
        # Obtener datos del usuario
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        
        if not user:
            raise credentials_exception
        
        # Obtener datos del perfil
        profile_response = supabase.table("profiles").select("*").eq("id", user.id).execute()
        
        if not profile_response.data:
            raise credentials_exception
        
        profile = profile_response.data[0]
        
        # Crear objeto de usuario
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": profile.get("full_name"),
            "avatar_url": profile.get("avatar_url"),
            "email_notifications": profile.get("email_notifications", True),
            "subscription_tier": profile.get("subscription_tier", "free"),
            "created_at": user.created_at,
            "updated_at": profile.get("updated_at")
        }
        
        return User(**user_data)
    except Exception as e:
        print(f"Error al obtener usuario: {e}")
        raise credentials_exception
