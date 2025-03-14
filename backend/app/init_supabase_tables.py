import asyncio
from database import supabase
from models import Base, User, Project, Task, Goal, TaskTag, AISuggestion, APIRequest, Subscription

async def init_supabase_tables():
    """Inicializar las tablas en Supabase"""
    try:
        # Crear tablas usando RPC
        tables = [
            {
                "name": "users",
                "columns": [
                    {"name": "id", "type": "uuid", "primary": True, "default": "uuid_generate_v4()"},
                    {"name": "email", "type": "text", "unique": True},
                    {"name": "hashed_password", "type": "text"},
                    {"name": "is_active", "type": "boolean", "default": True},
                    {"name": "api_key", "type": "text", "unique": True},
                    {"name": "created_at", "type": "timestamptz", "default": "now()"},
                    {"name": "subscription_id", "type": "text"},
                    {"name": "credits", "type": "integer", "default": 100},
                    {"name": "updated_at", "type": "timestamptz"}
                ]
            },
            {
                "name": "projects",
                "columns": [
                    {"name": "id", "type": "uuid", "primary": True, "default": "uuid_generate_v4()"},
                    {"name": "name", "type": "text"},
                    {"name": "description", "type": "text"},
                    {"name": "created_at", "type": "timestamptz", "default": "now()"},
                    {"name": "updated_at", "type": "timestamptz"},
                    {"name": "user_id", "type": "uuid", "references": "users(id)"}
                ]
            },
            {
                "name": "goals",
                "columns": [
                    {"name": "id", "type": "uuid", "primary": True, "default": "uuid_generate_v4()"},
                    {"name": "title", "type": "text"},
                    {"name": "description", "type": "text"},
                    {"name": "category", "type": "text"},
                    {"name": "plan", "type": "text"},
                    {"name": "status", "type": "text", "default": "'pendiente'"},
                    {"name": "resources", "type": "jsonb"},
                    {"name": "user_id", "type": "uuid", "references": "users(id)"},
                    {"name": "created_at", "type": "timestamptz", "default": "now()"},
                    {"name": "updated_at", "type": "timestamptz"}
                ]
            },
            {
                "name": "tasks",
                "columns": [
                    {"name": "id", "type": "uuid", "primary": True, "default": "uuid_generate_v4()"},
                    {"name": "title", "type": "text"},
                    {"name": "description", "type": "text"},
                    {"name": "status", "type": "text", "default": "'pendiente'"},
                    {"name": "priority", "type": "text", "default": "'media'"},
                    {"name": "due_date", "type": "timestamptz"},
                    {"name": "estimated_hours", "type": "float"},
                    {"name": "created_at", "type": "timestamptz", "default": "now()"},
                    {"name": "updated_at", "type": "timestamptz"},
                    {"name": "completed_at", "type": "timestamptz"},
                    {"name": "resources", "type": "jsonb"},
                    {"name": "user_id", "type": "uuid", "references": "users(id)"},
                    {"name": "project_id", "type": "uuid", "references": "projects(id)"},
                    {"name": "parent_task_id", "type": "uuid", "references": "tasks(id)"},
                    {"name": "goal_id", "type": "uuid", "references": "goals(id)"}
                ]
            }
        ]

        for table in tables:
            # Crear tabla
            columns = [f"{col['name']} {col['type']}" + 
                      (" PRIMARY KEY" if col.get('primary') else "") +
                      (f" DEFAULT {col['default']}" if col.get('default') else "") +
                      (" UNIQUE" if col.get('unique') else "") +
                      (f" REFERENCES {col['references']}" if col.get('references') else "")
                      for col in table['columns']]
            
            query = f"""
            CREATE TABLE IF NOT EXISTS {table['name']} (
                {', '.join(columns)}
            );
            """
            
            await supabase.rpc('execute_sql', {'sql': query})
            print(f"✅ Tabla {table['name']} creada correctamente")

        print("✅ Todas las tablas han sido creadas correctamente")
        
    except Exception as e:
        print(f"❌ Error al crear las tablas: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_supabase_tables()) 