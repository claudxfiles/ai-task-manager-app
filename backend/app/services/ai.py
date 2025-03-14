import os
import json
import httpx
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "claude-3-sonnet-20240229")

# Cliente httpx global
http_client = httpx.AsyncClient()

GOAL_CATEGORIES = {
    "negocio-startup": {
        "name": "Startup/Tecnología",
        "icon": "🚀",
        "keywords": ["startup", "tecnología", "app", "software", "plataforma", "digital", "innovación", "escalable"]
    },
    "negocio-comercio": {
        "name": "Comercio/Retail",
        "icon": "🏪",
        "keywords": ["tienda", "comercio", "retail", "productos", "ventas", "inventario", "local", "mercancía"]
    },
    "negocio-servicios": {
        "name": "Servicios Profesionales",
        "icon": "👔",
        "keywords": ["consultoría", "servicios", "freelance", "profesional", "asesoría", "coaching", "cliente"]
    },
    "negocio-manufactura": {
        "name": "Manufactura/Producción",
        "icon": "🏭",
        "keywords": ["fábrica", "producción", "manufactura", "producto", "materia prima", "fabricación"]
    },
    "desarrollo-personal": {
        "name": "Desarrollo Personal",
        "icon": "💼",
        "keywords": ["crecimiento", "habilidades", "desarrollo", "personal", "liderazgo", "productividad"]
    },
    "salud": {
        "name": "Salud y Bienestar",
        "icon": "💪",
        "keywords": ["ejercicio", "dieta", "salud", "bienestar", "deporte", "nutrición"]
    },
    "educacion": {
        "name": "Educación",
        "icon": "📚",
        "keywords": ["estudiar", "aprender", "curso", "carrera", "educación", "conocimiento"]
    },
    "finanzas": {
        "name": "Finanzas",
        "icon": "💰",
        "keywords": ["dinero", "ahorro", "inversión", "negocio", "emprender", "financiero", "empresa", "emprendimiento", "ventas", "ingresos"]
    },
    "hobbies": {
        "name": "Hobbies",
        "icon": "🎨",
        "keywords": ["hobby", "pasatiempo", "arte", "música", "deporte", "recreación", "pintura", "fotografía", "jardinería", "cocina"]
    }
}

def get_category_from_text(text: str) -> str:
    """
    Determina la categoría basada en palabras clave en el texto
    """
    text = text.lower()
    scores = {category: 0 for category in GOAL_CATEGORIES.keys()}
    
    for category, info in GOAL_CATEGORIES.items():
        for keyword in info["keywords"]:
            if keyword in text:
                scores[category] += 1
    
    # Obtener la categoría con mayor puntuación
    max_score = max(scores.values())
    if max_score == 0:
        return "desarrollo-personal"  # categoría por defecto
    
    return max(scores.items(), key=lambda x: x[1])[0]

async def make_openrouter_request(messages: list, model: str = "qwen/qwq-32b:online") -> str:
    """
    Hace una petición a OpenRouter API usando httpx directamente
    """
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "SoulDream AI",
        }
        
        data = {
            "model": model,
            "messages": messages,
            "stream": True,
            "provider": {
                "order": ["Groq", "Fireworks"],
                "allow_fallbacks": False
            }
        }
        
        async with http_client.stream('POST', f"{OPENROUTER_BASE_URL}/chat/completions", headers=headers, json=data) as response:
            response.raise_for_status()
            response_text = ""
            
            async for line in response.aiter_lines():
                if line.startswith('data: '):
                    try:
                        chunk = json.loads(line[6:])
                        if chunk.get('choices') and chunk['choices'][0].get('delta', {}).get('content'):
                            response_text += chunk['choices'][0]['delta']['content']
                    except json.JSONDecodeError:
                        continue
            
            return response_text
        
    except Exception as e:
        print(f"Error en OpenRouter API: {str(e)}")
        raise Exception(f"Error en OpenRouter API: {str(e)}")

