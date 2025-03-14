from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db, supabase
from ..models import Goal
from ..schemas import GoalCreate, GoalUpdate, GoalResponse
from ..auth import get_current_user

router = APIRouter()

@router.get("/goals", response_model=List[GoalResponse])
async def get_goals(current_user = Depends(get_current_user)):
    try:
        response = await supabase.table('goals').select("*").eq('user_id', current_user.id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las metas: {str(e)}"
        )

@router.post("/goals", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, current_user = Depends(get_current_user)):
    try:
        goal_data = goal.dict()
        goal_data["user_id"] = current_user.id
        
        response = await supabase.table('goals').insert(goal_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la meta: {str(e)}"
        )

@router.put("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, goal_update: GoalUpdate, current_user = Depends(get_current_user)):
    try:
        # Verificar que la meta existe y pertenece al usuario
        goal = await supabase.table('goals').select("*").eq('id', goal_id).eq('user_id', current_user.id).execute()
        if not goal.data:
            raise HTTPException(status_code=404, detail="Meta no encontrada")
        
        # Actualizar la meta
        response = await supabase.table('goals').update(goal_update.dict(exclude_unset=True)).eq('id', goal_id).execute()
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar la meta: {str(e)}"
        )

@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user = Depends(get_current_user)):
    try:
        # Verificar que la meta existe y pertenece al usuario
        goal = await supabase.table('goals').select("*").eq('id', goal_id).eq('user_id', current_user.id).execute()
        if not goal.data:
            raise HTTPException(status_code=404, detail="Meta no encontrada")
        
        # Eliminar la meta
        await supabase.table('goals').delete().eq('id', goal_id).execute()
        return {"message": "Meta eliminada correctamente"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la meta: {str(e)}"
        ) 