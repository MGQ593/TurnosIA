"use strict";
(() => {
  const PUBLIC_CONFIG_ENDPOINT = "/api/config/public";
  const DEFAULT_LOGO_URL = "https://www.chevyplan.com.ec/wp-content/uploads/2025/10/wb_chevyplan_logo-financiamiento-w_v5.webp";
  let EXPIRATION_MINUTES = 1;
  let ASIGNACION_DISPLAY_TIME_SECONDS = 3;
  let audioContext = null;
  let audioHabilitado = false;
  let audioBuffer = null;
  let notificacionesPushHabilitadas = false;
  const logoImg = document.getElementById("logoImg");
  const turnoDisplay = document.getElementById("turnoDisplay");
  function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
  }
  async function cargarConfiguracion() {
    try {
      const respuesta = await fetch(PUBLIC_CONFIG_ENDPOINT, { cache: "no-store" });
      if (respuesta.ok) {
        const data = await respuesta.json();
        if (logoImg && data.logoUrl) {
          logoImg.src = data.logoUrl;
          logoImg.onerror = () => {
            console.warn("Error cargando logo desde configuraci\xF3n");
            if (logoImg) logoImg.src = DEFAULT_LOGO_URL;
          };
        }
        if (data.expirationMinutes) {
          EXPIRATION_MINUTES = data.expirationMinutes;
          console.log("\u23F1\uFE0F Tiempo de expiraci\xF3n:", EXPIRATION_MINUTES, "minutos");
        }
        if (data.asignacionDisplayTimeSeconds) {
          ASIGNACION_DISPLAY_TIME_SECONDS = data.asignacionDisplayTimeSeconds;
          console.log("\u23F1\uFE0F Tiempo de visualizaci\xF3n de asignaci\xF3n:", ASIGNACION_DISPLAY_TIME_SECONDS, "segundos");
        }
      }
    } catch (error) {
      console.error("Error cargando configuraci\xF3n:", error);
    }
  }
  async function verificarToken(token) {
    try {
      const response = await fetch(`/api/token/verificar-token/${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.success) {
        console.log("\u2705 Token v\xE1lido:", data);
        return data;
      } else {
        console.warn("\u{1F6AB} Token inv\xE1lido o expirado");
        return null;
      }
    } catch (error) {
      console.error("\u274C Error verificando token:", error);
      return null;
    }
  }
  function mostrarErrorToken(mensaje) {
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
        <div class="error-icon" style="font-size: 64px; margin-bottom: 24px;">\u{1F6AB}</div>
        <h1 class="error-title" style="margin-bottom: 16px; font-size: 28px; font-weight: 700; color: #0f172a;">Acceso Denegado</h1>
        <p class="error-text" style="margin-bottom: 0; color: #475569; line-height: 1.6; font-size: 16px;">
          ${mensaje}
        </p>
      </div>
    </div>
  `;
  }
  function mostrarSesionFinalizada() {
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
        <div style="font-size: 64px; margin-bottom: 24px;">\u2705</div>
        <h1 style="margin-bottom: 16px; font-size: 28px; font-weight: 700;">Sesi\xF3n Finalizada</h1>
        <p style="margin-bottom: 24px; color: #475569; line-height: 1.6; font-size: 16px;">
          Tu turno ha sido procesado. Gracias por usar nuestro sistema.
        </p>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
          Esta ventana se cerrar\xE1 autom\xE1ticamente en <span id="countdown">15</span> segundos.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
          Tambi\xE9n puedes cerrar esta ventana manualmente.
        </p>
      </div>
    </div>
  `;
    let segundosRestantes = 15;
    const countdownElement = document.getElementById("countdown");
    const intervalo = setInterval(() => {
      segundosRestantes--;
      if (countdownElement) {
        countdownElement.textContent = segundosRestantes.toString();
      }
      if (segundosRestantes <= 0) {
        clearInterval(intervalo);
        cerrarVentana();
      }
    }, 1e3);
  }
  function cerrarVentana() {
    console.log("\u{1F6AA} Intentando cerrar la ventana...");
    try {
      window.close();
    } catch (error) {
      console.warn("\u26A0\uFE0F No se pudo cerrar con window.close():", error);
    }
    setTimeout(() => {
      if (!window.closed) {
        console.log("\u{1F504} Redirigiendo a about:blank...");
        window.location.href = "about:blank";
      }
    }, 500);
  }
  async function generarTonoNotificacion() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const sampleRate = audioContext.sampleRate;
      const duration = 0.3;
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++) {
        const t = i / sampleRate;
        const freq1 = 800;
        const freq2 = 1e3;
        const value = Math.sin(2 * Math.PI * freq1 * t) * 0.3 + Math.sin(2 * Math.PI * freq2 * t) * 0.3;
        const envelope = Math.min(t * 10, 1) * Math.max(1 - (t - duration + 0.1) * 10, 0);
        channel[i] = value * envelope;
      }
      return buffer;
    } catch (error) {
      console.error("\u274C Error generando tono:", error);
      return null;
    }
  }
  async function cargarArchivoAudio(url) {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log("\u2705 Archivo de audio cargado correctamente");
      return buffer;
    } catch (error) {
      console.warn("\u26A0\uFE0F No se pudo cargar el archivo de audio, usando tono generado");
      return null;
    }
  }
  async function inicializarAudio() {
    console.log("\u{1F50A} Inicializando sistema de audio...");
    try {
      audioBuffer = await cargarArchivoAudio("/sounds/notification.mp3");
      if (!audioBuffer) {
        audioBuffer = await generarTonoNotificacion();
      }
      audioHabilitado = true;
      console.log("\u2705 Sistema de audio inicializado");
    } catch (error) {
      console.error("\u274C Error inicializando audio:", error);
      audioHabilitado = false;
    }
  }
  function reproducirSonido() {
    if (!audioHabilitado || !audioBuffer || !audioContext) {
      console.warn("\u26A0\uFE0F Audio no disponible");
      return;
    }
    try {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.5;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);
      console.log("\u{1F50A} Sonido reproducido");
    } catch (error) {
      console.error("\u274C Error reproduciendo sonido:", error);
    }
  }
  function vibrarDispositivo() {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
        console.log("\u{1F4F3} Dispositivo vibrando");
      } catch (error) {
        console.warn("\u26A0\uFE0F Vibraci\xF3n no disponible:", error);
      }
    }
  }
  function notificacionesSoportadas() {
    return "Notification" in window;
  }
  async function solicitarPermisosNotificaciones() {
    if (!notificacionesSoportadas()) {
      console.warn("\u26A0\uFE0F Notificaciones push no soportadas en este navegador");
      return false;
    }
    try {
      const permiso = await Notification.requestPermission();
      if (permiso === "granted") {
        console.log("\u2705 Permisos de notificaci\xF3n concedidos");
        notificacionesPushHabilitadas = true;
        return true;
      } else if (permiso === "denied") {
        console.warn("\u274C Permisos de notificaci\xF3n denegados");
        notificacionesPushHabilitadas = false;
        return false;
      } else {
        console.log("\u2139\uFE0F Permisos de notificaci\xF3n no decididos");
        notificacionesPushHabilitadas = false;
        return false;
      }
    } catch (error) {
      console.error("\u274C Error solicitando permisos de notificaci\xF3n:", error);
      notificacionesPushHabilitadas = false;
      return false;
    }
  }
  function enviarNotificacionPush(titulo, opciones) {
    if (!notificacionesPushHabilitadas || !notificacionesSoportadas()) {
      console.warn("\u26A0\uFE0F Notificaciones push no habilitadas");
      return;
    }
    try {
      const notificacion = new Notification(titulo, opciones);
      notificacion.onclick = () => {
        window.focus();
        notificacion.close();
      };
      setTimeout(() => {
        notificacion.close();
      }, 1e4);
      console.log("\u{1F4EC} Notificaci\xF3n push enviada");
    } catch (error) {
      console.error("\u274C Error enviando notificaci\xF3n push:", error);
    }
  }
  async function verificarAsignacionTurno(numeroTurno, agenciaId) {
    console.log(`\u{1F504} Iniciando polling para turno: ${numeroTurno} de agencia ${agenciaId}`);
    const intervalo = setInterval(async () => {
      try {
        console.log(`\u{1F50D} Consultando estado del turno ${numeroTurno} de agencia ${agenciaId}...`);
        const response = await fetch(`/api/turnos/estado/${encodeURIComponent(numeroTurno)}?agenciaId=${agenciaId}`);
        const data = await response.json();
        if (data.success && data.data?.asignado) {
          clearInterval(intervalo);
          console.log("\u2705 Turno asignado:", data.data);
          mostrarAsignacion(data.data.modulo, data.data.asesor);
          const displayTime = ASIGNACION_DISPLAY_TIME_SECONDS * 1e3;
          console.log(`\u23F1\uFE0F Esperando ${ASIGNACION_DISPLAY_TIME_SECONDS} segundos antes de redirigir...`);
          setTimeout(() => {
            mostrarSesionFinalizada();
          }, displayTime);
        }
      } catch (error) {
        console.error("\u274C Error consultando estado del turno:", error);
      }
    }, 5e3);
  }
  function mostrarAsignacion(modulo, asesor) {
    console.log("\u{1F3AF} mostrarAsignacion llamada con:", { modulo, asesor });
    const asignacionInfo = document.getElementById("asignacion-info");
    const moduloSpan = document.getElementById("modulo");
    const asesorSpan = document.getElementById("asesor");
    console.log("\u{1F4CD} Elementos encontrados:", {
      asignacionInfo: !!asignacionInfo,
      moduloSpan: !!moduloSpan,
      asesorSpan: !!asesorSpan
    });
    if (asignacionInfo && moduloSpan && asesorSpan) {
      moduloSpan.textContent = modulo;
      asesorSpan.textContent = asesor;
      asignacionInfo.style.display = "block";
      console.log("\u2705 Asignaci\xF3n mostrada correctamente:", {
        modulo: moduloSpan.textContent,
        asesor: asesorSpan.textContent,
        display: asignacionInfo.style.display
      });
      reproducirSonido();
      vibrarDispositivo();
      enviarNotificacionPush("\u{1F3AB} Turno Asignado", {
        body: `Dir\xEDgete a ${modulo}
Te atender\xE1: ${asesor}`,
        icon: DEFAULT_LOGO_URL,
        badge: DEFAULT_LOGO_URL,
        tag: "turno-asignado",
        requireInteraction: false,
        silent: false,
        // Permitir sonido de la notificación
        data: {
          modulo,
          asesor,
          timestamp: Date.now()
        }
      });
    } else {
      console.error("\u274C No se encontraron todos los elementos necesarios");
    }
  }
  function prevenirRetroceso() {
    history.pushState(null, "", location.href);
    window.addEventListener("popstate", () => {
      history.pushState(null, "", location.href);
    });
  }
  (async function inicializar() {
    try {
      await cargarConfiguracion();
      const token = obtenerParametroURL("token");
      if (!token) {
        console.warn("No se encontr\xF3 token en la URL");
        mostrarErrorToken("El enlace no es v\xE1lido o ha sido modificado. Por favor, solicita un nuevo turno.");
        return;
      }
      const tokenData = await verificarToken(token);
      if (!tokenData || !tokenData.success) {
        mostrarErrorToken("El token es inv\xE1lido, ha expirado o ha sido manipulado. Por favor, solicita un nuevo turno.");
        return;
      }
      if (turnoDisplay) {
        turnoDisplay.textContent = tokenData.turnoId;
        console.log("\u{1F3AB} Turno cargado:", tokenData.turnoId);
      }
      const activarAudio = tokenData.activarAudio ?? false;
      const activarPush = tokenData.activarPush ?? false;
      const agenciaId = tokenData.agenciaId;
      if (!agenciaId) {
        throw new Error("Token inv\xE1lido: falta agenciaId");
      }
      console.log(`\u{1F4F1} Preferencias de notificaci\xF3n: Audio=${activarAudio}, Push=${activarPush}`);
      console.log(`\u{1F3E2} Agencia ID: ${agenciaId}`);
      if (activarAudio) {
        await inicializarAudio();
        console.log("\u2705 Audio activado autom\xE1ticamente por preferencias del usuario");
      } else {
        audioHabilitado = false;
        console.log("\u2139\uFE0F Audio desactivado seg\xFAn preferencias del usuario");
      }
      if (activarPush) {
        await solicitarPermisosNotificaciones();
        console.log("\u2705 Push notifications activadas autom\xE1ticamente por preferencias del usuario");
      } else {
        console.log("\u2139\uFE0F Push notifications desactivadas seg\xFAn preferencias del usuario");
      }
      verificarAsignacionTurno(tokenData.turnoId, agenciaId);
      prevenirRetroceso();
    } catch (error) {
      console.error("\u274C Error en inicializaci\xF3n:", error);
      mostrarErrorToken("Ocurri\xF3 un error al procesar tu turno. Por favor, intenta nuevamente.");
    }
  })();
})();
//# sourceMappingURL=confirmacion.js.map
