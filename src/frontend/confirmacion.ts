import type { ApiResponse } from './types';

// ==========================================
// Interfaces
// ==========================================
interface PublicConfig {
  logoUrl: string;
  expirationMinutes: number;
  asignacionDisplayTimeSeconds: number;
}

interface TokenVerificationResponse {
  success: boolean;
  turnoId: string;
  expiresAt?: string;
}

// ==========================================
// Constantes
// ==========================================
const PUBLIC_CONFIG_ENDPOINT = '/api/config/public';
const DEFAULT_LOGO_URL = 'https://www.chevyplan.com.ec/wp-content/uploads/2025/10/wb_chevyplan_logo-financiamiento-w_v5.webp';

let EXPIRATION_MINUTES = 1; // Default
let ASIGNACION_DISPLAY_TIME_SECONDS = 3; // Default - Tiempo en segundos antes de redirigir

// ==========================================
// Variables de Audio y Notificaciones
// ==========================================
let audioContext: AudioContext | null = null;
let audioHabilitado = false;
let audioBuffer: AudioBuffer | null = null;
let notificacionesPushHabilitadas = false;

// ==========================================
// Elementos del DOM
// ==========================================
const logoImg = document.getElementById('logoImg') as HTMLImageElement | null;
const turnoDisplay = document.getElementById('turnoDisplay') as HTMLDivElement | null;

// ==========================================
// Funciones de Utilidad
// ==========================================

/**
 * Obtiene el valor de un parámetro de la URL
 */
function obtenerParametroURL(nombre: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(nombre);
}

/**
 * Carga la configuración pública del servidor
 */
