from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, List, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel
from openai import AsyncOpenAI
import os

from app.services.auth import get_current_user
from app.schemas.user import User
from app.schemas.ai import AIChatRequest, AIChatResponse, Conversation, Message
from app.services.ai import generate_ai_response
from app.db.database import get_supabase_client
from app.core.config import settings

router = APIRouter()

# Modelo de datos para la solicitud de chat directo con OpenRouter
class OpenRouterChatRequest(BaseModel):
    message: str
    model: str = "qwen/qwq-32b:online"

# Cliente OpenAI global para OpenRouter
openrouter_client = AsyncOpenAI(
    base_url=settings.OPENROUTER_BASE_URL,
    api_key=settings.OPENROUTER_API_KEY,
)

@router.post("/openrouter-chat")
async def openrouter_chat(request: OpenRouterChatRequest):
    """
    Envía un mensaje directamente a OpenRouter y recibe una respuesta en streaming
    """
    try:
        stream = await openrouter_client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://souldream.app",
                "X-Title": "SoulDream Personal Assistant",
            },
            model=request.model,
            messages=[
                {
                    "role": "user",
                    "content": request.message
                }
            ],
            stream=True,
            extra_body={
                "provider": {
                    "order": ["Groq","Fireworks"],
                    "allow_fallbacks": False
                }
            }
        )
        
        response_text = ""
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                response_text += chunk.choices[0].delta.content
        
        return {"response": response_text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Envía un mensaje al asistente de IA y recibe una respuesta
    """
    # Asegurarse de que el user_id en la solicitud coincide con el usuario actual
    if request.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para enviar mensajes como este usuario"
        )
    
    try:
        response = await generate_ai_response(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar respuesta de IA: {str(e)}"
        )

@router.get("/conversations", response_model=List[Conversation])
async def get_conversations(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene todas las conversaciones del usuario actual
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("conversations") \
            .select("*") \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .order("created_at", desc=True) \
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener conversaciones: {str(e)}"
        )

@router.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Obtiene una conversación específica con sus mensajes
    """
    supabase = get_supabase_client()
    
    try:
        # Obtener la conversación
        conversation_response = supabase.table("conversations") \
            .select("*") \
            .eq("id", conversation_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not conversation_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada"
            )
        
        conversation = conversation_response.data[0]
        
        # Obtener los mensajes de la conversación
        messages_response = supabase.table("messages") \
            .select("*") \
            .eq("conversation_id", conversation_id) \
            .order("created_at", desc=False) \
            .execute()
        
        # Añadir los mensajes a la conversación
        conversation["messages"] = messages_response.data
        
        return conversation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener conversación: {str(e)}"
        )

@router.post("/conversations", response_model=Conversation)
async def create_conversation(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Crea una nueva conversación
    """
    supabase = get_supabase_client()
    
    try:
        conversation_data = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "title": "Nueva conversación",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_deleted": False
        }
        
        response = supabase.table("conversations").insert(conversation_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear la conversación"
            )
        
        # Añadir mensaje inicial del asistente
        welcome_message = {
            "id": str(uuid.uuid4()),
            "content": "¡Hola! Soy tu asistente personal en SoulDream. ¿En qué puedo ayudarte hoy?",
            "sender": "ai",
            "timestamp": datetime.now().isoformat(),
            "user_id": current_user.id,
            "conversation_id": response.data[0]["id"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        supabase.table("messages").insert(welcome_message).execute()
        
        # Devolver la conversación con el mensaje inicial
        conversation = response.data[0]
        conversation["messages"] = [welcome_message]
        
        return conversation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear conversación: {str(e)}"
        )

@router.put("/conversations/{conversation_id}", response_model=Conversation)
async def update_conversation(
    conversation_id: str,
    title: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Actualiza el título de una conversación
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la conversación existe y pertenece al usuario
        conversation_response = supabase.table("conversations") \
            .select("*") \
            .eq("id", conversation_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not conversation_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada"
            )
        
        # Actualizar el título
        response = supabase.table("conversations") \
            .update({
                "title": title,
                "updated_at": datetime.now().isoformat()
            }) \
            .eq("id", conversation_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar conversación: {str(e)}"
        )

@router.delete("/conversations/{conversation_id}", response_model=Conversation)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Elimina una conversación (marcándola como eliminada)
    """
    supabase = get_supabase_client()
    
    try:
        # Verificar que la conversación existe y pertenece al usuario
        conversation_response = supabase.table("conversations") \
            .select("*") \
            .eq("id", conversation_id) \
            .eq("user_id", current_user.id) \
            .eq("is_deleted", False) \
            .execute()
        
        if not conversation_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada"
            )
        
        # Marcar como eliminada
        response = supabase.table("conversations") \
            .update({
                "is_deleted": True,
                "updated_at": datetime.now().isoformat()
            }) \
            .eq("id", conversation_id) \
            .execute()
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar conversación: {str(e)}"
        )
