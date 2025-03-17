from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from dotenv import load_dotenv

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
    title="Task Manager API",
    description="API para la aplicación de gestión de tareas y metas potenciada por IA",
    version="0.1.0",
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
    return {
        "name": "Task Manager API",
        "version": "0.1.0",
        "status": "running"
    }

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

if __name__ == "__main__":
    import uvicorn
    
    # Obtener puerto del entorno o usar 8000 por defecto
    port = int(os.getenv("PORT", 8000))
    
    # Iniciar el servidor
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
