from fastapi import APIRouter

from app.api.endpoints import auth, tasks, finance, ai, habits

api_router = APIRouter()

# Incluir los routers de los endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(habits.router, prefix="/habits", tags=["habits"]) 