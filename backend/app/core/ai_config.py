from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Dict, Any, Optional
import os
from functools import lru_cache

class AISettings(BaseSettings):
    """
    Configuración para los servicios de IA
    """
    # OpenRouter API (https://openrouter.ai/)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_DEFAULT_MODEL: str = "qwen/qwq-32b:online"
    OPENROUTER_REFERER: str = "https://task-manager.app"  # Dominio de la aplicación

    # Configuración para tokens máximos en diferentes contextos
    MAX_TOKENS_RESPONSE: int = 800
    MAX_TOKENS_GOAL_DETECTION: int = 500
    MAX_TOKENS_GOAL_PLAN: int = 1000
    
    # Configuración para temperaturas para diferentes propósitos
    TEMPERATURE_CHAT: float = 0.7        # Más creativo para chat general
    TEMPERATURE_GOAL_DETECTION: float = 0.2  # Más determinista para detección
    TEMPERATURE_GOAL_PLAN: float = 0.4   # Balance para planificación

    # Parámetros para control de frecuencia/limitaciones
    MAX_REQUESTS_PER_MINUTE: int = 10    # Limitar solicitudes a la API
    REQUEST_TIMEOUT_SECONDS: int = 30    # Timeout para solicitudes
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Instancia global de configuración
ai_settings = AISettings()

# Prompts optimizados para qwen/qwq-32b

CHAT_SYSTEM_PROMPT = """Eres un asistente personal amigable y útil en una aplicación llamada Task Manager. 
Puedes ayudar a los usuarios con una variedad de tareas, especialmente la gestión de su tiempo, metas y 
productividad. Basa tus respuestas en las mejores prácticas de productividad y gestión personal.
"""

GOAL_DETECTION_PROMPT = """Analiza el siguiente mensaje de un usuario y determina si contiene una meta o intención específica. 
Una meta debe tener un objetivo claro, medible y preferiblemente un plazo específico.

Ejemplos de mensajes que contienen metas:
1. "Quiero ahorrar $5000 para fin de año"
2. "Necesito aprender programación en Python en los próximos 3 meses"
3. "Mi objetivo es correr un maratón el próximo verano"

Ejemplos de mensajes que NO contienen metas:
1. "¿Qué hora es?"
2. "Estoy aburrido"
3. "Me gustaría saber más sobre nutrición" (muy general, sin objetivo específico)

Si detectas una meta, responde ÚNICAMENTE con un JSON con el siguiente formato:
{
  "has_goal": true,
  "goal": {
    "title": "Título conciso de la meta",
    "description": "Descripción detallada de la meta",
    "area": "finanzas|salud|educacion|desarrollo_personal|carrera|relaciones|hobbies",
    "type": "adquisicion|aprendizaje|habito|ahorro|fitness|otro",
    "target_date": "YYYY-MM-DD (si se menciona)",
    "priority": "alta|media|baja (basado en la urgencia expresada)",
    "steps": ["Posible paso 1", "Posible paso 2", "..."] (opcional)
  }
}

Si NO detectas una meta clara, responde ÚNICAMENTE con:
{
  "has_goal": false
}
"""

GOAL_PLAN_PROMPT = """Estás ayudando a un usuario a crear un plan para lograr una meta específica.
Tu tarea es desarrollar un plan detallado, realista y accionable basado en la descripción de la meta proporcionada.

Genera un plan con los siguientes elementos:
1. Título claro para el plan
2. Resumen general del enfoque
3. Pasos específicos y accionables (entre 3 y 7)
4. Posibles obstáculos y cómo superarlos
5. Métricas de éxito para medir el progreso

Cada paso debe incluir:
- Un título descriptivo
- Una explicación detallada
- Un marco de tiempo estimado
- Recursos necesarios
- Criterios para considerar completado el paso

Responde ÚNICAMENTE con un JSON con el siguiente formato:
{
  "plan": {
    "title": "Título del plan",
    "overview": "Resumen general del enfoque para lograr la meta",
    "steps": [
      {
        "title": "Título del paso 1",
        "description": "Descripción detallada",
        "timeframe": "Estimación de tiempo",
        "resources": ["Recurso 1", "Recurso 2"],
        "success_criteria": "Cómo saber que se completó"
      },
      {
        "title": "Título del paso 2",
        "description": "Descripción detallada",
        "timeframe": "Estimación de tiempo",
        "resources": ["Recurso 1", "Recurso 2"],
        "success_criteria": "Cómo saber que se completó"
      }
    ],
    "obstacles": [
      {
        "obstacle": "Posible obstáculo 1",
        "solution": "Solución propuesta"
      },
      {
        "obstacle": "Posible obstáculo 2",
        "solution": "Solución propuesta"
      }
    ],
    "total_timeframe": "Estimación de tiempo total",
    "success_metrics": ["Métrica 1", "Métrica 2", "Métrica 3"]
  }
}

Asegúrate de que el plan sea específico para la meta proporcionada y que los pasos se puedan ejecutar de manera realista. Incluye detalles que 
ayuden a concretarla mejor (plazo, obstáculos, recursos disponibles, etc.).
"""

@lru_cache()
def get_ai_settings() -> AISettings:
    """
    Retorna las configuraciones de IA cacheadas
    """
    return AISettings() 