from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging
import os
from datetime import datetime, timedelta
from app.db.database import get_supabase_client
from app.schemas.user import User
from app.core.config import settings

# Configuración del logger
logger = logging.getLogger(__name__)

# Configuración del bearer token
security = HTTPBearer()

# Clave secreta para JWT (obtenida de las variables de entorno)
SECRET_KEY = settings.SUPABASE_JWT_SECRET or os.environ.get("SUPABASE_JWT_SECRET", "your_secret_key_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def get_db():
    """
    Crea una sesión de base de datos
    En este caso, al usar Supabase, retornamos el cliente de Supabase
    """
    client = get_supabase_client()
    try:
        yield client
    finally:
        # En caso de usar SQLAlchemy, aquí se cerraría la sesión
        pass

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Obtiene el usuario actual a partir del token JWT
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verificar que el token no ha expirado
        if datetime.fromtimestamp(payload["exp"]) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # En una aplicación real, aquí se buscaría el usuario en la base de datos
        # y se verificaría si está activo, etc.
        
        # Crear un objeto User con los datos del token
        user = User(
            id=payload.get("sub"),
            email=payload.get("email", ""),
            full_name=payload.get("name"),
            avatar_url=None,
            email_notifications=True,
            subscription_tier="free",
            created_at=None,
            updated_at=None
        )
        
        return user
    except jwt.PyJWTError as e:
        logger.error(f"Error al decodificar el token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        ) 