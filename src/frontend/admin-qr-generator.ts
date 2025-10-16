import type { ApiResponse } from './types';

// ==========================================
// Interfaces
// ==========================================
interface PublicConfig {
  logoUrl?: string;
  accessTokenExpirationMinutes?: number;
}

interface SesionVerificationResponse {
  success: boolean;
  username?: string;
}

interface Agencia {
  id: number;
  nombre: string;
  codigo: string;
}

// Declaración para la librería qrcode (cargada vía CDN)
declare const qrcode: any;

// ==========================================
// Variables Globales
// ==========================================
let currentAccessToken: string | null = null;
let expirationMinutes = 15;
let countdownInterval: number | null = null;
let qrGeneratedCount = 0;
let sessionStartTime = Date.now();
let sessionTimeInterval: number | null = null;
let agencias: Agencia[] = [];

// ==========================================
// Elementos del DOM
// ==========================================
const logoImg = document.getElementById('logoImg') as HTMLImageElement;
const adminUsername = document.getElementById('adminUsername') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const qrCanvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
const qrCountDisplay = document.getElementById('qrCount') as HTMLDivElement;
const sessionTimeDisplay = document.getElementById('sessionTime') as HTMLDivElement;

// ==========================================
// Funciones de Sesión
// ==========================================

/**
 * Verifica que el usuario tenga una sesión admin válida
 */
async function verificarSesion(): Promise<boolean> {
  const sessionToken = sessionStorage.getItem('admin_session_token');
  
  if (!sessionToken) {
    console.log('No hay token de sesión, redirigiendo...');
    window.location.href = '/admin-login.html';
    return false;
  }

  try {
    const response = await fetch('/api/token/admin/verificar-sesion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token: sessionToken })
    });

    const data: ApiResponse<SesionVerificationResponse> = await response.json();

    if (!data.success) {
      console.log('Sesión inválida o expirada');
      sessionStorage.removeItem('admin_session_token');
      window.location.href = '/admin-login.html';
      return false;
    }

    // Mostrar nombre de usuario
    if (data.data?.username && adminUsername) {
      adminUsername.textContent = data.data.username;
    }

    return true;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    mostrarError('Error verificando la sesión. Intenta iniciar sesión nuevamente.');
    setTimeout(() => {
      window.location.href = '/admin-login.html';
    }, 2000);
    return false;
  }
}

/**
 * Carga la configuración del servidor
 */
