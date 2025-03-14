import asyncio
from .database import supabase
from .models import User, Project, Task, Goal

async def init_supabase_policies():
    """Inicializar las políticas de RLS en Supabase"""
    try:
        # Habilitar RLS en todas las tablas
        tables = ['users', 'projects', 'tasks', 'goals']
        for table in tables:
            await supabase.rpc('enable_rls', {'table_name': table})
        
        # Crear políticas para cada modelo
        await User.create_rls_policies()
        await Project.create_rls_policies()
        await Task.create_rls_policies()
        await Goal.create_rls_policies()
        
        print("✅ Políticas RLS inicializadas correctamente")
    except Exception as e:
        print(f"❌ Error al inicializar políticas RLS: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_supabase_policies()) 