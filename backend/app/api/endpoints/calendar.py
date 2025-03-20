from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from app.services.auth import get_current_user
from app.services.google_calendar import list_events, create_event, update_event, delete_event
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class EventCreate(BaseModel):
    summary: str
    description: Optional[str] = None
    start: Dict[str, Any]
    end: Dict[str, Any]
    location: Optional[str] = None
    colorId: Optional[str] = None

class EventUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    start: Optional[Dict[str, Any]] = None
    end: Optional[Dict[str, Any]] = None
    location: Optional[str] = None
    colorId: Optional[str] = None

@router.get("/events")
async def get_calendar_events(
    time_min: str = Query(..., description="Fecha y hora de inicio (ISO 8601)"),
    time_max: str = Query(..., description="Fecha y hora de fin (ISO 8601)"),
    max_results: int = Query(100, description="Número máximo de resultados a devolver"),
    user = Depends(get_current_user)
):
    """Obtiene los eventos del calendario del usuario en un rango de fechas"""
    try:
        events = await list_events(user["id"], time_min, time_max, max_results)
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events")
async def create_calendar_event(
    event: EventCreate = Body(...),
    user = Depends(get_current_user)
):
    """Crea un nuevo evento en el calendario del usuario"""
    try:
        event_data = event.dict()
        event_result = await create_event(user["id"], event_data)
        return event_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/events/{event_id}")
async def update_calendar_event(
    event_id: str,
    event: EventUpdate = Body(...),
    user = Depends(get_current_user)
):
    """Actualiza un evento existente en el calendario del usuario"""
    try:
        event_data = event.dict(exclude_unset=True)
        event_result = await update_event(user["id"], event_id, event_data)
        return event_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_calendar_event(
    event_id: str,
    user = Depends(get_current_user)
):
    """Elimina un evento del calendario del usuario"""
    try:
        result = await delete_event(user["id"], event_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_calendar_status(
    user = Depends(get_current_user)
):
    """Verifica si el usuario tiene conectado Google Calendar"""
    try:
        from app.services.google_calendar import get_user_google_credentials
        
        credentials = await get_user_google_credentials(user["id"])
        
        return {
            "connected": credentials is not None,
            "provider": "google_calendar"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 