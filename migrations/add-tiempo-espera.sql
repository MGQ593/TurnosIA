-- Migración: Agregar columna tiempo_espera_minutos
-- Descripción: Registra automáticamente el tiempo de espera entre la creación del turno y su asignación
-- Fecha: 2025-10-16

-- Agregar la columna tiempo_espera_minutos a la tabla turnos
ALTER TABLE turnos_ia.turnos
ADD COLUMN IF NOT EXISTS tiempo_espera_minutos DECIMAL(10, 2);

-- Agregar comentario a la columna
COMMENT ON COLUMN turnos_ia.turnos.tiempo_espera_minutos IS 'Tiempo de espera en minutos entre created_at y fecha_asignacion. Se calcula automáticamente al asignar el turno.';

-- Actualizar turnos existentes que ya tienen fecha_asignacion
UPDATE turnos_ia.turnos
SET tiempo_espera_minutos = EXTRACT(EPOCH FROM (fecha_asignacion - created_at)) / 60
WHERE fecha_asignacion IS NOT NULL 
  AND tiempo_espera_minutos IS NULL;

-- Mensaje de confirmación
SELECT 
  'Migración completada' as status,
  COUNT(*) as turnos_actualizados
FROM turnos_ia.turnos
WHERE tiempo_espera_minutos IS NOT NULL;
