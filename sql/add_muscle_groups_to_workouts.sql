-- Añadir columna de grupos musculares a la tabla de entrenamientos
ALTER TABLE workouts 
ADD COLUMN muscle_groups TEXT[] DEFAULT '{}';

-- Comentario para la nueva columna
COMMENT ON COLUMN workouts.muscle_groups IS 'Array de grupos musculares trabajados en el entrenamiento';

-- Añadir índice para mejorar el rendimiento de búsquedas por grupo muscular
CREATE INDEX idx_workouts_muscle_groups ON workouts USING GIN (muscle_groups);

-- Trigger function para detectar cambios en los grupos musculares
CREATE OR REPLACE FUNCTION trigger_workout_muscle_groups_changed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para la columna muscle_groups
CREATE TRIGGER workout_muscle_groups_changed
BEFORE UPDATE OF muscle_groups ON workouts
FOR EACH ROW
EXECUTE FUNCTION trigger_workout_muscle_groups_changed(); 