from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Goal, Task
from ..services.ai import analyze_message_for_goal, make_openrouter_request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import os

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    model: str = "qwen/qwq-32b:online"

class TaskCreate(BaseModel):
    title: str
    description: str
    due_date: str
    priority: str

async def create_goal_with_tasks(goal_data: dict, user_id: int, db: Session):
    """
    Crea una meta y sus tareas asociadas en la base de datos
    """
    try:
        # Crear la meta
        goal = Goal(
            title=goal_data["title"],
            description=goal_data["description"],
            category=goal_data["category"],
            status=goal_data["status"],
            user_id=user_id,
            resources=json.dumps(goal_data.get("resources", []))  # Guardar recursos generales
        )
        db.add(goal)
        db.commit()
        db.refresh(goal)

        # Crear las tareas asociadas con sus recursos
        for task_data in goal_data["tasks"]:
            task = Task(
                title=task_data["title"],
                description=task_data["description"],
                due_date=datetime.strptime(task_data["due_date"], "%Y-%m-%d"),
                priority=task_data["priority"],
                goal_id=goal.id,
                user_id=user_id,
                status="pendiente",
                resources=json.dumps(task_data.get("resources", []))  # Guardar recursos de la tarea
            )
            db.add(task)
        
        db.commit()
        return goal
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear la meta: {str(e)}"
        )

@router.post("")
async def chat(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para procesar mensajes de chat y detectar metas de forma natural
    """
    try:
        # Analizar el mensaje para detectar metas potenciales
        analysis = await analyze_message_for_goal(chat_message.message)
        
        # Si se detectó una meta, crearla silenciosamente
        if analysis["is_goal"] and analysis["goal_data"]:
            try:
                await create_goal_with_tasks(analysis["goal_data"], current_user.id, db)
            except Exception as e:
                print(f"Error creando meta: {str(e)}")
                # No interrumpimos la conversación si hay un error al crear la meta
        
        # Devolver solo la respuesta conversacional
        return {
            "response": analysis["conversation_response"]
        }
        
    except Exception as e:
        print(f"Error en el endpoint de chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 