async function cargarConfiguracion(): Promise<void> {
  try {
    const response = await fetch('/api/config/public');
    const config: PublicConfig = await response.json();
    
    if (config.logoUrl && logoImg) {
      logoImg.src = config.logoUrl;
    }
    
    if (config.accessTokenExpirationMinutes) {
      expirationMinutes = config.accessTokenExpirationMinutes;
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
}

/**
 * Carga la lista de agencias desde el API
 */
async function cargarAgencias(): Promise<void> {
  try {
    const response = await fetch('/api/turnos/agencias');
    const data: ApiResponse<Agencia[]> = await response.json();
    
    if (data.success && data.data) {
      agencias = data.data;
      const selectAgencia = document.getElementById('selectAgencia') as HTMLSelectElement;
      
      if (selectAgencia) {
        selectAgencia.innerHTML = '<option value="">Selecciona una agencia</option>';
        agencias.forEach(agencia => {
          const option = document.createElement('option');
          option.value = agencia.id.toString();
          option.textContent = `${agencia.nombre} (${agencia.codigo})`;
          selectAgencia.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Error cargando agencias:', error);
    mostrarError('Error al cargar las agencias');
  }
}

// ==========================================
// Funciones de Generación QR
// ==========================================

/**
 * Genera un nuevo código QR con token de acceso y agencia
 */
async function generarNuevoQR(): Promise<void> {
  try {
    mostrarError(''); // Limpiar errores previos

    // Obtener agencia seleccionada
    const selectAgencia = document.getElementById('selectAgencia') as HTMLSelectElement;
    if (!selectAgencia || !selectAgencia.value) {
      mostrarError('Por favor selecciona una agencia');
      return;
    }

    const agenciaId = parseInt(selectAgencia.value);

    // Verificar que la librería qrcode esté cargada
    if (typeof qrcode === 'undefined') {
      throw new Error('Librería qrcode no está cargada. Verifica tu conexión a internet.');
    }

    // Generar token de acceso desde el API
    const response = await fetch('/api/token/generar-acceso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agenciaId })
    });

    const data: ApiResponse<{ token: string }> = await response.json();

    if (!data.success || !data.data?.token) {
      throw new Error(data.message || 'Error al generar el token');
    }

    const token = data.data.token;
    currentAccessToken = token;

    // Construir URL con token y agencia
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/solicitar-turno.html?id_agencia=${agenciaId}&access=${token}`;

    console.log('📱 Generando QR para agencia', agenciaId, '- URL:', qrUrl);

    // Generar QR usando qrcode-generator
    const qr = qrcode(0, 'M');
    qr.addData(qrUrl);
    qr.make();

    // Dibujar QR en canvas
    if (!qrCanvas) {
      throw new Error('Canvas no encontrado');
    }

    const cellSize = 8;
    const margin = 4;
    const size = qr.getModuleCount() * cellSize + margin * 2;
    
    qrCanvas.width = size;
    qrCanvas.height = size;
    
    const ctx = qrCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto 2D del canvas');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    for (let row = 0; row < qr.getModuleCount(); row++) {
      for (let col = 0; col < qr.getModuleCount(); col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(
            col * cellSize + margin,
            row * cellSize + margin,
            cellSize,
            cellSize
          );
        }
      }
    }

    // Incrementar contador
    qrGeneratedCount++;
    if (qrCountDisplay) {
      qrCountDisplay.textContent = qrGeneratedCount.toString();
    }

    console.log('✅ QR permanente generado exitosamente');

  } catch (error) {
    console.error('Error generando QR:', error);
    mostrarError('Error al generar el código QR. Por favor intenta nuevamente.');
  }
}

/**
 * Descarga el código QR como imagen PNG
 */
function descargarQR(): void {
  if (!currentAccessToken) {
    mostrarError('Primero genera un código QR');
    return;
  }

  if (!qrCanvas) {
    mostrarError('Canvas no encontrado');
    return;
  }

  try {
    const url = qrCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-turno-chevyplan-${Date.now()}.png`;
    link.href = url;
    link.click();
    console.log('💾 QR descargado');
  } catch (error) {
    console.error('Error descargando QR:', error);
    mostrarError('Error al descargar el QR');
  }
}

// ==========================================
// Funciones de UI
// ==========================================

/**
 * Muestra un mensaje de error al usuario
 */
function mostrarError(mensaje: string): void {
  if (!errorMessage) return;

  if (mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.style.display = 'block';
  } else {
    errorMessage.style.display = 'none';
  }
}

/**
 * Cierra la sesión del administrador
 */
function logout(): void {
  if (confirm('¿Estás seguro de que quieres cerrar la sesión?')) {
    sessionStorage.removeItem('admin_session_token');
    sessionStorage.removeItem('admin_username');
    window.location.href = '/admin-login.html';
  }
}

/**
 * Actualiza el contador de tiempo de sesión
 */
function actualizarTiempoSesion(): void {
  sessionTimeInterval = window.setInterval(() => {
    const elapsed = Date.now() - sessionStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (sessionTimeDisplay) {
      sessionTimeDisplay.textContent = display;
    }
  }, 1000);
}

// ==========================================
// Exportar funciones al scope global
// ==========================================
// Necesario porque los onclick en HTML las llaman directamente
(window as any).generarNuevoQR = generarNuevoQR;
(window as any).descargarQR = descargarQR;
(window as any).logout = logout;

// ==========================================
// Inicialización
// ==========================================

/**
 * Inicializa el panel de administración
 */
async function inicializar(): Promise<void> {
  try {
    // Verificar sesión primero
    const sesionValida = await verificarSesion();
    if (!sesionValida) return;

    // Cargar configuración
    await cargarConfiguracion();

    // Cargar agencias
    await cargarAgencias();

    // Mostrar botón de generar QR (ahora que tenemos las agencias cargadas)
    const btnGenerar = document.querySelector('.btn-primary') as HTMLButtonElement;
    if (btnGenerar) {
      btnGenerar.style.display = 'flex';
    }

    // Configurar event listeners de los botones
    const btnGenerarQR = document.getElementById('btnGenerarQR');
    const btnDescargarQR = document.getElementById('btnDescargarQR');
    const btnLogout = document.getElementById('btnLogout');

    if (btnGenerarQR) {
      btnGenerarQR.addEventListener('click', () => generarNuevoQR());
    }
    if (btnDescargarQR) {
      btnDescargarQR.addEventListener('click', descargarQR);
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', logout);
    }

    console.log('✅ Event listeners configurados correctamente');

    // Iniciar contador de tiempo de sesión
    actualizarTiempoSesion();

    console.log('🔒 Panel de admin inicializado correctamente');
  } catch (error) {
    console.error('Error en inicialización:', error);
    mostrarError('Error al inicializar el panel. Por favor recarga la página.');
  }
}

// Ejecutar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', inicializar);

// Limpiar intervalos al salir
window.addEventListener('beforeunload', () => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (sessionTimeInterval) clearInterval(sessionTimeInterval);
});

// Verificar que la librería qrcode esté disponible
if (typeof qrcode === 'undefined') {
  console.error('❌ qrcode no está cargado. Verifica el CDN.');
}
