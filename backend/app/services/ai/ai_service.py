import json
import logging
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime
import os
from pydantic import BaseModel

from app.core.ai_config import (
    get_ai_settings, 
    GOAL_DETECTION_PROMPT,
    GOAL_PLAN_PROMPT,
    CHAT_SYSTEM_PROMPT
)
from app.schemas.ai import ChatMessage, MessageRole, StreamingResponse
from app.schemas.goal import GoalMetadata

# Configuración del logger
logger = logging.getLogger(__name__)

class OpenRouterService:
    """
    Servicio para interactuar con la API de OpenRouter
    """
    def __init__(self):
        """
        Inicializa el servicio con la configuración desde variables de entorno
        """
        self.api_key = get_ai_settings().OPENROUTER_API_KEY
        self.base_url = get_ai_settings().OPENROUTER_BASE_URL
        self.model = get_ai_settings().OPENROUTER_DEFAULT_MODEL
        self.referer = get_ai_settings().OPENROUTER_REFERER
        
        # Verificar configuración
        if not self.api_key:
            logger.warning("OpenRouter API key no configurada. El servicio de IA no funcionará correctamente.")
            
    async def _send_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Envía una solicitud a la API de OpenRouter
        
        Args:
            payload: Datos para la solicitud
            
        Returns:
            Respuesta de la API
        """
        if not self.api_key:
            raise ValueError("OpenRouter API key no configurada")
            
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.referer,
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=get_ai_settings().REQUEST_TIMEOUT_SECONDS
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error en OpenRouter API: Status {response.status}, {error_text}")
                        raise Exception(f"Error en OpenRouter API: {response.status}")
                    
                    return await response.json()
            except aiohttp.ClientError as e:
                logger.error(f"Error de conexión con OpenRouter: {str(e)}")
                raise
            except Exception as e:
                logger.error(f"Error inesperado con OpenRouter: {str(e)}")
                raise
                
    async def _stream_request(self, payload: Dict[str, Any]) -> AsyncGenerator[StreamingResponse, None]:
        """
        Envía una solicitud en streaming a la API de OpenRouter
        
        Args:
            payload: Datos para la solicitud
            
        Yields:
            Partes de la respuesta a medida que llegan
        """
        if not self.api_key:
            raise ValueError("OpenRouter API key no configurada")
            
        # Asegurar que la solicitud sea en streaming
        payload["stream"] = True
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": self.referer,
            "Content-Type": "application/json",
            "Accept": "text/event-stream"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=get_ai_settings().REQUEST_TIMEOUT_SECONDS
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Error en OpenRouter API streaming: Status {response.status}, {error_text}")
                        yield StreamingResponse(
                            text=f"Error en la generación de respuesta: {response.status}",
                            is_complete=True
                        )
                        return
                    
                    buffer = ""
                    async for line in response.content:
                        line = line.decode('utf-8')
                        if line.startswith('data: '):
                            line = line[6:]  # Eliminar el prefijo 'data: '
                            
                            # Comprobar si es el final del stream
                            if line.strip() == "[DONE]":
                                yield StreamingResponse(text="", is_complete=True)
                                break
                                
                            try:
                                data = json.loads(line)
                                if "choices" in data and len(data["choices"]) > 0:
                                    delta = data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        content = delta["content"]
                                        buffer += content
                                        yield StreamingResponse(text=content, is_complete=False)
                            except json.JSONDecodeError:
                                logger.warning(f"Error decodificando JSON de streaming: {line}")
            
            except aiohttp.ClientError as e:
                logger.error(f"Error de conexión con OpenRouter streaming: {str(e)}")
                yield StreamingResponse(
                    text=f"Error de conexión: {str(e)}",
                    is_complete=True
                )
            except Exception as e:
                logger.error(f"Error inesperado con OpenRouter streaming: {str(e)}")
                yield StreamingResponse(
                    text=f"Error inesperado: {str(e)}",
                    is_complete=True
                )
                
    def _extract_goal_metadata(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Extrae metadatos de metas a partir del texto de la respuesta
        
        Args:
            text: Texto de la respuesta
            
        Returns:
            Metadatos de la meta si fueron detectados
        """
        try:
            # Buscar un bloque JSON en la respuesta
            start_idx = text.find('{')
            end_idx = text.rfind('}')
            
            if start_idx >= 0 and end_idx > start_idx:
                json_text = text[start_idx:end_idx+1]
                data = json.loads(json_text)
                
                # Verificar si contiene información de una meta
                if "has_goal" in data:
                    return data
                elif "goal" in data:
                    return {"has_goal": True, "goal": data["goal"]}
                
            return None
        except (json.JSONDecodeError, ValueError) as e:
            logger.warning(f"No se pudo extraer metadata JSON de la respuesta: {e}")
            return None
        except Exception as e:
            logger.error(f"Error inesperado extrayendo metadata: {e}")
            return None
            
    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False
    ) -> Any:
        """
        Genera una respuesta del chatbot usando OpenRouter
        
        Args:
            messages: Lista de mensajes en formato [{"role": "user", "content": "Hola"}, ...]
            temperature: Temperatura para la generación (creatividad)
            max_tokens: Número máximo de tokens a generar
            stream: Si la respuesta debe ser en streaming
            
        Returns:
            Texto de la respuesta o generador de streaming
        """
        # Usar valores por defecto si no se especifican
        temperature = temperature if temperature is not None else get_ai_settings().TEMPERATURE_CHAT
        max_tokens = max_tokens if max_tokens is not None else get_ai_settings().MAX_TOKENS_RESPONSE
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        try:
            if stream:
                return self._stream_request(payload)
            else:
                response = await self._send_request(payload)
                if "choices" in response and len(response["choices"]) > 0:
                    return response["choices"][0]["message"]["content"]
                else:
                    logger.error(f"Respuesta inválida: {response}")
                    return "Error: No se pudo generar una respuesta válida"
        except Exception as e:
            logger.error(f"Error generando respuesta: {str(e)}")
            return f"Error al generar respuesta: {str(e)}"
            
    async def detect_goal_from_message(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Detecta si un mensaje contiene una meta
        
        Args:
            message: Mensaje del usuario
            
        Returns:
            Metadata de la meta si se detecta una
        """
        try:
            # Preparar el prompt para detección de metas
            messages = [
                {"role": "system", "content": GOAL_DETECTION_PROMPT},
                {"role": "user", "content": message}
            ]
            
            # Configuración específica para detección de metas
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": get_ai_settings().TEMPERATURE_GOAL_DETECTION,
                "max_tokens": get_ai_settings().MAX_TOKENS_GOAL_DETECTION,
                "stream": False
            }
            
            # Enviar solicitud
            response = await self._send_request(payload)
            
            if "choices" in response and len(response["choices"]) > 0:
                response_text = response["choices"][0]["message"]["content"]
                
                # Intentar extraer JSON del texto
                try:
                    # Buscar un bloque JSON en la respuesta
                    start_idx = response_text.find('{')
                    end_idx = response_text.rfind('}')
                    
                    if start_idx >= 0 and end_idx > start_idx:
                        json_text = response_text[start_idx:end_idx+1]
                        data = json.loads(json_text)
                        
                        if "has_goal" in data:
                            if data["has_goal"] and "goal" in data:
                                logger.info(f"Meta detectada: {data['goal']['title']}")
                                return data
                            else:
                                logger.info("No se detectó ninguna meta")
                                return {"has_goal": False}
                    
                    logger.warning("No se pudo encontrar un JSON válido en la respuesta")
                    return None
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f"Error decodificando JSON: {e}")
                    return None
            else:
                logger.error(f"Respuesta inválida de la API: {response}")
                return None
        except Exception as e:
            logger.error(f"Error detectando meta: {str(e)}")
            return None
            
    async def generate_goal_plan(self, goal_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Genera un plan detallado para una meta
        
        Args:
            goal_metadata: Metadatos de la meta
            
        Returns:
            Plan detallado con pasos a seguir
        """
        try:
            # Extraer información de la meta
            if not goal_metadata.get("has_goal", False) or "goal" not in goal_metadata:
                logger.error("No hay información de meta válida para generar un plan")
                return {"error": "No hay información de meta válida"}
                
            goal = goal_metadata["goal"]
            
            # Preparar el prompt para el plan
            goal_description = f"""
            Título: {goal['title']}
            Descripción: {goal['description']}
            Área: {goal.get('area', 'no especificada')}
            Tipo: {goal.get('type', 'no especificado')}
            Fecha objetivo: {goal.get('target_date', 'no especificada')}
            Prioridad: {goal.get('priority', 'media')}
            """
            
            messages = [
                {"role": "system", "content": GOAL_PLAN_PROMPT},
                {"role": "user", "content": f"Genera un plan detallado para esta meta: {goal_description}"}
            ]
            
            # Configuración específica para planificación
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": get_ai_settings().TEMPERATURE_GOAL_PLAN,
                "max_tokens": get_ai_settings().MAX_TOKENS_GOAL_PLAN,
                "stream": False
            }
            
            # Enviar solicitud
            response = await self._send_request(payload)
            
            if "choices" in response and len(response["choices"]) > 0:
                response_text = response["choices"][0]["message"]["content"]
                
                # Intentar extraer JSON del texto
                try:
                    # Buscar un bloque JSON en la respuesta
                    start_idx = response_text.find('{')
                    end_idx = response_text.rfind('}')
                    
                    if start_idx >= 0 and end_idx > start_idx:
                        json_text = response_text[start_idx:end_idx+1]
                        data = json.loads(json_text)
                        
                        if "plan" in data:
                            logger.info(f"Plan generado: {data['plan']['title']}")
                            return data
                    
                    logger.warning("No se pudo encontrar un JSON válido en la respuesta del plan")
                    return {"error": "Formato de respuesta inválido"}
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f"Error decodificando JSON del plan: {e}")
                    return {"error": f"Error procesando respuesta: {str(e)}"}
            else:
                logger.error(f"Respuesta inválida de la API: {response}")
                return {"error": "No se pudo generar el plan"}
        except Exception as e:
            logger.error(f"Error generando plan: {str(e)}")
            return {"error": f"Error generando plan: {str(e)}"}
    
    def _format_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """
        Formatea los mensajes para la API de OpenRouter
        
        Args:
            messages: Lista de mensajes
            
        Returns:
            Lista de mensajes formateada
        """
        # Asegurarse que el primer mensaje es del sistema si no hay uno
        has_system = any(msg.get("role") == "system" for msg in messages)
        
        if not has_system:
            formatted = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
            formatted.extend(messages)
            return formatted
            
        return messages

# Instancia global del servicio
openrouter_service = OpenRouterService() 