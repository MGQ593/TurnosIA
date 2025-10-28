// Definiciones de tipos para el sistema de turnos

export interface Agencia {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  telefono: string;
  email: string;
  whatsapp: string;
  activa: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Cliente {
  id: number;
  identificacion: string;
  nombres: string;
  apellidos?: string;
  celular: string;
  email?: string;
  fecha_nacimiento?: Date;
  agencia_id?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Turno {
  id: number;
  cliente_id: number;
  agencia_id: number;
  numero_turno: string;
  fecha_hora: Date;
  estado: 'pendiente' | 'llamado' | 'atendido' | 'cancelado' | 'expirado';
  prioridad: string; // 'normal', 'alta', etc.
  origen: string; // 'web', 'whatsapp', etc.
  modulo?: string; // Módulo asignado cuando se llama al turno
  asesor?: string; // Asesor asignado cuando se llama al turno
  fecha_asignacion?: Date; // Fecha cuando se asignó el turno
  tiempo_espera_minutos?: number; // Tiempo de espera en minutos
  created_at: Date;
  updated_at: Date;
}

export interface TurnoConDetalles extends Turno {
  cliente: Cliente;
  agencia: Agencia;
}

// Tipos para requests/responses de la API
export interface CrearClienteRequest {
  nombres?: string; // Opcional - se generará automáticamente si no se proporciona
  identificacion: string;
  celular: string;
}

export interface CrearAgenciaRequest {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  whatsapp: string;
  activa?: boolean;
}

export interface ActualizarAgenciaRequest {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  activa?: boolean;
}

export interface SolicitarTurnoRequest {
  cliente: {
    nombres?: string; // Opcional
    identificacion: string;
    celular: string;
  };
  agencia_id: number;
}

export interface ValidarWhatsAppRequest {
  numero: string;
}

// Tipos para respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TurnoCreatedResponse {
  turno: TurnoConDetalles;
  codigo_qr: string;
}

export interface WhatsAppValidationResponse {
  valido: boolean;
  mensaje: string;
  numero_formateado?: string;
}

// Tipos para asignación de turnos
export interface AsignarTurnoRequest {
  numero_turno: string;
  modulo: string;
  asesor: string;
}

export interface EstadoAsignacionResponse {
  asignado: boolean;
  modulo?: string;
  asesor?: string;
  fecha_asignacion?: Date;
}

export interface AsignarTurnoResponse {
  success: boolean;
  mensaje: string;
  datos?: {
    numero_turno: string;
    modulo: string;
    asesor: string;
    fecha_asignacion: Date;
  };
}

// Tipos para errores
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Tipos de configuración
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export interface WhatsAppConfig {
  apiUrl: string;
  token: string;
}

// Enums
export enum TipoIdentificacion {
  CEDULA = 'cedula',
  RUC = 'ruc',
  PASAPORTE = 'pasaporte'
}

export enum EstadoTurno {
  PENDIENTE = 'pendiente',
  ATENDIDO = 'atendido',
  CANCELADO = 'cancelado',
  EXPIRADO = 'expirado'
}

// Tipos de utilidad
export type CreateRecord<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRecord<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// Tipos para middlewares
export interface AuthenticatedRequest extends Request {
  user?: any; // Para futuras implementaciones de autenticación
}

// Tipos para consultas de base de datos
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidatedData<T> {
  data: T;
  errors: ValidationError[];
}

// Constantes de tipos
export const TIPOS_IDENTIFICACION = ['CC', 'TI', 'CE', 'PP'] as const;
export const ESTADOS_TURNO = ['pendiente', 'confirmado', 'atendido', 'cancelado'] as const;