async function cargarConfiguracion(): Promise<void> {
  try {
    const respuesta = await fetch(PUBLIC_CONFIG_ENDPOINT, { cache: 'no-store' });
    
    if (respuesta.ok) {
      const data: PublicConfig = await respuesta.json();
      
      // Cargar logo
      if (logoImg && data.logoUrl) {
        logoImg.src = data.logoUrl;
        logoImg.onerror = () => {
          console.warn('Error cargando logo desde configuración');
          if (logoImg) logoImg.src = DEFAULT_LOGO_URL;
        };
      }
      
      // Cargar tiempo de expiración
      if (data.expirationMinutes) {
        EXPIRATION_MINUTES = data.expirationMinutes;
        console.log('⏱️ Tiempo de expiración:', EXPIRATION_MINUTES, 'minutos');
      }
      
      // Cargar tiempo de visualización de asignación
      if (data.asignacionDisplayTimeSeconds) {
        ASIGNACION_DISPLAY_TIME_SECONDS = data.asignacionDisplayTimeSeconds;
        console.log('⏱️ Tiempo de visualización de asignación:', ASIGNACION_DISPLAY_TIME_SECONDS, 'segundos');
      }
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
}

/**
 * Verifica y decodifica el token JWT
 */
async function verificarToken(token: string): Promise<TokenVerificationResponse | null> {
  try {
    const response = await fetch(`/api/token/verificar-token/${encodeURIComponent(token)}`);
    const data: TokenVerificationResponse = await response.json();
    
    if (data.success) {
      console.log('✅ Token válido:', data);
      return data;
    } else {
      console.warn('🚫 Token inválido o expirado');
      return null;
    }
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return null;
  }
}

/**
 * Muestra una página de error con el mensaje proporcionado
 */
function mostrarErrorToken(mensaje: string): void {
  document.body.innerHTML = `
    <style>
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(25px, 25px) scale(1.05); }
      }
      
      @media (max-width: 768px) {
        .error-container {
          padding: 24px 16px !important;
        }
        .error-card {
          padding: 32px 24px !important;
          max-width: 100% !important;
          width: calc(100vw - 32px) !important;
        }
        .error-logo {
          max-width: 180px !important;
          margin-bottom: 24px !important;
        }
        .error-icon {
          font-size: 56px !important;
        }
        .error-title {
          font-size: 24px !important;
        }
        .error-text {
          font-size: 15px !important;
        }
      }
    </style>
    <div class="error-container" style="
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100vh;
      background: #02539A;
      text-align: center;
      padding: 40px 20px;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    ">
      <div class="error-card" style="
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        padding: 48px;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
        color: #0f172a;
        max-width: 500px;
        width: 100%;
        position: relative;
        z-index: 1;
      ">
        <img 
          class="error-logo"
          src="${DEFAULT_LOGO_URL}" 
          alt="ChevyPlan Logo" 
          style="
            max-width: 200px;
            width: 100%;
            height: auto;
            margin: 0 auto 32px;
            display: block;
          "
        >
        <div class="error-icon" style="font-size: 64px; margin-bottom: 24px;">🚫</div>
        <h1 class="error-title" style="margin-bottom: 16px; font-size: 28px; font-weight: 700; color: #0f172a;">Acceso Denegado</h1>
        <p class="error-text" style="margin-bottom: 0; color: #475569; line-height: 1.6; font-size: 16px;">
          ${mensaje}
        </p>
      </div>
    </div>
  `;
}

/**
 * Muestra la página de turno cancelado
 */
function mostrarTurnoCancelado(): void {
  document.body.innerHTML = `
    <style>
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(25px, 25px) scale(1.05); }
      }

      @media (max-width: 768px) {
        .cancel-container {
          padding: 24px 16px !important;
        }
        .cancel-card {
          padding: 32px 24px !important;
          max-width: 100% !important;
          width: calc(100vw - 32px) !important;
        }
        .cancel-logo {
          max-width: 180px !important;
          margin-bottom: 24px !important;
        }
        .cancel-icon {
          font-size: 56px !important;
        }
        .cancel-title {
          font-size: 24px !important;
        }
        .cancel-text {
          font-size: 15px !important;
        }
      }
    </style>
    <div class="cancel-container" style="
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100vh;
      background: #02539A;
      text-align: center;
      padding: 40px 20px;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    ">
      <div class="cancel-card" style="
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        padding: 48px;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
        color: #0f172a;
        max-width: 500px;
        width: 100%;
        position: relative;
        z-index: 1;
      ">
        <img
          class="cancel-logo"
          src="${DEFAULT_LOGO_URL}"
          alt="ChevyPlan Logo"
          style="
            max-width: 200px;
            width: 100%;
            height: auto;
            margin: 0 auto 32px;
            display: block;
          "
        >
        <div class="cancel-icon" style="font-size: 64px; margin-bottom: 24px;">⚠️</div>
        <h1 class="cancel-title" style="margin-bottom: 16px; font-size: 28px; font-weight: 700; color: #0f172a;">Turno Cancelado</h1>
        <p class="cancel-text" style="margin-bottom: 24px; color: #475569; line-height: 1.6; font-size: 16px;">
          Tu turno ha sido cancelado. Por favor, solicita un nuevo turno si deseas ser atendido.
        </p>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
          Esta ventana se cerrará automáticamente en <span id="countdown">10</span> segundos.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
          También puedes cerrar esta ventana manualmente.
        </p>
      </div>
    </div>
  `;

  // Iniciar cuenta regresiva y cerrar ventana después de 10 segundos
  let segundosRestantes = 10;
  const countdownElement = document.getElementById('countdown');

  const intervalo = setInterval(() => {
    segundosRestantes--;
    if (countdownElement) {
      countdownElement.textContent = segundosRestantes.toString();
    }

    if (segundosRestantes <= 0) {
      clearInterval(intervalo);
      cerrarVentana();
    }
  }, 1000);
}

/**
 * Muestra la página de sesión finalizada
 */
function mostrarSesionFinalizada(): void {
  document.body.innerHTML = `
    <style>
      @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(25px, 25px) scale(1.05); }
      }
    </style>
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      height: 100vh;
      background: #02539A;
      text-align: center;
      padding: 40px 20px;
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    ">
      
      <img 
        src="${DEFAULT_LOGO_URL}" 
        alt="ChevyPlan Logo" 
        style="
          max-width: 220px;
          height: auto;
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
        "
      >
      
      <div style="
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        padding: 48px;
        border-radius: 24px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
        color: #0f172a;
        max-width: 420px;
        width: 100%;
        position: relative;
        z-index: 1;
      ">
        <div style="font-size: 64px; margin-bottom: 24px;">✅</div>
        <h1 style="margin-bottom: 16px; font-size: 28px; font-weight: 700;">Sesión Finalizada</h1>
        <p style="margin-bottom: 24px; color: #475569; line-height: 1.6; font-size: 16px;">
          Tu turno ha sido procesado. Gracias por usar nuestro sistema.
        </p>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
          Esta ventana se cerrará automáticamente en <span id="countdown">15</span> segundos.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
          También puedes cerrar esta ventana manualmente.
        </p>
      </div>
    </div>
  `;

  // Iniciar cuenta regresiva y cerrar ventana después de 15 segundos
  let segundosRestantes = 15;
  const countdownElement = document.getElementById('countdown');
  
  const intervalo = setInterval(() => {
    segundosRestantes--;
    if (countdownElement) {
      countdownElement.textContent = segundosRestantes.toString();
    }
    
    if (segundosRestantes <= 0) {
      clearInterval(intervalo);
      cerrarVentana();
    }
  }, 1000);
}

/**
 * Intenta cerrar la ventana/pestaña del navegador
 */
function cerrarVentana(): void {
  console.log('🚪 Intentando cerrar la ventana...');
  
  // Método 1: Intentar cerrar directamente
  try {
    window.close();
  } catch (error) {
    console.warn('⚠️ No se pudo cerrar con window.close():', error);
  }
  
  // Método 2: Si window.close() no funciona, redirigir a about:blank
  setTimeout(() => {
    if (!window.closed) {
      console.log('🔄 Redirigiendo a about:blank...');
      window.location.href = 'about:blank';
    }
  }, 500);
}

// ==========================================
// Funciones de Audio y Notificaciones
// ==========================================

/**
 * Genera un tono de notificación usando Web Audio API
 */
async function generarTonoNotificacion(): Promise<AudioBuffer | null> {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const sampleRate = audioContext.sampleRate;
    const duration = 0.3; // 300ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);

    // Generar un tono agradable (dos notas)
    for (let i = 0; i < channel.length; i++) {
      const t = i / sampleRate;
      const freq1 = 800; // Nota principal
      const freq2 = 1000; // Nota secundaria
      
      // Mezcla de dos frecuencias
      const value = (Math.sin(2 * Math.PI * freq1 * t) * 0.3 + 
                     Math.sin(2 * Math.PI * freq2 * t) * 0.3);
      
      // Envelope (fade in/out)
      const envelope = Math.min(t * 10, 1) * Math.max(1 - (t - duration + 0.1) * 10, 0);
      channel[i] = value * envelope;
    }

    return buffer;
  } catch (error) {
    console.error('❌ Error generando tono:', error);
    return null;
  }
}

/**
 * Intenta cargar un archivo de audio MP3/OGG
 */
async function cargarArchivoAudio(url: string): Promise<AudioBuffer | null> {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    
    console.log('✅ Archivo de audio cargado correctamente');
    return buffer;
  } catch (error) {
    console.warn('⚠️ No se pudo cargar el archivo de audio, usando tono generado');
    return null;
  }
}

