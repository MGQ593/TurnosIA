-- Migración: Agregar columnas para finalización y cancelación de turnos
-- Descripción: Agrega campos necesarios para registrar tiempo de atención y observaciones
-- Fecha: 2025-11-12

-- Agregar la columna tiempo_atencion_minutos a la tabla turnos
ALTER TABLE turnos_ia.turnos
ADD COLUMN IF NOT EXISTS tiempo_atencion_minutos DECIMAL(10, 2);

-- Agregar la columna observaciones a la tabla turnos
ALTER TABLE turnos_ia.turnos
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Agregar comentarios a las columnas
COMMENT ON COLUMN turnos_ia.turnos.tiempo_atencion_minutos IS 'Tiempo de atención en minutos desde fecha_asignacion hasta la finalización. Se calcula automáticamente al finalizar el turno.';
COMMENT ON COLUMN turnos_ia.turnos.observaciones IS 'Observaciones sobre la atención del turno (finalización o cancelación). Usado para registrar motivos de cancelación o notas finales.';

-- Mensaje de confirmación
SELECT
  'Migración completada' as status,
  'Columnas tiempo_atencion_minutos y observaciones agregadas correctamente' as descripcion;
