from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, User, Task, Project, Goal
from .auth import get_password_hash
import os

DATABASE_URL = "sqlite:///./app.db"

def init_db():
    # Crear el motor de base de datos
    engine = create_engine(DATABASE_URL)
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    # Crear una sesión
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si el usuario demo ya existe
        demo_user = db.query(User).filter(User.email == "demo@example.com").first()
        
        if not demo_user:
            # Crear usuario demo
            demo_user = User(
                email="demo@example.com",
                hashed_password=get_password_hash("demo123"),
                is_active=True,
                credits=100
            )
            db.add(demo_user)
            db.commit()
            print("Usuario demo creado exitosamente")
        else:
            print("El usuario demo ya existe")
        
        # Crear un proyecto de ejemplo si no existe
        demo_project = db.query(Project).filter(
            Project.user_id == demo_user.id,
            Project.name == "Proyecto Demo"
        ).first()
        
        if not demo_project:
            demo_project = Project(
                name="Proyecto Demo",
                description="Este es un proyecto de ejemplo",
                user_id=demo_user.id
            )
            db.add(demo_project)
            db.commit()
            print("Proyecto demo creado exitosamente")
        
        # Crear una meta de ejemplo si no existe
        demo_goal = db.query(Goal).filter(
            Goal.user_id == demo_user.id,
            Goal.title == "Meta Demo"
        ).first()
        
        if not demo_goal:
            demo_goal = Goal(
                title="Meta Demo",
                description="Esta es una meta de ejemplo",
                category="Personal",
                plan="Plan de acción para la meta demo",
                status="pendiente",
                user_id=demo_user.id
            )
            db.add(demo_goal)
            db.commit()
            print("Meta demo creada exitosamente")
            
        return True
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    init_db() 