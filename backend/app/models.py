from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from .enums import TaskStatus, TaskPriority
from .database import Base, supabase
from sqlalchemy.sql import func
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    api_key = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    subscription_id = Column(String, nullable=True)
    credits = Column(Integer, default=100)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    requests = relationship("APIRequest", back_populates="user")
    tasks = relationship("Task", back_populates="user")
    projects = relationship("Project", back_populates="user")
    subscription = relationship("Subscription", back_populates="user")
    goals = relationship("Goal", back_populates="user")

    @classmethod
    async def create_rls_policies(cls):
        """Crear políticas RLS para la tabla users"""
        await supabase.rpc('create_auth_policy', {
            'table_name': 'users',
            'policy_name': 'users_policy',
            'policy_definition': 'auth.uid() = id'
        })

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    user_id = Column(String, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

    @classmethod
    async def create_rls_policies(cls):
        """Crear políticas RLS para la tabla projects"""
        await supabase.rpc('create_auth_policy', {
            'table_name': 'projects',
            'policy_name': 'projects_policy',
            'policy_definition': 'auth.uid() = user_id'
        })

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(String, default="pendiente")
    priority = Column(SQLEnum("alta", "media", "baja", name="priority_enum"), default="media")
    due_date = Column(DateTime(timezone=True))
    estimated_hours = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)
    resources = Column(Text)  # JSON string para recursos
    
    user_id = Column(String, ForeignKey("users.id"))
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    parent_task_id = Column(String, ForeignKey("tasks.id"), nullable=True)
    goal_id = Column(String, ForeignKey("goals.id"), nullable=True)
    
    user = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    parent_task = relationship("Task", remote_side=[id], backref="subtasks")
    goal = relationship("Goal", back_populates="tasks")
    tags = relationship("TaskTag", back_populates="task")
    ai_suggestions = relationship("AISuggestion", back_populates="task")

    @classmethod
    async def create_rls_policies(cls):
        """Crear políticas RLS para la tabla tasks"""
        await supabase.rpc('create_auth_policy', {
            'table_name': 'tasks',
            'policy_name': 'tasks_policy',
            'policy_definition': 'auth.uid() = user_id'
        })

class TaskTag(Base):
    __tablename__ = "task_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    
    task = relationship("Task", back_populates="tags")

class AISuggestion(Base):
    __tablename__ = "ai_suggestions"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    suggestion = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_applied = Column(Boolean, default=False)
    
    task = relationship("Task", back_populates="ai_suggestions")

class APIRequest(Base):
    __tablename__ = "api_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    endpoint = Column(String)
    method = Column(String)
    status_code = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tokens_used = Column(Integer, default=0)
    model = Column(String)
    
    user = relationship("User", back_populates="requests")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    stripe_subscription_id = Column(String, unique=True)
    plan_id = Column(String)
    status = Column(String)
    current_period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="subscription")

class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    plan = Column(Text)
    status = Column(String, default="pendiente")
    resources = Column(Text)  # JSON string para recursos
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")

    @classmethod
    async def create_rls_policies(cls):
        """Crear políticas RLS para la tabla goals"""
        await supabase.rpc('create_auth_policy', {
            'table_name': 'goals',
            'policy_name': 'goals_policy',
            'policy_definition': 'auth.uid() = user_id'
        }) 