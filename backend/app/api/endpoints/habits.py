from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List, Optional
from datetime import datetime, date, timedelta
import uuid

from app.services.auth import get_current_user
from app.schemas.user import User
from app.schemas.habits import Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate
from app.db.database import get_supabase_client

router = APIRouter()

@router.get("/", response_model=List[Habit])
async def read_habits(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todos los hábitos del usuario actual
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("habits") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not response.data:
            return []
        
        return [Habit(**habit) for habit in response.data]
    except Exception as e:
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
    supabase = get_supabase_client()
    
    try:
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
            "is_deleted": False,
            "streak": 0,
            "best_streak": 0,
            "total_completions": 0
        }
        
        response = supabase.table("habits").insert(habit_db).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el hábito"
            )
        
        return Habit(**response.data[0])
    except Exception as e:
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
            .eq("is_deleted", False) \
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
            .eq("is_deleted", False) \
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
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        get_response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not get_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        # Realizar soft delete del hábito
        delete_data = {
            "is_deleted": True,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        delete_response = supabase.table("habits") \
            .update(delete_data) \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not delete_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al eliminar el hábito"
            )
        
        return Habit(**delete_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el hábito: {str(e)}"
        )

# Endpoints para registros de hábitos
@router.get("/{habit_id}/logs", response_model=List[HabitLog])
async def read_habit_logs(
    habit_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene los registros de un hábito específico, con filtros opcionales por fecha
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar primero que el hábito existe y pertenece al usuario
        habit_response = supabase.table("habits") \
            .select("id") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not habit_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        # Consultar los logs
        query = supabase.table("habit_logs") \
            .select("*") \
            .eq("habit_id", habit_id) \
            .eq("user_id", current_user.id)
        
        if from_date:
            query = query.gte("date", from_date.isoformat())
        
        if to_date:
            query = query.lte("date", to_date.isoformat())
        
        logs_response = query.order("date", desc=True).execute()
        
        if not logs_response.data:
            return []
        
        return [HabitLog(**log) for log in logs_response.data]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registros del hábito: {str(e)}"
        )

@router.post("/{habit_id}/logs", response_model=HabitLog)
async def create_habit_log(
    habit_id: str,
    log_in: HabitLogCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea un nuevo registro para un hábito específico
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar primero que el hábito existe y pertenece al usuario
        habit_response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not habit_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hábito no encontrado"
            )
        
        habit = habit_response.data[0]
        
        # Verificar si ya existe un log para la fecha proporcionada
        log_date = log_in.date.isoformat() if isinstance(log_in.date, date) else log_in.date
        existing_log_response = supabase.table("habit_logs") \
            .select("id") \
            .eq("habit_id", habit_id) \
            .eq("user_id", current_user.id) \
            .eq("date", log_date) \
            .execute()
        
        if existing_log_response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un registro para esta fecha"
            )
        
        # Crear el registro
        log_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        log_data = {
            "id": log_id,
            "habit_id": habit_id,
            "user_id": current_user.id,
            "date": log_date,
            "completed": log_in.completed,
            "notes": log_in.notes,
            "created_at": now,
            "updated_at": now
        }
        
        log_response = supabase.table("habit_logs").insert(log_data).execute()
        
        if not log_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear el registro del hábito"
            )
        
        # Actualizar estadísticas del hábito si se completó
        if log_in.completed:
            # Obtener todos los logs para calcular el streak actual
            all_logs_response = supabase.table("habit_logs") \
                .select("date, completed") \
                .eq("habit_id", habit_id) \
                .eq("user_id", current_user.id) \
                .eq("completed", True) \
                .order("date", desc=False) \
                .execute()
            
            # Aquí calcular el streak actual, mejor streak y completados totales
            # (Este cálculo puede ser más complejo dependiendo de la frecuencia del hábito)
            total_completions = len([l for l in all_logs_response.data if l["completed"]])
            
            # Actualizar el hábito con las nuevas estadísticas
            habit_update = {
                "updated_at": now,
                "total_completions": total_completions,
                # Agregar cálculos de streak aquí
            }
            
            supabase.table("habits") \
                .update(habit_update) \
                .eq("id", habit_id) \
                .eq("user_id", current_user.id) \
                .execute()
        
        return HabitLog(**log_response.data[0])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el registro del hábito: {str(e)}"
        ) 