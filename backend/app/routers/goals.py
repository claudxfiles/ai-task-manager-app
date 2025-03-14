from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Goal, Task
from ..services.ai import generate_goal_plan
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    status: str = "pendiente"

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    plan: Optional[str] = None

@router.get("")
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las metas del usuario actual
    """
    try:
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        return goals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las metas: {str(e)}"
        )

@router.post("")
async def create_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva meta para el usuario actual
    """
    try:
        # Generar plan con IA
        plan = await generate_goal_plan(goal.title, goal.category, goal.description)
        
        # Crear la meta en la base de datos
        db_goal = Goal(
            title=goal.title,
            description=goal.description,
            category=goal.category,
            status=goal.status,
            plan=plan,
            user_id=current_user.id
        )
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        return db_goal
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la meta: {str(e)}"
        )

@router.patch("/{goal_id}")
async def update_goal(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza una meta existente
    """
    try:
        # Verificar que la meta existe y pertenece al usuario
        db_goal = db.query(Goal).filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        ).first()
        
        if not db_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta no encontrada"
            )
        
        # Actualizar solo los campos proporcionados
        update_data = goal_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_goal, field, value)
        
        db.commit()
        db.refresh(db_goal)
        return db_goal
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la meta: {str(e)}"
        )

@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina una meta existente
    """
    try:
        # Verificar que la meta existe y pertenece al usuario
        db_goal = db.query(Goal).filter(
            Goal.id == goal_id,
            Goal.user_id == current_user.id
        ).first()
        
        if not db_goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta no encontrada"
            )
        
        # Eliminar la meta
        db.delete(db_goal)
        db.commit()
        return {"message": "Meta eliminada correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la meta: {str(e)}"
        ) 