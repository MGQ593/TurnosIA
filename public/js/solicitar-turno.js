"use strict";
(() => {
  const DEFAULT_LOGO_URL = "https://www.chevyplan.com.ec/wp-content/uploads/2025/10/wb_chevyplan_logo-financiamiento-w_v5.webp";
  const PUBLIC_CONFIG_ENDPOINT = "/api/config/public";
  const TURNO_STORAGE_KEY = "turno_actual";
  const RATE_LIMIT_MS = 3e3;
  const form = document.getElementById("turnoForm");
  const loading = document.getElementById("loading");
  const formShell = document.getElementById("formShell");
  const successMessage = document.getElementById("successMessage");
  const alertContainer = document.getElementById("alertContainer");
  const turnoIdMensaje = document.getElementById("turnoIdMensaje");
  const turnoIdElemento = document.getElementById("turnoId");
  const submitBtn = document.getElementById("submitBtn");
  const cedulaInput = document.getElementById("cedula");
  const celularInput = document.getElementById("celular");
  const logoImg = document.getElementById("brandLogo");
  const headerElement = document.querySelector(".header");
  let lastSubmitTime = 0;
  let RESET_PARAM = "nuevo";
  let EXPIRATION_MINUTES = 30;
  let WHATSAPP_API_URL = "";
  let WHATSAPP_API_TOKEN = "";
  function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
  }
  function turnoHaExpirado(timestamp) {
    const ahora = (/* @__PURE__ */ new Date()).getTime();
    const tiempoTurno = new Date(timestamp).getTime();
    const diferenciaMinutos = (ahora - tiempoTurno) / (1e3 * 60);
    return diferenciaMinutos >= EXPIRATION_MINUTES;
  }
  function verificarTurnoGuardado() {
    try {
      const resetParam = obtenerParametroURL("nuevo");
      const turnoGuardado = localStorage.getItem(TURNO_STORAGE_KEY);
      if (turnoGuardado) {
        const turnoData = JSON.parse(turnoGuardado);
        if (resetParam === "true") {
          if (turnoHaExpirado(turnoData.timestamp)) {
            localStorage.removeItem(TURNO_STORAGE_KEY);
            console.log("\u2705 Turno expirado y limpiado. Nuevo turno permitido.");
            window.history.replaceState({}, document.title, window.location.pathname);
            return false;
          } else {
            const minutosRestantes = Math.ceil(EXPIRATION_MINUTES - ((/* @__PURE__ */ new Date()).getTime() - new Date(turnoData.timestamp).getTime()) / (1e3 * 60));
            mostrarAlerta(`\u23F1\uFE0F Debe esperar ${minutosRestantes} minuto(s) m\xE1s antes de solicitar un nuevo turno.`, "error");
            mostrarResultado(turnoData.turnoId, null);
            return true;
          }
        }
        if (turnoHaExpirado(turnoData.timestamp)) {
          localStorage.removeItem(TURNO_STORAGE_KEY);
          return false;
        }
        mostrarResultado(turnoData.turnoId, null);
        const tiempoTranscurrido = ((/* @__PURE__ */ new Date()).getTime() - new Date(turnoData.timestamp).getTime()) / (1e3 * 60);
        const tiempoRestante = EXPIRATION_MINUTES - tiempoTranscurrido;
        if (tiempoRestante > 0) {
          programarCierreAutomatico(tiempoRestante);
        }
        return true;
      }
    } catch (error) {
      console.error("Error al recuperar turno guardado:", error);
      localStorage.removeItem(TURNO_STORAGE_KEY);
    }
    return false;
  }
  function guardarTurno(turnoId) {
    try {
      const turnoData = {
        turnoId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      localStorage.setItem(TURNO_STORAGE_KEY, JSON.stringify(turnoData));
      programarCierreAutomatico();
    } catch (error) {
      console.error("Error al guardar turno:", error);
    }
  }
  function programarCierreAutomatico(minutosCustom) {
    const minutos = minutosCustom || EXPIRATION_MINUTES;
    const milisegundos = minutos * 60 * 1e3;
    setTimeout(() => {
      console.log("\u23F0 Tiempo de turno expirado. Cerrando ventana...");
      localStorage.removeItem(TURNO_STORAGE_KEY);
      const cerrado = window.close();
      if (!cerrado) {
        document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #0f172a, #1d4ed8 45%, #7c3aed);
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-family: system-ui, sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow: hidden;
                ">
                    <div style="
                        background: rgba(255, 255, 255, 0.95);
                        padding: 40px;
                        border-radius: 24px;
                        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.3);
                        color: #0f172a;
                        max-width: 500px;
                    ">
                        <div style="font-size: 60px; margin-bottom: 20px;">\u2705</div>
                        <h1 style="margin-bottom: 16px; font-size: 24px;">Sesi\xF3n Finalizada</h1>
                        <p style="margin-bottom: 20px; color: #475569; line-height: 1.6;">
                            Tu turno ha sido procesado. Gracias por usar nuestro sistema.
                        </p>
                        <p style="font-size: 14px; color: #64748b;">
                            Puedes cerrar esta ventana de forma segura.
                        </p>
                    </div>
                </div>
            `;
      }
    }, milisegundos);
    console.log(`\u23F0 Cierre autom\xE1tico programado en ${minutos.toFixed(1)} minutos`);
  }
  async function verificarAcceso() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access");
    if (!accessToken) {
      console.warn("\u{1F6AB} Acceso denegado: No hay token de acceso");
      mostrarAccesoDenegado();
      return false;
    }
    try {
      const response = await fetch(`/api/token/verificar-acceso/${encodeURIComponent(accessToken)}`);
      const data = await response.json();
      if (!data.success) {
        console.warn("\u{1F6AB} Acceso denegado: Token inv\xE1lido o expirado");
        mostrarAccesoDenegado();
        return false;
      }
      console.log("\u2705 Token de acceso v\xE1lido");
      return true;
    } catch (error) {
      console.error("\u274C Error verificando acceso:", error);
      mostrarAccesoDenegado();
      return false;
    }
  }
  function mostrarAccesoDenegado() {
    document.body.innerHTML = `
        <style>
            @keyframes float {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(25px, 25px) scale(1.05); }
            }
            
            @media (max-width: 768px) {
                .access-denied-container {
                    padding: 24px 16px !important;
                }
                .access-denied-card {
                    padding: 32px 24px !important;
                    max-width: 100% !important;
                    width: calc(100vw - 32px) !important;
                }
                .access-denied-logo {
                    max-width: 180px !important;
                    margin-bottom: 24px !important;
                }
                .access-denied-icon {
                    font-size: 56px !important;
                }
                .access-denied-title {
                    font-size: 24px !important;
                }
                .access-denied-text {
                    font-size: 15px !important;
                }
            }
        </style>
        <div class="access-denied-container" style="
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            height: 100vh;
            background: radial-gradient(circle at top, rgba(59, 130, 246, 0.28), transparent 55%),
                        linear-gradient(135deg, #0f172a, #1d4ed8 45%, #7c3aed);
            background-attachment: fixed;
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
            <div style="
                content: '';
                position: absolute;
                width: 440px;
                height: 440px;
                top: -140px;
                right: -180px;
                border-radius: 999px;
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(124, 58, 237, 0.35));
                opacity: 0.55;
                animation: float 14s ease-in-out infinite;
                z-index: 0;
            "></div>
            <div style="
                content: '';
                position: absolute;
                width: 320px;
                height: 320px;
                bottom: -120px;
                left: -140px;
                border-radius: 999px;
                background: linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(124, 58, 237, 0.35));
                opacity: 0.55;
                animation: float 14s ease-in-out infinite;
                animation-delay: -6s;
                z-index: 0;
            "></div>
            
            <img 
                class="access-denied-logo"
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
            
            <div class="access-denied-card" style="
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
                <div class="access-denied-icon" style="font-size: 64px; margin-bottom: 24px;">\u{1F6AB}</div>
                <h1 class="access-denied-title" style="margin-bottom: 16px; font-size: 28px; font-weight: 700; color: #0f172a;">Acceso Denegado</h1>
                <p class="access-denied-text" style="margin-bottom: 0; color: #475569; line-height: 1.6; font-size: 16px;">
                    El token es inv\xE1lido, ha expirado o ha sido manipulado. Por favor, solicita un nuevo turno.
                </p>
            </div>
        </div>
    `;
  }
  function validarCedulaEcuatoriana(cedula) {
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
      return false;
    }
    const tercerDigito = parseInt(cedula.charAt(2), 10);
    if (tercerDigito >= 6) {
      return false;
    }
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const digitoVerificador = parseInt(cedula.charAt(9), 10);
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) {
        valor -= 9;
      }
      suma += valor;
    }
    const resultado = suma % 10;
    const digitoEsperado = resultado === 0 ? 0 : 10 - resultado;
    return digitoVerificador === digitoEsperado;
  }
  function validarIdentificacion(identificacion) {
    const limpio = identificacion.trim().toUpperCase();
    if (/[A-Z]/.test(limpio)) {
      if (limpio.length >= 5) {
        return { valido: true, tipo: "pasaporte" };
      }
      return { valido: false, mensaje: "El pasaporte debe tener al menos 5 caracteres." };
    }
    if (/^\d+$/.test(limpio)) {
      if (limpio.length === 13) {
        const cedula = limpio.substring(0, 10);
        const establecimiento = limpio.substring(10, 13);
        if (establecimiento !== "001") {
          return { valido: false, mensaje: "El RUC debe terminar en 001." };
        }
        if (!validarCedulaEcuatoriana(cedula)) {
          return { valido: false, mensaje: "El RUC contiene una c\xE9dula inv\xE1lida." };
        }
        return { valido: true, tipo: "ruc" };
      }
      if (limpio.length === 10) {
        if (!validarCedulaEcuatoriana(limpio)) {
          return { valido: false, mensaje: "La c\xE9dula ecuatoriana no es v\xE1lida." };
        }
        return { valido: true, tipo: "cedula" };
      }
      return { valido: false, mensaje: "La c\xE9dula debe tener 10 d\xEDgitos o el RUC 13 d\xEDgitos." };
    }
    return { valido: false, mensaje: "Formato de identificaci\xF3n no v\xE1lido." };
  }
  async function validarWhatsApp(celular) {
    try {
      if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
        console.warn("\u26A0\uFE0F WhatsApp API no configurada, omitiendo validaci\xF3n");
        return { valido: true, advertencia: true };
      }
      const numeroLimpio = celular.replace(/[\s\-\(\)]/g, "");
      const numeroConPais = "593" + numeroLimpio;
      console.log("\u{1F50D} Validando WhatsApp para:", numeroConPais);
      const response = await fetch(WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": WHATSAPP_API_TOKEN
        },
        body: JSON.stringify({
          numbers: [numeroConPais]
        })
      });
      if (!response.ok) {
        console.warn("\u26A0\uFE0F No se pudo validar WhatsApp, continuando sin validaci\xF3n");
        return { valido: true, advertencia: true };
      }
      const resultado = await response.json();
      console.log("\u{1F4F1} Respuesta de validaci\xF3n WhatsApp:", resultado);
      if (resultado && Array.isArray(resultado) && resultado.length > 0) {
        const numeroValidado = resultado[0];
        if (numeroValidado.exists === true) {
          console.log("\u2705 N\xFAmero con WhatsApp confirmado");
          return { valido: true, numeroWhatsApp: numeroConPais };
        } else {
          console.log("\u274C N\xFAmero sin WhatsApp detectado");
          return {
            valido: false,
            mensaje: "El n\xFAmero de celular no tiene WhatsApp activo. Por favor ingresa un n\xFAmero v\xE1lido con WhatsApp."
          };
        }
      }
      console.warn("\u26A0\uFE0F Respuesta inesperada de la API, continuando sin validaci\xF3n estricta");
      return { valido: true, advertencia: true };
    } catch (error) {
      console.error("\u274C Error al validar WhatsApp:", error);
      return { valido: true, advertencia: true };
    }
  }
  async function cargarConfigPublica() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5e3);
      const respuesta = await fetch(PUBLIC_CONFIG_ENDPOINT, {
        cache: "no-store",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!respuesta.ok) {
        throw new Error("Respuesta inv\xE1lida de configuraci\xF3n");
      }
      const data = await respuesta.json();
      if (logoImg) {
        const logoUrl = typeof data.logoUrl === "string" && data.logoUrl.trim().length > 0 ? data.logoUrl.trim() : DEFAULT_LOGO_URL;
        logoImg.src = logoUrl;
        logoImg.onerror = function() {
          console.warn("Error cargando logo desde URL configurada, usando fallback");
          logoImg.src = DEFAULT_LOGO_URL;
        };
      }
      if (data.resetParam) {
        RESET_PARAM = data.resetParam;
        console.log("\u{1F527} Par\xE1metro de reset configurado:", RESET_PARAM);
      }
      if (data.expirationMinutes) {
        EXPIRATION_MINUTES = data.expirationMinutes;
        console.log("\u23F1\uFE0F Tiempo de expiraci\xF3n configurado:", EXPIRATION_MINUTES, "minutos");
      }
      if (data.whatsappApiUrl) {
        WHATSAPP_API_URL = data.whatsappApiUrl;
        console.log("\u{1F4F1} WhatsApp API URL configurada:", WHATSAPP_API_URL);
      } else {
        console.warn("\u26A0\uFE0F WhatsApp API URL no encontrada en configuraci\xF3n");
      }
      if (data.whatsappApiToken) {
        WHATSAPP_API_TOKEN = data.whatsappApiToken;
        console.log("\u{1F511} WhatsApp API Token configurado:", WHATSAPP_API_TOKEN.substring(0, 10) + "...");
      } else {
        console.warn("\u26A0\uFE0F WhatsApp API Token no encontrado en configuraci\xF3n");
      }
    } catch (error) {
      console.error("Error cargando configuraci\xF3n p\xFAblica:", error);
      if (logoImg) {
        logoImg.src = DEFAULT_LOGO_URL;
      }
    }
  }
  function setProcessing(isProcessing) {
    if (formShell) {
      formShell.classList.toggle("is-loading", isProcessing);
    }
    if (loading) {
      loading.classList.toggle("visible", isProcessing);
    }
    if (submitBtn) {
      submitBtn.disabled = isProcessing;
    }
    if (isProcessing) {
      form.setAttribute("aria-busy", "true");
    } else {
      form.removeAttribute("aria-busy");
    }
  }
  function mostrarResultado(turnoId, datos) {
    if (headerElement) {
      headerElement.classList.add("hidden");
    }
    if (formShell) {
      formShell.classList.remove("visible");
      formShell.classList.add("hidden");
    }
    if (successMessage) {
      successMessage.classList.remove("hidden");
      successMessage.classList.add("visible");
    }
    if (turnoId && turnoIdElemento) {
      turnoIdElemento.textContent = turnoId;
      guardarTurno(turnoId);
    } else {
      turnoIdElemento.textContent = "N/A";
    }
    if (alertContainer) {
      alertContainer.innerHTML = "";
    }
    form.reset();
    if (cedulaInput) cedulaInput.classList.remove("error", "success");
    if (celularInput) celularInput.classList.remove("error", "success");
  }
  function mostrarAlerta(mensaje, tipo) {
    if (!alertContainer) {
      return;
    }
    const alerta = document.createElement("div");
    alerta.className = "alert alert-" + tipo;
    alerta.setAttribute("role", tipo === "error" ? "alert" : "status");
    alerta.textContent = mensaje;
    alertContainer.innerHTML = "";
    alertContainer.appendChild(alerta);
  }
  async function cargarInfoAgencia() {
    const agenciaIdParam = obtenerParametroURL("id_agencia");
    if (!agenciaIdParam) {
      return;
    }
    const agenciaId = parseInt(agenciaIdParam);
    if (isNaN(agenciaId) || agenciaId <= 0) {
      console.warn("\u26A0\uFE0F ID de agencia inv\xE1lido en URL:", agenciaIdParam);
      return;
    }
    try {
      const response = await fetch(`/api/turnos/agencia/${agenciaId}`);
      if (!response.ok) {
        console.warn("\u26A0\uFE0F No se pudo cargar informaci\xF3n de la agencia");
        return;
      }
      const data = await response.json();
      if (data.success && data.data) {
        const agencia = data.data;
        const agenciaInfoElement = document.getElementById("agenciaInfo");
        const agenciaNombreElement = document.getElementById("agenciaNombre");
        if (agenciaInfoElement && agenciaNombreElement) {
          agenciaNombreElement.textContent = agencia.nombre;
          agenciaInfoElement.style.display = "inline-flex";
          console.log(`\u{1F4CD} Agencia cargada: ${agencia.nombre} (ID: ${agenciaId})`);
        }
      }
    } catch (error) {
      console.error("Error cargando informaci\xF3n de agencia:", error);
    }
  }
  (async function inicializar() {
    const accesoValido = await verificarAcceso();
    if (!accesoValido) {
      return;
    }
    await cargarConfigPublica();
    await cargarInfoAgencia();
    const hayTurnoGuardado = verificarTurnoGuardado();
    if (!hayTurnoGuardado && celularInput) {
      celularInput.focus();
    }
  })();
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1e3);
      mostrarAlerta(`Por favor espera ${remaining} segundo(s) antes de enviar otra solicitud.`, "error");
      return;
    }
    const formData = new FormData(form);
    const datos = {
      cedula: (formData.get("cedula") || "").toString().trim(),
      celular: (formData.get("celular") || "").toString().trim()
    };
    const aceptoTerminosCheckbox = document.getElementById("aceptoTerminos");
    const aceptoTerminos = aceptoTerminosCheckbox instanceof HTMLInputElement ? aceptoTerminosCheckbox.checked : false;
    const activarAudioCheckbox = document.getElementById("activarAudio");
    const activarAudio = activarAudioCheckbox instanceof HTMLInputElement ? activarAudioCheckbox.checked : false;
    const activarPushCheckbox = document.getElementById("activarPush");
    const activarPush = activarPushCheckbox instanceof HTMLInputElement ? activarPushCheckbox.checked : false;
    if (cedulaInput) cedulaInput.classList.remove("error", "success");
    if (celularInput) celularInput.classList.remove("error", "success");
    if (!datos.cedula || !datos.celular) {
      mostrarAlerta("Todos los campos son obligatorios.", "error");
      if (!datos.cedula && cedulaInput) cedulaInput.classList.add("error");
      if (!datos.celular && celularInput) celularInput.classList.add("error");
      return;
    }
    if (!aceptoTerminos) {
      mostrarAlerta("Debes autorizar el tratamiento de datos para continuar.", "error");
      return;
    }
    const validacionId = validarIdentificacion(datos.cedula);
    if (!validacionId.valido) {
      mostrarAlerta(validacionId.mensaje, "error");
      if (cedulaInput) cedulaInput.classList.add("error");
      return;
    }
    console.log(`\u2705 Identificaci\xF3n v\xE1lida - Tipo: ${validacionId.tipo}`);
    const celularLimpio = datos.celular.replace(/[\s\-\(\)]/g, "");
    if (!/^\d{10}$/.test(celularLimpio) && !/^3\d{9}$/.test(celularLimpio)) {
      mostrarAlerta("Ingresa un n\xFAmero de celular v\xE1lido con 10 d\xEDgitos.", "error");
      if (celularInput) celularInput.classList.add("error");
      return;
    }
    setProcessing(true);
    mostrarAlerta("Validando n\xFAmero de WhatsApp...", "info");
    const validacionWhatsApp = await validarWhatsApp(datos.celular);
    if (!validacionWhatsApp.valido) {
      mostrarAlerta(validacionWhatsApp.mensaje || "El n\xFAmero no tiene WhatsApp activo.", "error");
      if (celularInput) celularInput.classList.add("error");
      setProcessing(false);
      return;
    }
    if (validacionWhatsApp.advertencia) {
      console.warn("\u26A0\uFE0F Continuando sin validaci\xF3n estricta de WhatsApp");
    }
    if (cedulaInput) cedulaInput.classList.add("success");
    if (celularInput) celularInput.classList.add("success");
    lastSubmitTime = now;
    try {
      const agenciaIdParam = obtenerParametroURL("id_agencia");
      const agenciaId = agenciaIdParam ? parseInt(agenciaIdParam) : 1;
      console.log(`\u{1F4CD} Agencia seleccionada desde URL: ${agenciaId}`);
      mostrarAlerta("Creando turno...", "info");
      const turnoResponse = await fetch("/api/turnos/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            identificacion: datos.cedula,
            tipo_identificacion: datos.cedula.length === 13 ? "ruc" : datos.cedula.length === 10 ? "cedula" : "pasaporte",
            celular: datos.celular
          },
          agencia_id: agenciaId
        })
      });
      if (!turnoResponse.ok) {
        const errorData = await turnoResponse.json();
        throw new Error(errorData.message || "Error creando turno");
      }
      const turnoData = await turnoResponse.json();
      if (turnoData.success && turnoData.data) {
        const tokenResponse = await fetch("/api/token/generar-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            turnoId: turnoData.data.numero_turno,
            // Usar numero_turno (T001) en lugar de turno_id (1)
            cedula: datos.cedula,
            celular: datos.celular,
            activarAudio,
            activarPush
          })
        });
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          window.location.replace("/confirmacion?token=" + tokenData.token);
        } else {
          console.error("Error generando token de seguridad");
          mostrarAlerta("Turno creado, pero error generando token.", "warning");
          setProcessing(false);
        }
      } else {
        throw new Error("Respuesta inv\xE1lida del servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarAlerta("No pudimos procesar la solicitud. Intenta de nuevo en unos segundos.", "error");
      setProcessing(false);
    }
  });
  if (cedulaInput) {
    cedulaInput.addEventListener("input", function(event) {
      event.target.value = event.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      const valor = event.target.value;
      cedulaInput.classList.remove("error", "success");
      if (valor.length >= 5) {
        cedulaInput.classList.add("success");
      }
    });
    cedulaInput.addEventListener("blur", function(event) {
      const valor = event.target.value.trim();
      cedulaInput.classList.remove("error", "success");
      if (valor.length > 0) {
        const validacion = validarIdentificacion(valor);
        if (validacion.valido) {
          cedulaInput.classList.add("success");
        } else {
          cedulaInput.classList.add("error");
        }
      }
    });
  }
  if (celularInput) {
    celularInput.addEventListener("input", function(event) {
      event.target.value = event.target.value.replace(/[^\d\s\-]/g, "");
      const valor = event.target.value;
      const limpio = valor.replace(/[\s\-\(\)]/g, "");
      celularInput.classList.remove("error", "success");
      if (limpio.length === 10 && /^\d{10}$/.test(limpio)) {
        celularInput.classList.add("success");
      } else if (limpio.length > 10) {
        celularInput.classList.add("error");
      }
    });
    celularInput.addEventListener("blur", function(event) {
      const valor = event.target.value.trim();
      const limpio = valor.replace(/[\s\-\(\)]/g, "");
      celularInput.classList.remove("error", "success");
      if (limpio.length > 0) {
        if (limpio.length === 10 && /^\d{10}$/.test(limpio)) {
          celularInput.classList.add("success");
        } else {
          celularInput.classList.add("error");
        }
      }
    });
  }
})();
//# sourceMappingURL=solicitar-turno.js.map
