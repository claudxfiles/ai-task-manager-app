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
security = HTTPBearer(auto_error=False)  # Cambiado a auto_error=False para manejar caso sin token

# Clave secreta para JWT (obtenida de las variables de entorno)
SECRET_KEY = settings.SUPABASE_JWT_SECRET or os.environ.get("SUPABASE_JWT_SECRET", "your_secret_key_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Variable para modo de desarrollo (permitir acceso sin autenticación)
DEV_MODE = os.environ.get("DEV_MODE", "false").lower() == "true"

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

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """
    Obtiene el usuario actual a partir del token JWT
    """
    # Modo de desarrollo: permitir acceso sin autenticación para testing
    if DEV_MODE:
        logger.warning("Acceso sin autenticación permitido (DEV_MODE=true)")
        # Devolver un usuario mock para desarrollo
        return User(
            id="dev-user-id",
            email="dev@example.com",
            full_name="Developer User",
            avatar_url=None,
            email_notifications=True,
            subscription_tier="free",
            created_at=None,
            updated_at=None
        )
    
    # Si no hay credenciales, rechazar el acceso
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionaron credenciales",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        # Primero intentar decodificar con nuestra clave
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.InvalidTokenError:
            # Si falla, es posible que sea un token directo de Supabase
            # Verificarlo con el cliente de Supabase
            client = get_supabase_client()
            response = client.auth.get_user(token)
            
            if response.user:
                # Crear usuario a partir de la respuesta de Supabase
                return User(
                    id=response.user.id,
                    email=response.user.email or "",
                    full_name=response.user.user_metadata.get("full_name", ""),
                    avatar_url=response.user.user_metadata.get("avatar_url"),
                    email_notifications=True,
                    subscription_tier="free",
                    created_at=None,
                    updated_at=None
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        
        # Verificar que el token no ha expirado
        if datetime.fromtimestamp(payload["exp"]) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
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

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verifica que el usuario actual esté activo.
    En una implementación real, esto debería verificar en la base de datos
    si el usuario tiene el estado 'activo'.
    """
    # Aquí podríamos hacer una verificación adicional si el usuario está activo
    # Por ahora, simplemente pasamos el usuario tal como está
    return current_user 