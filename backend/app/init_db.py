from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database import Base
from .models import User, Project, Goal
from .auth import get_password_hash

# Definir la URL de la base de datos
SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

def init_db():
    # Crear el motor de la base de datos
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    try:
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        
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
                db.refresh(demo_user)
                print("✅ Usuario demo creado exitosamente")
                
                # Crear un proyecto demo
                demo_project = Project(
                    title="Proyecto Demo",
                    description="Este es un proyecto de ejemplo",
                    user_id=demo_user.id
                )
                db.add(demo_project)
                db.commit()
                db.refresh(demo_project)
                print("✅ Proyecto demo creado exitosamente")
                
                # Crear una meta demo
                demo_goal = Goal(
                    title="Meta Demo",
                    description="Esta es una meta de ejemplo",
                    user_id=demo_user.id,
                    project_id=demo_project.id
                )
                db.add(demo_goal)
                db.commit()
                print("✅ Meta demo creada exitosamente")
            
        except Exception as e:
            print(f"❌ Error al crear datos demo: {str(e)}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error al inicializar la base de datos: {str(e)}")