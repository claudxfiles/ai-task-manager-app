from app.database import SessionLocal, Base, engine, init_db
from app.models import User
from app.auth import get_password_hash

def create_demo_user():
    # Inicializar la base de datos si no existe
    init_db()
    db = SessionLocal()
    
    # Verificar si el usuario demo ya existe
    demo_user = db.query(User).filter(User.email == "demo@example.com").first()
    if demo_user:
        # Actualizar la contraseña del usuario demo si existe
        demo_user.hashed_password = get_password_hash("demo123")
        demo_user.is_active = True
        demo_user.credits = 1000
        db.commit()
        print("Usuario demo actualizado exitosamente")
        return demo_user
    
    # Crear usuario demo si no existe
    demo_user = User(
        email="demo@example.com",
        hashed_password=get_password_hash("demo123"),
        is_active=True,
        credits=1000
    )
    
    try:
        db.add(demo_user)
        db.commit()
        print("Usuario demo creado exitosamente")
        return demo_user
    except Exception as e:
        print(f"Error al crear usuario demo: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user() 