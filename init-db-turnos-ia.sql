-- ==========================================
-- Script de Inicialización de Base de Datos
-- Sistema de Turnos - Esquema: turnos_ia
-- ==========================================

-- Crear el esquema si no existe
CREATE SCHEMA IF NOT EXISTS turnos_ia;

-- Establecer el esquema como el predeterminado para esta sesión
SET search_path TO turnos_ia, public;

-- ==========================================
-- Tabla: agencias
-- ==========================================
CREATE TABLE IF NOT EXISTS turnos_ia.agencias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla: clientes
-- ==========================================
CREATE TABLE IF NOT EXISTS turnos_ia.clientes (
    id SERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(200) NOT NULL,
    apellidos VARCHAR(200),
    celular VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    fecha_nacimiento DATE,
    agencia_id INTEGER REFERENCES turnos_ia.agencias(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla: turnos
-- ==========================================
CREATE TABLE IF NOT EXISTS turnos_ia.turnos (
    id SERIAL PRIMARY KEY,
    numero_turno VARCHAR(20) NOT NULL,
    cliente_id INTEGER REFERENCES turnos_ia.clientes(id) ON DELETE CASCADE,
    agencia_id INTEGER REFERENCES turnos_ia.agencias(id) ON DELETE CASCADE,
    modulo_id INTEGER,
    tipo_servicio_id INTEGER,
    agente_id INTEGER,
    fecha_hora TIMESTAMP NOT NULL,
    duracion_estimada INTEGER DEFAULT 30,
    estado VARCHAR(50) DEFAULT 'pendiente',
    prioridad VARCHAR(20) DEFAULT 'normal',
    notas TEXT,
    documentos_requeridos TEXT[],
    recordatorios_enviados INTEGER DEFAULT 0,
    origen VARCHAR(50) DEFAULT 'web',
    whatsapp_session_id VARCHAR(100),
    mensaje_confirmacion_enviado BOOLEAN DEFAULT false,
    ubicacion_qr VARCHAR(500),
    fecha_confirmacion TIMESTAMP,
    fecha_cancelacion TIMESTAMP,
    motivo_cancelacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Índices para Mejorar Rendimiento
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_turnos_cliente_id ON turnos_ia.turnos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_agencia_id ON turnos_ia.turnos(agencia_id);
CREATE INDEX IF NOT EXISTS idx_turnos_numero_turno ON turnos_ia.turnos(numero_turno);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_hora ON turnos_ia.turnos(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos_ia.turnos(estado);
CREATE INDEX IF NOT EXISTS idx_turnos_created_at ON turnos_ia.turnos(created_at);
CREATE INDEX IF NOT EXISTS idx_clientes_identificacion ON turnos_ia.clientes(identificacion);
CREATE INDEX IF NOT EXISTS idx_clientes_celular ON turnos_ia.clientes(celular);
CREATE INDEX IF NOT EXISTS idx_agencias_codigo ON turnos_ia.agencias(codigo);

-- ==========================================
-- Trigger: Actualizar updated_at automáticamente
-- ==========================================
CREATE OR REPLACE FUNCTION turnos_ia.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para agencias
DROP TRIGGER IF EXISTS update_agencias_updated_at ON turnos_ia.agencias;
CREATE TRIGGER update_agencias_updated_at 
    BEFORE UPDATE ON turnos_ia.agencias
    FOR EACH ROW 
    EXECUTE FUNCTION turnos_ia.update_updated_at_column();

-- Triggers para clientes
DROP TRIGGER IF EXISTS update_clientes_updated_at ON turnos_ia.clientes;
CREATE TRIGGER update_clientes_updated_at 
    BEFORE UPDATE ON turnos_ia.clientes
    FOR EACH ROW 
    EXECUTE FUNCTION turnos_ia.update_updated_at_column();

-- Triggers para turnos
DROP TRIGGER IF EXISTS update_turnos_updated_at ON turnos_ia.turnos;
CREATE TRIGGER update_turnos_updated_at 
    BEFORE UPDATE ON turnos_ia.turnos
    FOR EACH ROW 
    EXECUTE FUNCTION turnos_ia.update_updated_at_column();

-- ==========================================
-- Datos Iniciales: Agencias de Ejemplo
-- ==========================================
INSERT INTO turnos_ia.agencias (codigo, nombre, direccion, telefono, email, activa) 
VALUES
    ('AG001', 'Agencia Principal', 'Av. Principal 123', '02-2501234', 'principal@empresa.com', true),
    ('AG002', 'Agencia Norte', 'Av. Norte 456', '02-2509876', 'norte@empresa.com', true),
    ('AG003', 'Agencia Sur', 'Av. Sur 789', '04-2301234', 'sur@empresa.com', true)
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- Vista: Estadísticas Diarias
-- ==========================================
CREATE OR REPLACE VIEW turnos_ia.estadisticas_diarias AS
SELECT 
    a.codigo AS agencia_codigo,
    a.nombre AS agencia_nombre,
    DATE(t.created_at) AS fecha,
    COUNT(*) AS total_turnos,
    COUNT(*) FILTER (WHERE t.estado = 'pendiente') AS pendientes,
    COUNT(*) FILTER (WHERE t.estado = 'atendido') AS atendidos,
    COUNT(*) FILTER (WHERE t.estado = 'cancelado') AS cancelados,
    COUNT(*) FILTER (WHERE t.estado = 'expirado') AS expirados,
    COUNT(*) FILTER (WHERE t.mensaje_confirmacion_enviado = true) AS notificaciones_enviadas
FROM turnos_ia.turnos t
JOIN turnos_ia.agencias a ON t.agencia_id = a.id
GROUP BY a.codigo, a.nombre, DATE(t.created_at)
ORDER BY fecha DESC, a.codigo;

-- ==========================================
-- Permisos (opcional, ajustar según tu configuración)
-- ==========================================
-- GRANT USAGE ON SCHEMA turnos_ia TO tu_usuario;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA turnos_ia TO tu_usuario;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA turnos_ia TO tu_usuario;

-- ==========================================
-- Verificación
-- ==========================================
SELECT 'Esquema turnos_ia creado correctamente' AS mensaje;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'turnos_ia' ORDER BY table_name;