/**
 * Inicializa el sistema de audio
 */
async function inicializarAudio(): Promise<void> {
  console.log('🔊 Inicializando sistema de audio...');
  
  try {
    // Intentar cargar archivo MP3 primero
    audioBuffer = await cargarArchivoAudio('/sounds/notification.mp3');
    
    // Si falla, usar tono generado
    if (!audioBuffer) {
      audioBuffer = await generarTonoNotificacion();
    }
    
    audioHabilitado = true;
    console.log('✅ Sistema de audio inicializado');
  } catch (error) {
    console.error('❌ Error inicializando audio:', error);
    audioHabilitado = false;
  }
}

/**
 * Reproduce el sonido de notificación
 */
function reproducirSonido(): void {
  if (!audioHabilitado || !audioBuffer || !audioContext) {
    console.warn('⚠️ Audio no disponible');
    return;
  }

  try {
    // Reanudar contexto si está suspendido (requerido en iOS)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // Crear fuente de audio
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    
    // Crear ganancia para controlar volumen
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5; // 50% volumen
    
    // Conectar: source -> gain -> destination
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Reproducir
    source.start(0);
    console.log('🔊 Sonido reproducido');
  } catch (error) {
    console.error('❌ Error reproduciendo sonido:', error);
  }
}

/**
 * Vibra el dispositivo (solo móviles)
 */
