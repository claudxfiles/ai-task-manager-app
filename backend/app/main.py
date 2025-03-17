from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv

from app.api.api import api_router
from app.core.config import settings

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers de la API
app.include_router(api_router, prefix=settings.API_V1_STR)

# Ruta de verificación de estado
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Ruta de prueba para OpenRouter
@app.get("/test-openrouter")
async def test_openrouter():
    return {
        "message": "Ruta de prueba para OpenRouter",
        "api_key_configured": bool(settings.OPENROUTER_API_KEY),
        "base_url": settings.OPENROUTER_BASE_URL
    }

# Manejador de excepciones
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error no manejado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Se ha producido un error interno en el servidor"},
    )

if __name__ == "__main__":
    import uvicorn
    
    # Obtener puerto del entorno o usar 8000 por defecto
    port = int(os.getenv("PORT", 8000))
    
    # Iniciar el servidor
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
