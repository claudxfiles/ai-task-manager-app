from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
from .models import Task as TaskModel, TaskStatus, TaskPriority, AISuggestion
from .auth import get_current_user
from .database import get_db
from openai import AsyncOpenAI
import httpx
import os
from .enums import TaskStatus as TaskStatusEnum, TaskPriority as TaskPriorityEnum

router = APIRouter()

# Create httpx client
http_client = httpx.AsyncClient()

# Create OpenAI client
ai_client = AsyncOpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url=os.getenv("BASE_URL"),
    http_client=http_client
)

# Modelos Pydantic
class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.TODO
    priority: TaskPriorityEnum = TaskPriorityEnum.MEDIUM
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    project_id: Optional[int] = None
    parent_task_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    user_id: int

    class Config:
        orm_mode = True

@router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = TaskModel(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Generar sugerencias de IA
    await generate_ai_suggestions(db_task, db)
    
    return db_task

@router.get("/tasks", response_model=List[Task])
async def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(TaskModel).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in task.dict(exclude_unset=True).items():
        setattr(db_task, field, value)
    
    if task.status == TaskStatusEnum.DONE and not db_task.completed_at:
        db_task.completed_at = datetime.utcnow()
    elif task.status != TaskStatusEnum.DONE:
        db_task.completed_at = None
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(TaskModel).filter(TaskModel.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

async def generate_ai_suggestions(task: TaskModel, db: Session):
    """Genera sugerencias de IA para una tarea."""
    prompt = f"""
    Analiza esta tarea y proporciona sugerencias útiles:
    
    Título: {task.title}
    Descripción: {task.description}
    Prioridad: {task.priority}
    Fecha límite: {task.due_date}
    
    Por favor, proporciona:
    1. Posibles subtareas
    2. Sugerencias de mejora
    3. Estimación de tiempo
    4. Prioridad recomendada
    """
    
    try:
        response = await ai_client.chat.completions.create(
            model="qwen/qwq-32b:online",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            extra_body={
                "provider": {
                    "order": ["Groq", "Fireworks"],
                    "allow_fallbacks": False
                }
            }
        )
        
        suggestion = AISuggestion(
            task_id=task.id,
            suggestion_type="comprehensive",
            content=response.choices[0].message.content
        )
        
        db.add(suggestion)
        db.commit()
        
    except Exception as e:
        print(f"Error generating AI suggestions: {e}")

@router.get("/tasks/{task_id}/suggestions")
async def get_task_suggestions(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).filter(
        TaskModel.id == task_id,
        TaskModel.user_id == current_user["id"]
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    suggestions = db.query(AISuggestion).filter(
        AISuggestion.task_id == task_id
    ).all()
    
    return suggestions 