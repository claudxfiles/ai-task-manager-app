from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from uuid import uuid4

from app.api.deps import get_current_user
from app.schemas.ai import ChatMessage, ChatResponse

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    message: ChatMessage,
    current_user=Depends(get_current_user)
):
    """
    Envía un mensaje al asistente IA y recibe una respuesta.
    """
    try:
        # Aquí iría la lógica para comunicarse con el modelo de IA
        # Por ahora, devolvemos una respuesta simulada
        return {
            "id": str(uuid4()),
            "content": f"Respuesta simulada a: {message.content}",
            "user_id": current_user["id"],
            "created_at": "2023-01-01T00:00:00Z",
            "model": "gpt-3.5-turbo-simulated",
            "conversation_id": message.conversation_id or str(uuid4())
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar la solicitud: {str(e)}"
        )

@router.get("/conversations", response_model=List[Dict[str, Any]])
async def get_conversations(
    current_user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 10
):
    """
    Obtiene el historial de conversaciones del usuario.
    """
    # Aquí iría la lógica para obtener las conversaciones desde Supabase
    # Por ahora, devolvemos una lista vacía
    return []

@router.get("/conversations/{conversation_id}", response_model=List[Dict[str, Any]])
async def get_conversation_messages(
    conversation_id: str,
    current_user=Depends(get_current_user)
):
    """
    Obtiene los mensajes de una conversación específica.
    """
    # Aquí iría la lógica para obtener los mensajes desde Supabase
    # Por ahora, devolvemos una lista vacía
    return []

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user=Depends(get_current_user)
):
    """
    Elimina una conversación específica.
    """
    # Aquí iría la lógica para eliminar la conversación en Supabase
    pass 