function vibrarDispositivo(): void {
  if ('vibrate' in navigator) {
    try {
      // Patrón: vibrar 200ms, pausa 100ms, vibrar 200ms
      navigator.vibrate([200, 100, 200]);
      console.log('📳 Dispositivo vibrando');
    } catch (error) {
      console.warn('⚠️ Vibración no disponible:', error);
    }
  }
}

// ==========================================
// Funciones de Notificaciones Push
// ==========================================

/**
 * Verifica si las notificaciones push están soportadas
 */
function notificacionesSoportadas(): boolean {
  return 'Notification' in window;
}

/**
 * Solicita permisos para notificaciones push
 */
async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (!notificacionesSoportadas()) {
    console.warn('⚠️ Notificaciones push no soportadas en este navegador');
    return false;
  }

  try {
    const permiso = await Notification.requestPermission();
    
    if (permiso === 'granted') {
      console.log('✅ Permisos de notificación concedidos');
      notificacionesPushHabilitadas = true;
      return true;
    } else if (permiso === 'denied') {
      console.warn('❌ Permisos de notificación denegados');
      notificacionesPushHabilitadas = false;
      return false;
    } else {
      console.log('ℹ️ Permisos de notificación no decididos');
      notificacionesPushHabilitadas = false;
      return false;
    }
  } catch (error) {
    console.error('❌ Error solicitando permisos de notificación:', error);
    notificacionesPushHabilitadas = false;
    return false;
  }
}

/**
 * Envía una notificación push
 */
function enviarNotificacionPush(titulo: string, opciones: NotificationOptions): void {
  if (!notificacionesPushHabilitadas || !notificacionesSoportadas()) {
    console.warn('⚠️ Notificaciones push no habilitadas');
    return;
  }

  try {
    const notificacion = new Notification(titulo, opciones);
    
    // Reproducir sonido también cuando se hace clic en la notificación
    notificacion.onclick = () => {
      window.focus();
      notificacion.close();
    };
    
    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
      notificacion.close();
    }, 10000);
    
    console.log('📬 Notificación push enviada');
  } catch (error) {
    console.error('❌ Error enviando notificación push:', error);
  }
}

/**
 * Consulta el estado de asignación del turno (polling)
 */
async function verificarAsignacionTurno(numeroTurno: string, agenciaId: number): Promise<void> {
  console.log(`🔄 Iniciando polling para turno: ${numeroTurno} de agencia ${agenciaId}`);

  let asignacionMostrada = false; // Bandera para evitar mostrar asignación múltiples veces

  const intervalo = setInterval(async () => {
    try {
      console.log(`🔍 Consultando estado del turno ${numeroTurno} de agencia ${agenciaId}...`);

      const response = await fetch(`/api/turnos/estado/${encodeURIComponent(numeroTurno)}?agenciaId=${agenciaId}`);
      const data: ApiResponse<{
        asignado: boolean;
        finalizado: boolean;
        cancelado: boolean;
        estado: string;
        modulo?: string;
        asesor?: string;
      }> = await response.json();

      if (!data.success || !data.data) {
        return;
      }

      // Si el turno fue cancelado, mostrar mensaje y finalizar
      if (data.data.cancelado) {
        clearInterval(intervalo);
        console.log('❌ Turno cancelado');
        mostrarTurnoCancelado();
        return;
      }

      // Si el turno fue finalizado, mostrar pantalla de finalización
      if (data.data.finalizado) {
        clearInterval(intervalo);
        console.log('✅ Turno finalizado');
        mostrarSesionFinalizada();
        return;
      }

      // Si el turno fue asignado pero no finalizado, mostrar información de asignación
      if (data.data.asignado && !asignacionMostrada) {
        asignacionMostrada = true; // Marcar que ya se mostró
        console.log('✅ Turno asignado:', data.data);

        // Mostrar información de asignación (NO detener polling, seguir esperando finalización)
        mostrarAsignacion(data.data.modulo!, data.data.asesor!);
      }
    } catch (error) {
      console.error('❌ Error consultando estado del turno:', error);
    }
  }, 5000); // Cada 5 segundos
}

/**
 * Muestra la información de asignación del turno
 */
