-- ==========================================
-- Script de Inicialización de Base de Datos
-- Sistema de Turnos ChevyPlan
-- ==========================================

-- Crear extensión para UUIDs (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Tabla: Agencias
-- ==========================================
CREATE TABLE IF NOT EXISTS agencias (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla: Clientes
-- ==========================================
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    tipo_identificacion VARCHAR(20) CHECK (tipo_identificacion IN ('cedula', 'ruc', 'pasaporte')),
    nombres VARCHAR(200) NOT NULL,
    celular VARCHAR(15) NOT NULL,
    celular_validado BOOLEAN DEFAULT false,
    whatsapp VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Tabla: Turnos
-- ==========================================
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agencia_id INTEGER NOT NULL REFERENCES agencias(id) ON DELETE CASCADE,
    numero_turno VARCHAR(10) NOT NULL,
    secuencia_diaria INTEGER NOT NULL,
    token_acceso VARCHAR(100) UNIQUE NOT NULL,
    token_expiracion TIMESTAMP NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'atendido', 'cancelado', 'expirado')),
    qr_code TEXT,
    notificacion_enviada BOOLEAN DEFAULT false,
    notificacion_fecha TIMESTAMP,
    atendido_por VARCHAR(100),
    fecha_atencion TIMESTAMP,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Índices para Mejorar Rendimiento
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_turnos_token_acceso ON turnos(token_acceso);
CREATE INDEX IF NOT EXISTS idx_turnos_cliente_id ON turnos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_agencia_id ON turnos(agencia_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_solicitud ON turnos(fecha_solicitud);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_identificacion ON clientes(identificacion);
CREATE INDEX IF NOT EXISTS idx_agencias_codigo ON agencias(codigo);

-- ==========================================
-- Trigger: Actualizar updated_at automáticamente
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agencias_updated_at BEFORE UPDATE ON agencias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turnos_updated_at BEFORE UPDATE ON turnos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Datos Iniciales: Agencias de Ejemplo
-- ==========================================
INSERT INTO agencias (codigo, nombre, direccion, telefono, activa) VALUES
    ('QUITO-NORTE', 'ChevyPlan Quito Norte', 'Av. 6 de Diciembre y Gaspar de Villarroel', '02-2501234', true),
    ('QUITO-SUR', 'ChevyPlan Quito Sur', 'Av. Maldonado y Alonso de Angulo', '02-2509876', true),
    ('GUAYAQUIL-CENTRO', 'ChevyPlan Guayaquil Centro', 'Av. 9 de Octubre 100 y Malecón', '04-2301234', true),
    ('CUENCA', 'ChevyPlan Cuenca', 'Av. Solano y Av. 12 de Abril', '07-2801234', true)
ON CONFLICT (codigo) DO NOTHING;

-- ==========================================
-- Función: Generar Número de Turno
-- ==========================================
CREATE OR REPLACE FUNCTION generar_numero_turno(p_agencia_id INTEGER)
RETURNS TABLE(numero_turno VARCHAR, secuencia_diaria INTEGER) AS $$
DECLARE
    v_secuencia INTEGER;
    v_numero VARCHAR(10);
    v_prefijo VARCHAR(5);
BEGIN
    -- Obtener el prefijo de la agencia (primeras 3 letras)
    SELECT LEFT(codigo, 3) INTO v_prefijo FROM agencias WHERE id = p_agencia_id;
    
    -- Obtener la última secuencia del día
    SELECT COALESCE(MAX(secuencia_diaria), 0) + 1
    INTO v_secuencia
    FROM turnos
    WHERE agencia_id = p_agencia_id
      AND DATE(fecha_solicitud) = CURRENT_DATE;
    
    -- Generar número de turno: PREFIJO-SECUENCIA
    v_numero := v_prefijo || '-' || LPAD(v_secuencia::TEXT, 4, '0');
    
    RETURN QUERY SELECT v_numero, v_secuencia;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Vista: Estadísticas Diarias por Agencia
-- ==========================================
CREATE OR REPLACE VIEW estadisticas_diarias AS
SELECT 
    a.codigo AS agencia_codigo,
    a.nombre AS agencia_nombre,
    DATE(t.fecha_solicitud) AS fecha,
    COUNT(*) AS total_turnos,
    COUNT(*) FILTER (WHERE t.estado = 'pendiente') AS pendientes,
    COUNT(*) FILTER (WHERE t.estado = 'atendido') AS atendidos,
    COUNT(*) FILTER (WHERE t.estado = 'cancelado') AS cancelados,
    COUNT(*) FILTER (WHERE t.estado = 'expirado') AS expirados,
    COUNT(*) FILTER (WHERE t.notificacion_enviada = true) AS notificaciones_enviadas
FROM turnos t
JOIN agencias a ON t.agencia_id = a.id
GROUP BY a.codigo, a.nombre, DATE(t.fecha_solicitud)
ORDER BY fecha DESC, a.codigo;

-- ==========================================
-- Comentarios en las Tablas
-- ==========================================
COMMENT ON TABLE agencias IS 'Sucursales o puntos de atención de ChevyPlan';
COMMENT ON TABLE clientes IS 'Información de clientes que solicitan turnos';
COMMENT ON TABLE turnos IS 'Registro de turnos solicitados y su estado';
COMMENT ON COLUMN turnos.token_acceso IS 'Token único para acceder al turno vía URL';
COMMENT ON COLUMN turnos.numero_turno IS 'Número de turno visible (ej: QUI-0001)';
COMMENT ON COLUMN turnos.secuencia_diaria IS 'Número secuencial del día por agencia';

-- ==========================================
-- Permisos (Opcional - ajustar según tu usuario)
-- ==========================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO turnos_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO turnos_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO turnos_user;

RAISE NOTICE 'Base de datos inicializada correctamente ✓';