def generate_smart_tasks(goal: str, category: str) -> list:
    """
    Genera tareas SMART basadas en la meta y su categoría, incluyendo recursos relevantes
    """
    base_date = datetime.now()
    tasks = []
    
    if category.startswith("negocio-"):
        # Tareas comunes para todos los negocios
        common_tasks = [
            {
                "title": "Validación de mercado",
                "description": "Realizar encuestas y entrevistas con potenciales clientes para validar la idea",
                "due_date": (base_date + timedelta(days=7)).strftime("%Y-%m-%d"),
                "priority": "alta",
                "resources": [
                    {
                        "type": "tool",
                        "title": "Google Forms",
                        "url": "https://forms.google.com",
                        "description": "Crea encuestas profesionales gratis"
                    },
                    {
                        "type": "link",
                        "title": "Guía de validación de mercado",
                        "url": "https://www.gosite.com/es/blog/comenzar-un-negocio-de-jardineria",
                        "description": "Tutorial completo de GoSite sobre validación"
                    }
                ]
            },
            {
                "title": "Plan financiero inicial",
                "description": "Calcular costos iniciales, proyecciones y punto de equilibrio",
                "due_date": (base_date + timedelta(days=14)).strftime("%Y-%m-%d"),
                "priority": "alta",
                "resources": [
                    {
                        "type": "tool",
                        "title": "YourGreenPal",
                        "url": "https://www.yourgreenpal.com",
                        "description": "Herramienta para modelar finanzas de jardinería"
                    }
                ]
            }
        ]
        
        # Tareas específicas por tipo de negocio
        if category == "negocio-startup":
            specific_tasks = [
                {
                    "title": "MVP (Producto Mínimo Viable)",
                    "description": "Desarrollar la primera versión funcional del producto",
                    "due_date": (base_date + timedelta(days=30)).strftime("%Y-%m-%d"),
                    "priority": "alta",
                    "resources": [
                        {
                            "type": "tool",
                            "title": "Canva",
                            "url": "https://www.canva.com",
                            "description": "Diseña tu portafolio y presentaciones"
                        }
                    ]
                }
            ]
        elif category == "negocio-comercio":
            specific_tasks = [
                {
                    "title": "Análisis de ubicación",
                    "description": "Investigar y seleccionar la mejor ubicación para el local",
                    "due_date": (base_date + timedelta(days=15)).strftime("%Y-%m-%d"),
                    "priority": "alta",
                    "resources": [
                        {
                            "type": "link",
                            "title": "Guía de selección de ubicación",
                            "url": "https://www.zarla.com/es/guías/cómo-iniciar-un-negocio-de-paisajismo",
                            "description": "Consejos para elegir la mejor ubicación"
                        }
                    ]
                }
            ]
        elif category == "negocio-servicios":
            specific_tasks = [
                {
                    "title": "Portafolio de servicios",
                    "description": "Definir y documentar los servicios a ofrecer con precios",
                    "due_date": (base_date + timedelta(days=10)).strftime("%Y-%m-%d"),
                    "priority": "alta",
                    "resources": [
                        {
                            "type": "video",
                            "title": "Cómo crear un portafolio efectivo",
                            "url": "https://www.youtube.com/watch?v=GbUc0zcvPYs",
                            "description": "Tutorial con consejos prácticos"
                        }
                    ]
                }
            ]
        
        tasks = common_tasks + specific_tasks
    
    elif category == "desarrollo-personal":
        tasks = [
            {
                "title": "Definir objetivos específicos",
                "description": "Establecer metas medibles y alcanzables",
                "due_date": (base_date + timedelta(days=3)).strftime("%Y-%m-%d"),
                "priority": "alta"
            }
        ]
    
    return tasks