function mostrarAsignacion(modulo: string, asesor: string): void {
  console.log('🎯 mostrarAsignacion llamada con:', { modulo, asesor });
  
  const asignacionInfo = document.getElementById('asignacion-info');
  const moduloSpan = document.getElementById('modulo');
  const asesorSpan = document.getElementById('asesor');
  
  console.log('📍 Elementos encontrados:', {
    asignacionInfo: !!asignacionInfo,
    moduloSpan: !!moduloSpan,
    asesorSpan: !!asesorSpan
  });
  
  if (asignacionInfo && moduloSpan && asesorSpan) {
    moduloSpan.textContent = modulo;
    asesorSpan.textContent = asesor;
    asignacionInfo.style.display = 'block';
    
    console.log('✅ Asignación mostrada correctamente:', {
      modulo: moduloSpan.textContent,
      asesor: asesorSpan.textContent,
      display: asignacionInfo.style.display
    });

    // Reproducir todas las notificaciones
    reproducirSonido();
    vibrarDispositivo();
    
    // Enviar notificación push
    enviarNotificacionPush('🎫 Turno Asignado', {
      body: `Dirígete a ${modulo}\nTe atenderá: ${asesor}`,
      icon: DEFAULT_LOGO_URL,
      badge: DEFAULT_LOGO_URL,
      tag: 'turno-asignado',
      requireInteraction: false,
      silent: false, // Permitir sonido de la notificación
      data: {
        modulo,
        asesor,
        timestamp: Date.now()
      }
    });
  } else {
    console.error('❌ No se encontraron todos los elementos necesarios');
  }
}

/**
 * Previene que el usuario retroceda al formulario
 */
function prevenirRetroceso(): void {
  // Agregar estado al historial para evitar retroceso
  history.pushState(null, '', location.href);
  
  window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
  });
}

// ==========================================
// Inicialización
// ==========================================

/**
 * Función principal de inicialización
 */
(async function inicializar(): Promise<void> {
  try {
    // Cargar configuración primero
    await cargarConfiguracion();
    
    // Obtener token de la URL
    const token = obtenerParametroURL('token');
    
    if (!token) {
      console.warn('No se encontró token en la URL');
      mostrarErrorToken('El enlace no es válido o ha sido modificado. Por favor, solicita un nuevo turno.');
      return;
    }

    // Verificar el token con el servidor
    const tokenData = await verificarToken(token);
    
    if (!tokenData || !tokenData.success) {
      mostrarErrorToken('El token es inválido, ha expirado o ha sido manipulado. Por favor, solicita un nuevo turno.');
      return;
    }

    // Token válido - mostrar turno
    if (turnoDisplay) {
      turnoDisplay.textContent = tokenData.turnoId;
      console.log('🎫 Turno cargado:', tokenData.turnoId);
    }
    
    // Auto-inicializar sistemas de notificación según preferencias del usuario
    const activarAudio = (tokenData as any).activarAudio ?? false;
    const activarPush = (tokenData as any).activarPush ?? false;
    // Extraer agenciaId de la URL
    function obtenerParametroURL(nombre: string): string | null {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(nombre);
    }
    const agenciaIdParam = obtenerParametroURL('id_agencia');
    const agenciaId = agenciaIdParam ? parseInt(agenciaIdParam) : undefined;
    if (!agenciaId || isNaN(agenciaId)) {
      console.error('❌ URL inválida: falta id_agencia');
      throw new Error('URL inválida: falta id_agencia');
    }
    console.log(`📱 Preferencias de notificación: Audio=${activarAudio}, Push=${activarPush}`);
    console.log(`🏢 Agencia ID (URL): ${agenciaId}`);
    
    if (activarAudio) {
      await inicializarAudio();
      console.log('✅ Audio activado automáticamente por preferencias del usuario');
    } else {
      audioHabilitado = false;
      console.log('ℹ️ Audio desactivado según preferencias del usuario');
    }
    
    if (activarPush) {
      await solicitarPermisosNotificaciones();
      console.log('✅ Push notifications activadas automáticamente por preferencias del usuario');
    } else {
      console.log('ℹ️ Push notifications desactivadas según preferencias del usuario');
    }
    
    // Iniciar polling para verificar asignación
    verificarAsignacionTurno(tokenData.turnoId, agenciaId);
    
    // Prevenir retroceso
    prevenirRetroceso();
    
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    mostrarErrorToken('Ocurrió un error al procesar tu turno. Por favor, intenta nuevamente.');
  }
})();
