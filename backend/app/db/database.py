from supabase import create_client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_supabase_client():
    """
    Crea y devuelve un cliente de Supabase
    """
    try:
        # Usar SUPABASE_ANON_KEY si SUPABASE_KEY está vacío
        supabase_key = settings.SUPABASE_KEY
        if not supabase_key:
            supabase_key = settings.SUPABASE_ANON_KEY
            logger.info("Usando SUPABASE_ANON_KEY como supabase_key")
        
        if not supabase_key:
            raise ValueError("Se requiere una clave de Supabase válida (SUPABASE_KEY o SUPABASE_ANON_KEY)")
            
        supabase = create_client(settings.SUPABASE_URL, supabase_key)
        return supabase
    except Exception as e:
        logger.error(f"Error al conectar con Supabase: {e}")
        raise e

def get_supabase_admin_client():
    """
    Crea y devuelve un cliente de Supabase con permisos de administrador
    """
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        return supabase
    except Exception as e:
        logger.error(f"Error al conectar con Supabase (admin): {e}")
        raise e
