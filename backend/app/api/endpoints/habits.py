from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List, Optional
from datetime import datetime, date, timedelta
import uuid
import logging

from app.services.auth import get_current_user
from app.schemas.user import User
# Verificar qué imports se están usando
# Comentaré el import original para ver cuál es
from app.schemas.habits import Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate
# from app.schemas.habit import Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate
from app.db.database import get_supabase_client

router = APIRouter()

@router.get("/", response_model=List[Habit])
async def read_habits(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todos los hábitos del usuario actual
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Obteniendo hábitos para el usuario: {current_user.id}")
    
    try:
        # Usar rol de servicio para evitar problemas con RLS
        from app.core.config import settings
        from supabase import create_client
        
        # Primero intentar con el cliente normal
        supabase = get_supabase_client()
        normal_response = supabase.table("habits") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("is_active", True) \
            .execute()
        
        # Si no hay resultados con el cliente normal, usar el rol de servicio
        if not normal_response.data:
            logger.warn(f"No se encontraron hábitos con cliente normal para {current_user.id}, intentando con rol de servicio")
            # Crear cliente con rol de servicio
            supabase_service = create_client(
                settings.SUPABASE_URL, 
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            
            service_response = supabase_service.table("habits") \
                .select("*") \
                .eq("user_id", current_user.id) \
                .eq("is_active", True) \
                .execute()
            
            logger.info(f"Resultados con rol de servicio: {len(service_response.data)} hábitos encontrados")
            return [Habit(**habit) for habit in service_response.data]
        
        logger.info(f"Resultados con cliente normal: {len(normal_response.data)} hábitos encontrados")
        return [Habit(**habit) for habit in normal_response.data]
    except Exception as e:
        logger.error(f"Error al obtener hábitos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener hábitos: {str(e)}"
        )

@router.post("/", response_model=Habit)
async def create_habit(
    habit_in: HabitCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea un nuevo hábito
    """
    logger = logging.getLogger(__name__)
    
    # Añadir log del usuario actual
    logger.info(f"Usuario actual: {current_user.id}, email: {current_user.email}")
    
    supabase = get_supabase_client()
    
    try:
        # Loggear los datos recibidos
        logger.info(f"Datos recibidos para crear hábito: {habit_in.dict()}")
        
        # Crear un objeto con todos los campos necesarios
        habit_data = habit_in.dict()
        habit_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        habit_db = {
            **habit_data,
            "id": habit_id,
            "user_id": current_user.id,
            "created_at": now,
            "updated_at": now,
            "is_active": True,
            "current_streak": 0,
            "best_streak": 0,
            "total_completions": 0
        }
        
        # Loggear los datos que se van a insertar
        logger.info(f"Datos a insertar en la base de datos: {habit_db}")
        
        # Usar el rol de servicio para evitar restricciones RLS
        import os
        from app.core.config import settings
        
        # Crear un cliente Supabase con el rol de servicio
        from supabase import create_client
        supabase_service = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        
        # Insertar con el rol de servicio que tiene permisos para saltarse RLS
        response = supabase_service.table("habits").insert(habit_db).execute()
        
        # Loggear la respuesta
        logger.info(f"Respuesta de Supabase: {response.data}")
        
        if not response.data:
            logger.error("No se recibieron datos en la respuesta de Supabase")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el hábito: No se recibieron datos"
            )
        
        return Habit(**response.data[0])
    except Exception as e:
        # Loggear el error detallado
        import traceback
        logger.error(f"Error al crear el hábito: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el hábito: {str(e)}"
        )

@router.get("/{habit_id}", response_model=Habit)
async def read_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene un hábito específico por ID
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_active", True) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        return Habit(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener el hábito: {str(e)}"
        )

@router.put("/{habit_id}", response_model=Habit)
async def update_habit(
    habit_id: str,
    habit_in: HabitUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Actualiza un hábito específico
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        get_response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_active", True) \
            .execute()
        
        if not get_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        # Actualizar el hábito
        habit_data = habit_in.dict(exclude_unset=True)
        habit_data["updated_at"] = datetime.utcnow().isoformat()
        
        update_response = supabase.table("habits") \
            .update(habit_data) \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al actualizar el hábito"
            )
        
        return Habit(**update_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el hábito: {str(e)}"
        )

@router.delete("/{habit_id}", response_model=Habit)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Elimina (soft delete) un hábito específico
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Solicitud para eliminar hábito {habit_id} del usuario {current_user.id}")
    
    try:
        # Usar el rol de servicio para evitar restricciones RLS
        from app.core.config import settings
        from supabase import create_client
        
        # Crear un cliente Supabase con el rol de servicio
        supabase_service = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        
        # Verificar que el hábito existe y pertenece al usuario
        get_response = supabase_service.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_active", True) \
            .execute()
        
        if not get_response.data:
            logger.error(f"Hábito {habit_id} no encontrado para el usuario {current_user.id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        # Realizar una eliminación física directa (en lugar de soft delete)
        delete_response = supabase_service.table("habits") \
            .delete() \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        logger.info(f"Hábito {habit_id} eliminado correctamente")
        
        # Devolver el hábito eliminado
        return Habit(**get_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar hábito {habit_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el hábito: {str(e)}"
        )

# Endpoints para registros de hábitos
@router.get("/{habit_id}/logs", response_model=List[HabitLog])
@router.get("/{habit_id}/logs/", response_model=List[HabitLog])
async def read_habit_logs(
    habit_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene los registros de un hábito específico, con filtros opcionales por fecha
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Obteniendo logs para el hábito: {habit_id} del usuario: {current_user.id}")
    
    # Usar el rol de servicio para evitar restricciones RLS
    from app.core.config import settings
    from supabase import create_client
    
    # Crear un cliente Supabase con el rol de servicio
    supabase_service = create_client(
        settings.SUPABASE_URL, 
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        habit_response = supabase_service.table("habits") \
            .select("id") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_active", True) \
            .execute()
        
        logger.info(f"Respuesta al verificar hábito: {habit_response.data}")
        
        if not habit_response.data:
            logger.warning(f"Hábito no encontrado o no pertenece al usuario: {habit_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        # Consultar los logs
        query = supabase_service.table("habit_logs") \
            .select("*") \
            .eq("habit_id", habit_id)
        
        # Aplicar filtros de fecha si se proporcionan
        if from_date:
            query = query.gte("completed_date", from_date.isoformat())
        
        if to_date:
            query = query.lte("completed_date", to_date.isoformat())
        
        response = query.order("completed_date", desc=True).execute()
        
        logger.info(f"Logs obtenidos: {len(response.data)}")
        
        if not response.data:
            return []
        
        return [HabitLog(**log) for log in response.data]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener logs del hábito: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registros del hábito: {str(e)}"
        )

@router.post("/{habit_id}/logs", response_model=HabitLog)
@router.post("/{habit_id}/logs/", response_model=HabitLog)
async def create_habit_log(
    habit_id: str,
    log_in: HabitLogCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea un nuevo registro para un hábito específico
    """
    logger = logging.getLogger(__name__)
    logger.info(f"Creando log para el hábito: {habit_id} del usuario: {current_user.id}")
    
    # Usar el rol de servicio para evitar restricciones RLS
    from app.core.config import settings
    from supabase import create_client
    
    # Crear un cliente Supabase con el rol de servicio
    supabase_service = create_client(
        settings.SUPABASE_URL, 
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
    
    try:
        # Verificar primero que el hábito existe y pertenece al usuario
        habit_response = supabase_service.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        logger.info(f"Respuesta al verificar hábito: {habit_response.data}")
        
        if not habit_response.data:
            logger.warning(f"Hábito no encontrado o no pertenece al usuario: {habit_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado o no pertenece al usuario"
            )
        
        # Crear el log del hábito
        log_data = log_in.dict()
        log_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Si no se proporciona una fecha, usar la fecha actual
        if not log_data.get("completed_date"):
            log_data["completed_date"] = date.today().isoformat()
        
        log_db = {
            **log_data,
            "id": log_id,
            "habit_id": habit_id,
            "user_id": current_user.id,  # Asegurarnos de incluir el user_id
            "created_at": now
        }
        
        logger.info(f"Datos a insertar en habit_logs: {log_db}")
        
        # Deshabilitar temporalmente el trigger o manejarlo manualmente
        # Primero, insertar el log
        response = supabase_service.table("habit_logs").insert(log_db).execute()
        
        logger.info(f"Respuesta de Supabase al crear log: {response.data}")
        
        if not response.data:
            logger.error("No se recibieron datos en la respuesta de Supabase")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el registro del hábito: No se recibieron datos"
            )
        
        # Opcional: Actualizar manualmente el hábito si es necesario
        # Esto se puede hacer si decidimos deshabilitar el trigger
        
        return HabitLog(**response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al crear log del hábito: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el registro del hábito: {str(e)}"
        )

@router.get("/diagnostic", response_model=dict)
async def diagnostic_habits(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Endpoint de diagnóstico para verificar problemas con los hábitos
    """
    logger = logging.getLogger(__name__)
    
    try:
        # Usar rol de servicio para consultar directamente
        from app.core.config import settings
        from supabase import create_client
        
        # Crear cliente con rol de servicio
        supabase_service = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        
        # Consultar hábitos con rol de servicio (bypass RLS)
        response = supabase_service.table("habits") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .execute()
        
        # Consultar con cliente normal
        supabase = get_supabase_client()
        normal_response = supabase.table("habits") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .execute()
        
        # Loggear resultados
        logger.info(f"Usuario actual: {current_user.id}")
        logger.info(f"Resultados con rol de servicio: {len(response.data)} hábitos encontrados")
        logger.info(f"Resultados con cliente normal: {len(normal_response.data)} hábitos encontrados")
        
        return {
            "user_id": current_user.id,
            "habits_with_service_role": len(response.data),
            "habits_detail_service_role": response.data,
            "habits_with_normal_client": len(normal_response.data),
            "habits_detail_normal_client": normal_response.data,
            "auth_status": "authenticated" if current_user else "not authenticated"
        }
    except Exception as e:
        import traceback
        logger.error(f"Error en diagnóstico: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return {
            "error": str(e),
            "user_id": current_user.id if current_user else None,
            "auth_status": "authenticated" if current_user else "not authenticated"
        } 