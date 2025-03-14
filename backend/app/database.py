from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Configuración de SQLAlchemy con PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv("SUPABASE_DB_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependencia para obtener una sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    """
    Inicializa la base de datos y crea las tablas
    """
    Base.metadata.create_all(bind=engine)

async def get_supabase():
    """
    Dependencia para obtener el cliente de Supabase
    """
    return supabase 