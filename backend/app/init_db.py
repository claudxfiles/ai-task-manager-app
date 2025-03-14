from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, User
from .auth import get_password_hash, generate_api_key

# Crear el motor de la base de datos
engine = create_engine('sqlite:///./app.db')

# Crear todas las tablas
Base.metadata.create_all(bind=engine)

# Crear una sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def init_demo_user():
    # Verificar si el usuario demo ya existe
    demo_user = db.query(User).filter(User.email == "demo@example.com").first()
    if not demo_user:
        # Crear usuario demo
        demo_user = User(
            email="demo@example.com",
            hashed_password=get_password_hash("demo123"),
            api_key=generate_api_key(),
            credits=100  # Dar algunos créditos iniciales
        )
        db.add(demo_user)
        db.commit()
        print("Usuario demo creado exitosamente")
    else:
        print("El usuario demo ya existe")

if __name__ == "__main__":
    init_demo_user() 