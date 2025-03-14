import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import User, Base
from app.auth import get_password_hash, generate_api_key

def create_demo_user():
    db = SessionLocal()
    try:
        # Verificar si el usuario demo ya existe
        demo_user = db.query(User).filter(User.email == "demo@example.com").first()
        if demo_user:
            print("El usuario demo ya existe")
            return
        
        # Crear usuario demo
        hashed_password = get_password_hash("demo123")
        api_key = generate_api_key()
        
        demo_user = User(
            email="demo@example.com",
            hashed_password=hashed_password,
            api_key=api_key,
            credits=1000  # Dar algunos créditos iniciales
        )
        
        db.add(demo_user)
        db.commit()
        print("Usuario demo creado exitosamente")
        
    except Exception as e:
        print(f"Error al crear usuario demo: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    create_demo_user() 