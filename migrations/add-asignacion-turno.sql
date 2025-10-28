-- =====================================================
-- MIGRACIÓN: Agregar columnas de asignación de turno
-- Fecha: 2025-10-15
-- Descripción: Agrega columnas para módulo, asesor y 
--              fecha de asignación a la tabla turnos
-- =====================================================

-- Agregar columnas a la tabla turnos
ALTER TABLE turnos_ia.turnos 
ADD COLUMN IF NOT EXISTS modulo VARCHAR(100),
ADD COLUMN IF NOT EXISTS asesor VARCHAR(150),
ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP;

-- Crear índice para búsquedas rápidas por número de turno
CREATE INDEX IF NOT EXISTS idx_turnos_numero_turno 
ON turnos_ia.turnos(numero_turno);

-- Crear índice para búsquedas de turnos asignados
CREATE INDEX IF NOT EXISTS idx_turnos_asignados 
ON turnos_ia.turnos(modulo, asesor) 
WHERE modulo IS NOT NULL AND asesor IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN turnos_ia.turnos.modulo IS 'Módulo donde será atendido el turno (ej: Módulo 1, Módulo 2)';
COMMENT ON COLUMN turnos_ia.turnos.asesor IS 'Nombre del asesor que atenderá el turno';
COMMENT ON COLUMN turnos_ia.turnos.fecha_asignacion IS 'Fecha y hora cuando se asignó el turno a un módulo/asesor';

-- Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'turnos_ia' 
  AND table_name = 'turnos' 
  AND column_name IN ('modulo', 'asesor', 'fecha_asignacion');
