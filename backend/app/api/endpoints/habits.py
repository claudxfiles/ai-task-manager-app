from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List, Optional
from datetime import datetime, date, timedelta
import uuid

from app.services.auth import get_current_user
from app.schemas.user import User
from app.schemas.habit import Habit, HabitCreate, HabitUpdate, HabitLog, HabitLogCreate, HabitLogUpdate
from app.db.database import get_supabase_client

router = APIRouter()

@router.get("/", response_model=List[Habit])
async def read_habits(
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todos los hábitos del usuario actual
    """
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("habits") \
            .select("*") \
            .eq("user_id", current_user.id)
        
        if category:
            query = query.eq("category", category)
        
        response = query.execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener hábitos: {str(e)}"
        )

@router.post("/", response_model=Habit)
async def create_habit(
    habit: HabitCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea un nuevo hábito
    """
    supabase = get_supabase_client()
    
    try:
        now = datetime.utcnow().isoformat()
        habit_id = str(uuid.uuid4())
        
        habit_data = {
            "id": habit_id,
            "user_id": current_user.id,
            "title": habit.title,
            "description": habit.description,
            "frequency": habit.frequency,
            "specific_days": habit.specific_days,
            "category": habit.category,
            "reminder_time": habit.reminder_time,
            "cue": habit.cue,
            "reward": habit.reward,
            "current_streak": 0,
            "best_streak": 0,
            "created_at": now,
            "updated_at": now
        }
        
        response = supabase.table("habits").insert(habit_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el hábito"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear hábito: {str(e)}"
        )

@router.get("/{habit_id}", response_model=Habit)
async def read_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene un hábito específico
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hábito con id {habit_id} no encontrado"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener hábito: {str(e)}"
        )

@router.put("/{habit_id}", response_model=Habit)
async def update_habit(
    habit_id: str,
    habit: HabitUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Actualiza un hábito
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        check_response = supabase.table("habits") \
            .select("id") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hábito con id {habit_id} no encontrado"
            )
        
        # Preparar datos para actualizar
        update_data = {k: v for k, v in habit.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Actualizar el hábito
        response = supabase.table("habits") \
            .update(update_data) \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar hábito: {str(e)}"
        )

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user)
) -> None:
    """
    Elimina un hábito
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        check_response = supabase.table("habits") \
            .select("id") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hábito con id {habit_id} no encontrado"
            )
        
        # Eliminar el hábito
        supabase.table("habits") \
            .delete() \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        return
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar hábito: {str(e)}"
        )

# Endpoints para registros de hábitos (logs)

@router.post("/{habit_id}/logs", response_model=HabitLog)
async def create_habit_log(
    habit_id: str,
    log: HabitLogCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Registra una completitud de hábito
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        check_response = supabase.table("habits") \
            .select("*") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hábito con id {habit_id} no encontrado"
            )
        
        habit = check_response.data[0]
        
        # Verificar si ya existe un registro para esta fecha
        log_check = supabase.table("habit_logs") \
            .select("id") \
            .eq("habit_id", habit_id) \
            .eq("completed_date", log.completed_date.isoformat()) \
            .execute()
        
        if log_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un registro para este hábito en la fecha {log.completed_date}"
            )
        
        # Crear el registro
        log_id = str(uuid.uuid4())
        log_data = {
            "id": log_id,
            "habit_id": habit_id,
            "completed_date": log.completed_date.isoformat(),
            "notes": log.notes,
            "quality_rating": log.quality_rating,
            "emotion": log.emotion,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("habit_logs").insert(log_data).execute()
        
        # Actualizar el streak (racha) del hábito
        yesterday = date.today() - timedelta(days=1)
        yesterday_log = supabase.table("habit_logs") \
            .select("id") \
            .eq("habit_id", habit_id) \
            .eq("completed_date", yesterday.isoformat()) \
            .execute()
        
        current_streak = habit.get("current_streak", 0)
        best_streak = habit.get("best_streak", 0)
        
        # Si es hoy o ayer, aumentar la racha
        if log.completed_date == date.today() or (yesterday_log.data and log.completed_date == yesterday):
            current_streak += 1
        else:
            # Reiniciar racha si hay un hueco
            current_streak = 1
        
        # Actualizar mejor racha si corresponde
        if current_streak > best_streak:
            best_streak = current_streak
        
        # Actualizar el hábito con la nueva información de racha
        supabase.table("habits") \
            .update({
                "current_streak": current_streak,
                "best_streak": best_streak,
                "updated_at": datetime.utcnow().isoformat()
            }) \
            .eq("id", habit_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar completitud de hábito: {str(e)}"
        )

@router.get("/{habit_id}/logs", response_model=List[HabitLog])
async def read_habit_logs(
    habit_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene los registros de un hábito
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que el hábito existe y pertenece al usuario
        check_response = supabase.table("habits") \
            .select("id") \
            .eq("id", habit_id) \
            .eq("user_id", current_user.id) \
            .execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hábito con id {habit_id} no encontrado"
            )
        
        # Consultar los registros
        query = supabase.table("habit_logs") \
            .select("*") \
            .eq("habit_id", habit_id)
        
        if start_date:
            query = query.gte("completed_date", start_date.isoformat())
        
        if end_date:
            query = query.lte("completed_date", end_date.isoformat())
        
        response = query.order("completed_date", desc=True).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener registros de hábito: {str(e)}"
        ) 