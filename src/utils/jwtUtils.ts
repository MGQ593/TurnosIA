import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Clave secreta para firmar tokens (debe estar en .env en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_IN_PRODUCTION_' + crypto.randomBytes(32).toString('hex');

// Tiempo de expiración del token en minutos
const EXPIRATION_MINUTES = parseInt(process.env.TURNO_EXPIRATION_MINUTES || '30', 10);

export interface TurnoTokenPayload {
  turnoId: string;
  agenciaId: number;
  cedula?: string;
  celular?: string;
  activarAudio?: boolean;
  activarPush?: boolean;
  timestamp: number;
}

/**
 * Genera un token JWT seguro con los datos del turno
 * El token está firmado y tiene fecha de expiración
 */
export function generarTokenTurno(
  turnoId: string,
  agenciaId: number,
  cedula?: string, 
  celular?: string,
  activarAudio?: boolean,
  activarPush?: boolean
): string {
  const payload: TurnoTokenPayload = {
    turnoId,
    agenciaId,
    cedula,
    celular,
    activarAudio,
    activarPush,
    timestamp: Date.now()
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${EXPIRATION_MINUTES}m`,
    issuer: 'sistema-turnos',
    subject: 'turno-confirmacion'
  });

  console.log(`🔐 Token generado para turno ${turnoId} (expira en ${EXPIRATION_MINUTES} minutos)`);
  console.log(`   📱 Preferencias: Audio=${activarAudio}, Push=${activarPush}`);
  return token;
}

/**
 * Verifica y decodifica un token JWT
 * Retorna el payload si es válido, null si no lo es
 */
export function verificarTokenTurno(token: string): TurnoTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistema-turnos',
      subject: 'turno-confirmacion'
    }) as TurnoTokenPayload;

    console.log(`✅ Token válido para turno ${decoded.turnoId}`);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('⏰ Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('🚫 Token inválido o manipulado');
    } else {
      console.error('❌ Error verificando token:', error);
    }
    return null;
  }
}

/**
 * Decodifica un token sin verificar (solo para debug, NO usar en producción)
 */
export function decodificarTokenSinVerificar(token: string): TurnoTokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TurnoTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica si un token ha expirado
 */
export function tokenHaExpirado(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return false;
  } catch (error) {
    return error instanceof jwt.TokenExpiredError;
  }
}

// ============================================
// TOKENS DE ACCESO AL FORMULARIO
// ============================================

export interface AccesoTokenPayload {
  tipo: 'acceso-formulario';
  timestamp: number;
}

/**
 * Genera un token temporal de acceso al formulario
 * Expira según ACCESS_TOKEN_EXPIRATION_MINUTES del .env (default: 15 minutos)
 */
export function generarTokenAcceso(): string {
  const expirationMinutes = parseInt(process.env.ACCESS_TOKEN_EXPIRATION_MINUTES || '15', 10);
  
  const payload: AccesoTokenPayload = {
    tipo: 'acceso-formulario',
    timestamp: Date.now()
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${expirationMinutes}m`,
    issuer: 'sistema-turnos',
    subject: 'acceso-formulario'
  });

  console.log(`🔑 Token de acceso generado (expira en ${expirationMinutes} minutos)`);
  return token;
}

/**
 * Verifica un token de acceso al formulario
 * Retorna true si es válido, false si no lo es
 */
export function verificarTokenAcceso(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistema-turnos',
      subject: 'acceso-formulario'
    }) as AccesoTokenPayload;

    console.log('✅ Token de acceso válido');
    return decoded.tipo === 'acceso-formulario';
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('⏰ Token de acceso expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('🚫 Token de acceso inválido');
    }
    return false;
  }
}

// ============================================
// TOKENS DE SESIÓN DE ADMIN
// ============================================

export interface AdminSessionPayload {
  username: string;
  timestamp: number;
}

/**
 * Genera un token de sesión para el admin
 * Expira en 8 horas
 */
export function generarTokenSesionAdmin(username: string): string {
  const payload: AdminSessionPayload = {
    username,
    timestamp: Date.now()
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '8h', // 8 horas de sesión
    issuer: 'sistema-turnos',
    subject: 'admin-session'
  });

  console.log(`🔐 Sesión de admin creada para: ${username}`);
  return token;
}

/**
 * Verifica un token de sesión de admin
 * Retorna el username si es válido, null si no lo es
 */
export function verificarTokenSesionAdmin(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sistema-turnos',
      subject: 'admin-session'
    }) as AdminSessionPayload;

    console.log(`✅ Sesión de admin válida: ${decoded.username}`);
    return decoded.username;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('⏰ Sesión de admin expirada');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('🚫 Token de sesión inválido');
    }
    return null;
  }
}
