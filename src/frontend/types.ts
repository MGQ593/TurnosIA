/**
 * Tipos y interfaces para el frontend del sistema de turnos
 */

// ============= Configuración =============
export interface PublicConfig {
  logoUrl: string;
  resetParam: string;
  expirationMinutes: number;
  accessTokenExpirationMinutes: number;
  whatsappApiUrl: string;
  whatsappApiToken: string;
}

// ============= Validaciones =============
export interface ValidationResult {
  valido: boolean;
  mensaje?: string;
  tipo?: 'cedula' | 'ruc' | 'pasaporte';
}

export interface WhatsAppValidationResult {
  valido: boolean;
  mensaje?: string;
  numeroWhatsApp?: string;
  advertencia?: boolean;
}

// ============= Formulario =============
export interface FormularioTurnoData {
  cedula: string;
  celular: string;
}

// ============= Turno =============
export interface TurnoGuardado {
  turnoId: string;
  timestamp: string;
}

// ============= API Responses =============
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface N8NResponse {
  success: boolean;
  turno_id: string;
  message: string;
}

export interface TokenResponse {
  success: boolean;
  token: string;
  turnoId: string;
}

// ============= WhatsApp API =============
export interface WhatsAppNumberValidation {
  jid: string;
  exists: boolean;
  number: string;
}

// ============= DOM Elements =============
export interface DOMElements {
  form: HTMLFormElement;
  loading: HTMLElement;
  formShell: HTMLElement;
  successMessage: HTMLElement;
  alertContainer: HTMLElement;
  turnoIdMensaje: HTMLElement;
  turnoIdElemento: HTMLElement;
  submitBtn: HTMLButtonElement;
  cedulaInput: HTMLInputElement;
  celularInput: HTMLInputElement;
  logoImg: HTMLImageElement;
  headerElement: HTMLElement | null;
}
