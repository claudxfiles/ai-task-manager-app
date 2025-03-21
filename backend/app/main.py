from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv
from app.api.router import api_router
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
    version=settings.PROJECT_VERSION,
    description="API para el proyecto AI Task Manager",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configurar CORS - Permitimos todos los orígenes en desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos
    allow_headers=["*"],  # Permitir todos los headers
)

# Ruta de verificación de estado
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Ruta raíz
@app.get("/")
async def root():
    return {"message": "API AI Task Manager funcionando correctamente"}

# Manejador de excepciones
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error no manejado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Se ha producido un error interno en el servidor"},
    )

# Verificar si estamos en modo desarrollo
if os.environ.get("ENV", "development") == "development":
    print("Ejecutando en modo desarrollo")

# Incluir router principal que contiene todos los endpoints
app.include_router(
    api_router,
    prefix="/api/v1",
)

# Servir archivos estáticos si existe la carpeta
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

if __name__ == "__main__":
    import uvicorn
    
    # Obtener puerto del entorno o usar 8000 por defecto
    port = int(os.getenv("PORT", 8000))
    
    # Iniciar el servidor
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