async def analyze_message_for_goal(message: str) -> dict:
    """
    Analiza un mensaje para detectar si contiene una meta y extraer su información,
    manteniendo una conversación natural
    """
    try:
        # Prompt para detectar metas de manera más natural
        system_message = """Eres un coach personal amigable y conversacional. Tu objetivo es:
        1. Mantener una conversación natural y empática con el usuario
        2. Detectar sutilmente si el mensaje contiene una meta o aspiración
        3. Si detectas una meta, estructurarla sin mencionarlo explícitamente al usuario
        4. Generar una respuesta que continúe naturalmente la conversación

        Si detectas una meta, incluye la estructura en el siguiente formato JSON, 
        pero manteniendo la conversación natural en la respuesta:

        {
            "is_goal": true,
            "goal_data": {
                "title": "Título conciso de la meta",
                "description": "Descripción detallada",
                "category": "categoria-slug",
                "status": "pendiente",
                "priority": "alta/media/baja",
                "tasks": [
                    {
                        "title": "Título de la tarea",
                        "description": "Descripción detallada",
                        "due_date": "YYYY-MM-DD",
                        "priority": "alta/media/baja"
                    }
                ]
            },
            "conversation_response": "Tu respuesta natural para continuar la conversación"
        }

        Si no detectas una meta, simplemente responde de manera natural y empática.
        """

        # Analizar el mensaje con IA
        response = await make_openrouter_request([
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ])

        try:
            # Intentar extraer el JSON si existe
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                try:
                    analysis = json.loads(response[json_start:json_end])
                    # Verificar si es una meta y tiene la estructura correcta
                    if analysis.get("is_goal") and "goal_data" in analysis:
                        # Asegurarse de que la meta tenga todos los campos necesarios
                        goal_data = analysis["goal_data"]
                        if "tasks" not in goal_data:
                            goal_data["tasks"] = []
                        
                        # Asignar fechas si no están presentes
                        base_date = datetime.now()
                        for i, task in enumerate(goal_data["tasks"]):
                            if "due_date" not in task:
                                task["due_date"] = (base_date + timedelta(days=7*(i+1))).strftime("%Y-%m-%d")
                        
                        return {
                            "is_goal": True,
                            "goal_data": goal_data,
                            "conversation_response": analysis.get("conversation_response", "Entiendo. ¿Hay algo más en lo que pueda ayudarte?")
                        }
                except json.JSONDecodeError:
                    pass
            
            # Si no se detectó una meta o hubo un error en el JSON, devolver solo la respuesta conversacional
            return {
                "is_goal": False,
                "goal_data": None,
                "conversation_response": response
            }

        except Exception as e:
            print(f"Error procesando respuesta: {str(e)}")
            return {
                "is_goal": False,
                "goal_data": None,
                "conversation_response": response
            }

    except Exception as e:
        print(f"Error al analizar mensaje: {str(e)}")
        return {
            "is_goal": False,
            "goal_data": None,
            "conversation_response": "Lo siento, tuve un problema procesando tu mensaje. ¿Podrías reformularlo?"
        }

async def generate_goal_plan(title: str, category: str, description: str = None) -> str:
    """
    Genera un plan personalizado para una meta usando el modelo de OpenRouter
    """
    category_info = GOAL_CATEGORIES.get(category, {})
    category_name = category_info.get("name", category)
    category_icon = category_info.get("icon", "")

    prompt = f"""Como experto en desarrollo personal y planificación, genera un plan detallado y accionable para la siguiente meta:

Título: {title}
Categoría: {category_name} {category_icon}
{"Descripción: " + description if description else ""}

El plan debe incluir:
1. Pasos específicos y medibles
2. Plazos sugeridos
3. Recursos necesarios
4. Métricas de progreso
5. Consejos para mantener la motivación

Formato el plan de manera clara y concisa, usando viñetas y numeración.
"""

    try:
        return await make_openrouter_request([
            {"role": "system", "content": "Eres un experto en desarrollo personal y planificación estratégica, especializado en crear planes accionables y efectivos."},
            {"role": "user", "content": prompt}
        ])
    except Exception as e:
        print(f"Error generando plan con IA: {str(e)}")
        raise Exception("Error al generar el plan. Por favor intenta de nuevo.") 