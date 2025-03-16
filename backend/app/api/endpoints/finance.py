from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List, Optional
from datetime import datetime
import uuid

from app.services.auth import get_current_user
from app.schemas.user import User
from app.schemas.finance import Transaction, TransactionCreate, TransactionUpdate, FinancialGoal, FinancialGoalCreate, FinancialGoalUpdate
from app.db.database import get_supabase_client

router = APIRouter()

# Endpoints para transacciones
@router.get("/transactions", response_model=List[Transaction])
async def read_transactions(
    transaction_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todas las transacciones del usuario actual
    """
    supabase = get_supabase_client()
    
    try:
        query = supabase.table("transactions") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False)
        
        if transaction_type:
            query = query.eq("type", transaction_type)
        
        response = query.order("date", desc=True).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener transacciones: {str(e)}"
        )

@router.post("/transactions", response_model=Transaction)
async def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea una nueva transacción
    """
    supabase = get_supabase_client()
    
    try:
        transaction_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "amount": transaction_in.amount,
            "type": transaction_in.type,
            "category": transaction_in.category,
            "description": transaction_in.description,
            "date": transaction_in.date.isoformat(),
            "payment_method": transaction_in.payment_method,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_deleted": False
        }
        
        response = supabase.table("transactions").insert(transaction_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear la transacción"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear transacción: {str(e)}"
        )

@router.get("/transactions/{transaction_id}", response_model=Transaction)
async def read_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene una transacción específica
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("transactions") \
            .select("*") \
            .eq("id", transaction_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transacción no encontrada"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener transacción: {str(e)}"
        )

@router.put("/transactions/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Actualiza una transacción
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la transacción existe y pertenece al usuario
        transaction_response = supabase.table("transactions") \
            .select("*") \
            .eq("id", transaction_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not transaction_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transacción no encontrada"
            )
        
        # Preparar datos para actualizar
        update_data = {k: v for k, v in transaction_in.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Si hay una fecha, convertirla a ISO
        if "date" in update_data and update_data["date"]:
            update_data["date"] = update_data["date"].isoformat()
        
        # Actualizar la transacción
        response = supabase.table("transactions") \
            .update(update_data) \
            .eq("id", transaction_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar transacción: {str(e)}"
        )

@router.delete("/transactions/{transaction_id}", response_model=Transaction)
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Elimina una transacción (marcándola como eliminada)
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la transacción existe y pertenece al usuario
        transaction_response = supabase.table("transactions") \
            .select("*") \
            .eq("id", transaction_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not transaction_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transacción no encontrada"
            )
        
        # Marcar como eliminada
        response = supabase.table("transactions") \
            .update({
                "is_deleted": True,
                "updated_at": datetime.now().isoformat()
            }) \
            .eq("id", transaction_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar transacción: {str(e)}"
        )

# Endpoints para metas financieras
@router.get("/goals", response_model=List[FinancialGoal])
async def read_financial_goals(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todas las metas financieras del usuario actual
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("financial_goals") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener metas financieras: {str(e)}"
        )

@router.post("/goals", response_model=FinancialGoal)
async def create_financial_goal(
    goal_in: FinancialGoalCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea una nueva meta financiera
    """
    supabase = get_supabase_client()
    
    try:
        goal_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "title": goal_in.title,
            "target_amount": goal_in.target_amount,
            "current_amount": goal_in.current_amount,
            "deadline": goal_in.deadline.isoformat() if goal_in.deadline else None,
            "category": goal_in.category,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_deleted": False
        }
        
        response = supabase.table("financial_goals").insert(goal_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear la meta financiera"
            )
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear meta financiera: {str(e)}"
        )

@router.put("/goals/{goal_id}", response_model=FinancialGoal)
async def update_financial_goal(
    goal_id: str,
    goal_in: FinancialGoalUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Actualiza una meta financiera
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la meta existe y pertenece al usuario
        goal_response = supabase.table("financial_goals") \
            .select("*") \
            .eq("id", goal_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not goal_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta financiera no encontrada"
            )
        
        # Preparar datos para actualizar
        update_data = {k: v for k, v in goal_in.dict(exclude_unset=True).items()}
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Si hay una fecha límite, convertirla a ISO
        if "deadline" in update_data and update_data["deadline"]:
            update_data["deadline"] = update_data["deadline"].isoformat()
        
        # Actualizar la meta
        response = supabase.table("financial_goals") \
            .update(update_data) \
            .eq("id", goal_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar meta financiera: {str(e)}"
        )

@router.delete("/goals/{goal_id}", response_model=FinancialGoal)
async def delete_financial_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Elimina una meta financiera (marcándola como eliminada)
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la meta existe y pertenece al usuario
        goal_response = supabase.table("financial_goals") \
            .select("*") \
            .eq("id", goal_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not goal_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meta financiera no encontrada"
            )
        
        # Marcar como eliminada
        response = supabase.table("financial_goals") \
            .update({
                "is_deleted": True,
                "updated_at": datetime.now().isoformat()
            }) \
            .eq("id", goal_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar meta financiera: {str(e)}"
        )
