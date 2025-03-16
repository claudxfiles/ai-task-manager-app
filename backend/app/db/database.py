from supabase import create_client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_supabase_client():
    """
    Crea y devuelve un cliente de Supabase
    """
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
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
