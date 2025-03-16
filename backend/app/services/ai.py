import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.ai import AIChatRequest, AIChatResponse, MessageCreate, MessageSender
from app.db.database import get_supabase_client
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

async def generate_ai_response(request: AIChatRequest) -> AIChatResponse:
    """
    Genera una respuesta de IA utilizando OpenRouter
    """
    supabase = get_supabase_client()
    
    # Crear o recuperar la conversación
    conversation_id = request.conversation_id
    if not conversation_id:
        # Crear una nueva conversación
        conversation_data = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "title": "Nueva conversación",
            "created_at": datetime.now().isoformat(),
            "is_deleted": False
        }
        
        supabase.table("conversations").insert(conversation_data).execute()
        conversation_id = conversation_data["id"]
    
    # Guardar el mensaje del usuario
    user_message = {
        "id": str(uuid.uuid4()),
        "content": request.message,
        "sender": MessageSender.user.value,
        "timestamp": datetime.now().isoformat(),
        "user_id": request.user_id,
        "conversation_id": conversation_id,
        "created_at": datetime.now().isoformat()
    }
    
    supabase.table("messages").insert(user_message).execute()
    
    # Obtener el historial de mensajes para contexto
    messages_response = supabase.table("messages") \
        .select("*") \
        .eq("conversation_id", conversation_id) \
        .order("created_at", desc=False) \
        .limit(10) \
        .execute()
    
    conversation_history = []
    for msg in messages_response.data:
        role = "user" if msg["sender"] == MessageSender.user.value else "assistant"
        conversation_history.append({"role": role, "content": msg["content"]})
    
    # Añadir el mensaje actual si no está en el historial
    if not conversation_history or conversation_history[-1]["content"] != request.message:
        conversation_history.append({"role": "user", "content": request.message})
    
    try:
        # Llamar a la API de OpenRouter
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3-opus:beta",  # Puedes cambiar el modelo según tus necesidades
                    "messages": conversation_history,
                    "max_tokens": 1000
                },
                timeout=60.0
            )
            
            response_data = response.json()
            ai_message_content = response_data["choices"][0]["message"]["content"]
            
            # Guardar la respuesta de la IA
            ai_message = {
                "id": str(uuid.uuid4()),
                "content": ai_message_content,
                "sender": MessageSender.ai.value,
                "timestamp": datetime.now().isoformat(),
                "user_id": request.user_id,
                "conversation_id": conversation_id,
                "created_at": datetime.now().isoformat()
            }
            
            supabase.table("messages").insert(ai_message).execute()
            
            return AIChatResponse(
                message=ai_message_content,
                conversation_id=conversation_id
            )
    except Exception as e:
        logger.error(f"Error al generar respuesta de IA: {e}")
        
        # En caso de error, devolver un mensaje predeterminado
        error_message = "Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde."
        
        # Guardar el mensaje de error
        ai_error_message = {
            "id": str(uuid.uuid4()),
            "content": error_message,
            "sender": MessageSender.ai.value,
            "timestamp": datetime.now().isoformat(),
            "user_id": request.user_id,
            "conversation_id": conversation_id,
            "created_at": datetime.now().isoformat()
        }
        
        supabase.table("messages").insert(ai_error_message).execute()
        
        return AIChatResponse(
            message=error_message,
            conversation_id=conversation_id
        ) 