/**
 * Sistema de Turnos - Frontend TypeScript
 * Formulario de solicitud de turnos con validación de cédula ecuatoriana y WhatsApp
 */

import type {
  PublicConfig,
  ValidationResult,
  WhatsAppValidationResult,
  FormularioTurnoData,
  TurnoGuardado,
  N8NResponse,
  TokenResponse,
  WhatsAppNumberValidation
} from './types';

// ============= CONSTANTES =============
const DEFAULT_LOGO_URL: string = 'https://www.chevyplan.com.ec/wp-content/uploads/2025/10/wb_chevyplan_logo-financiamiento-w_v5.webp';
const PUBLIC_CONFIG_ENDPOINT: string = '/api/config/public';
const TURNO_STORAGE_KEY: string = 'turno_actual';
const RATE_LIMIT_MS: number = 3000; // 3 segundos entre envíos

// ============= VARIABLES DOM =============
const form = document.getElementById('turnoForm') as HTMLFormElement;
const loading = document.getElementById('loading') as HTMLElement;
const formShell = document.getElementById('formShell') as HTMLElement;
const successMessage = document.getElementById('successMessage') as HTMLElement;
const alertContainer = document.getElementById('alertContainer') as HTMLElement;
const turnoIdMensaje = document.getElementById('turnoIdMensaje') as HTMLElement;
const turnoIdElemento = document.getElementById('turnoId') as HTMLElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const cedulaInput = document.getElementById('cedula') as HTMLInputElement;
const celularInput = document.getElementById('celular') as HTMLInputElement;
const logoImg = document.getElementById('brandLogo') as HTMLImageElement;
const headerElement = document.querySelector('.header') as HTMLElement | null;

// ============= VARIABLES DE CONTROL =============
let lastSubmitTime: number = 0;

// ============= CONFIGURACIÓN (cargada desde servidor) =============
let RESET_PARAM: string = 'nuevo';
let EXPIRATION_MINUTES: number = 30;
let WHATSAPP_API_URL: string = '';
let WHATSAPP_API_TOKEN: string = '';

// ============= FUNCIONES UTILIDAD =============

/**
 * Obtiene un parámetro de la URL
 */
function obtenerParametroURL(nombre: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

/**
 * Verifica si un turno ha expirado según el tiempo configurado
 */
function turnoHaExpirado(timestamp: string): boolean {
    const ahora: number = new Date().getTime();
    const tiempoTurno: number = new Date(timestamp).getTime();
    const diferenciaMinutos: number = (ahora - tiempoTurno) / (1000 * 60);
    return diferenciaMinutos >= EXPIRATION_MINUTES;
}

/**
 * Verifica si hay un turno guardado en localStorage al cargar la página
 */
function verificarTurnoGuardado(): boolean {
    try {
        const resetParam = obtenerParametroURL('nuevo');
        const turnoGuardado = localStorage.getItem(TURNO_STORAGE_KEY);
        
        if (turnoGuardado) {
            const turnoData = JSON.parse(turnoGuardado);
            
            // Si viene con parámetro de reset y el parámetro es correcto
            if (resetParam === 'true') {
                // Verificar si ha expirado el tiempo
                if (turnoHaExpirado(turnoData.timestamp)) {
                    // Tiempo expirado, limpiar y permitir nuevo turno
                    localStorage.removeItem(TURNO_STORAGE_KEY);
                    console.log('✅ Turno expirado y limpiado. Nuevo turno permitido.');
                    // Limpiar URL sin recargar
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return false;
                } else {
                    // No ha pasado el tiempo suficiente
                    const minutosRestantes = Math.ceil(EXPIRATION_MINUTES - ((new Date().getTime() - new Date(turnoData.timestamp).getTime()) / (1000 * 60)));
                    mostrarAlerta(`⏱️ Debe esperar ${minutosRestantes} minuto(s) más antes de solicitar un nuevo turno.`, 'error');
                    mostrarResultado(turnoData.turnoId);
                    return true;
                }
            }
            
            // Sin parámetro de reset, verificar expiración automática
            if (turnoHaExpirado(turnoData.timestamp)) {
                localStorage.removeItem(TURNO_STORAGE_KEY);
                return false;
            }
            
            // Turno válido, mostrarlo
            mostrarResultado(turnoData.turnoId);
            
            // Programar cierre automático para el tiempo restante
            const tiempoTranscurrido = (new Date().getTime() - new Date(turnoData.timestamp).getTime()) / (1000 * 60);
            const tiempoRestante = EXPIRATION_MINUTES - tiempoTranscurrido;
            if (tiempoRestante > 0) {
                programarCierreAutomatico(tiempoRestante);
            }
            
            return true;
        }
    } catch (error) {
        console.error('Error al recuperar turno guardado:', error);
        localStorage.removeItem(TURNO_STORAGE_KEY);
    }
    return false;
}

/**
 * Guarda un turno en localStorage con timestamp
 */
function guardarTurno(turnoId: string): void {
    try {
        const turnoData: TurnoGuardado = {
            turnoId: turnoId,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(TURNO_STORAGE_KEY, JSON.stringify(turnoData));
        
        // Programar cierre automático después de la expiración
        programarCierreAutomatico();
    } catch (error) {
        console.error('Error al guardar turno:', error);
    }
}

/**
 * Programa el cierre automático de la ventana cuando expire el turno
 */
function programarCierreAutomatico(minutosCustom?: number): void {
    const minutos: number = minutosCustom || EXPIRATION_MINUTES;
    const milisegundos: number = minutos * 60 * 1000;
    
    setTimeout(() => {
        console.log('⏰ Tiempo de turno expirado. Cerrando ventana...');
        
        // Limpiar localStorage
        localStorage.removeItem(TURNO_STORAGE_KEY);

        // Intentar cerrar la ventana (window.close() retorna void, no boolean)
        window.close();

        // Mostrar mensaje alternativo después de un delay (si la ventana no se cerró)
        setTimeout(() => {
            // Si este código se ejecuta, significa que la ventana no se cerró
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #02539A;
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
                        <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                        <h1 style="margin-bottom: 16px; font-size: 24px;">Sesión Finalizada</h1>
                        <p style="margin-bottom: 20px; color: #475569; line-height: 1.6;">
                            Tu turno ha sido procesado. Gracias por usar nuestro sistema.
                        </p>
                        <p style="font-size: 14px; color: #64748b;">
                            Puedes cerrar esta ventana de forma segura.
                        </p>
                    </div>
                </div>
            `;
        }, 500); // 500ms delay para dar tiempo a que window.close() funcione
    }, milisegundos);
    
    console.log(`⏰ Cierre automático programado en ${minutos.toFixed(1)} minutos`);
}

// Verificar token de acceso en la URL
async function verificarAcceso() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access');

    if (!accessToken) {
        console.warn('🚫 Acceso denegado: No hay token de acceso');
        mostrarAccesoDenegado();
        return false;
    }

    try {
        const response = await fetch(`/api/token/verificar-acceso/${encodeURIComponent(accessToken)}`);
        const data = await response.json();

        if (!data.success) {
            console.warn('🚫 Acceso denegado: Token inválido o expirado');
            mostrarAccesoDenegado();
            return false;
        }

        console.log('✅ Token de acceso válido');
        return true;
    } catch (error) {
        console.error('❌ Error verificando acceso:', error);
        mostrarAccesoDenegado();
        return false;
    }
}

// Mostrar mensaje de acceso denegado
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
            <div style="
                content: '';
                position: absolute;
                display: none;
            "></div>
            <div style="
                display: none;
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
                <div class="access-denied-icon" style="font-size: 64px; margin-bottom: 24px;">🚫</div>
                <h1 class="access-denied-title" style="margin-bottom: 16px; font-size: 28px; font-weight: 700; color: #0f172a;">Acceso Denegado</h1>
                <p class="access-denied-text" style="margin-bottom: 0; color: #475569; line-height: 1.6; font-size: 16px;">
                    El token es inválido, ha expirado o ha sido manipulado. Por favor, solicita un nuevo turno.
                </p>
            </div>
        </div>
    `;
}

// Validar cédula ecuatoriana (algoritmo del módulo 10)
function validarCedulaEcuatoriana(cedula: string): boolean {
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

// Validar número de identificación (cédula, RUC o pasaporte)
function validarIdentificacion(identificacion: string): ValidationResult {
    const limpio = identificacion.trim().toUpperCase();

    if (/[A-Z]/.test(limpio)) {
        if (limpio.length >= 5) {
            return { valido: true, tipo: 'pasaporte' };
        }
        return { valido: false, mensaje: 'El pasaporte debe tener al menos 5 caracteres.' };
    }

    if (/^\d+$/.test(limpio)) {
        if (limpio.length === 13) {
            const cedula = limpio.substring(0, 10);
            const establecimiento = limpio.substring(10, 13);
            
            if (establecimiento !== '001') {
                return { valido: false, mensaje: 'El RUC debe terminar en 001.' };
            }
            
            if (!validarCedulaEcuatoriana(cedula)) {
                return { valido: false, mensaje: 'El RUC contiene una cédula inválida.' };
            }
            
            return { valido: true, tipo: 'ruc' };
        }
        
        if (limpio.length === 10) {
            if (!validarCedulaEcuatoriana(limpio)) {
                return { valido: false, mensaje: 'La cédula ecuatoriana no es válida.' };
            }
            return { valido: true, tipo: 'cedula' };
        }
        
        return { valido: false, mensaje: 'La cédula debe tener 10 dígitos o el RUC 13 dígitos.' };
    }

    return { valido: false, mensaje: 'Formato de identificación no válido.' };
}

// Validar si el número tiene WhatsApp usando Evolution API
async function validarWhatsApp(celular: string): Promise<WhatsAppValidationResult> {
    try {
        if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
            console.warn('⚠️ WhatsApp API no configurada, omitiendo validación');
            return { valido: true, advertencia: true };
        }

        // Limpiar el número y eliminar el 0 después del código de país
        let numeroLimpio = celular.replace(/[\s\-\(\)]/g, '');
        
        // Si el número empieza con 0, quitarlo (ej: 0981314280 → 981314280)
        if (numeroLimpio.startsWith('0')) {
            numeroLimpio = numeroLimpio.substring(1);
        }
        
        const numeroConPais = '593' + numeroLimpio;

        console.log('🔍 Validando WhatsApp para:', numeroConPais);

        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': WHATSAPP_API_TOKEN
            },
            body: JSON.stringify({
                numbers: [numeroConPais]
            })
        });

        if (!response.ok) {
            console.warn('⚠️ No se pudo validar WhatsApp, continuando sin validación');
            return { valido: true, advertencia: true };
        }

        const resultado = await response.json();
        console.log('📱 Respuesta de validación WhatsApp:', resultado);

        if (resultado && Array.isArray(resultado) && resultado.length > 0) {
            const numeroValidado = resultado[0];
            
            // SOLO validar con la propiedad "exists"
            // jid existe en la respuesta incluso cuando exists=false, por eso NO lo usamos
            if (numeroValidado.exists === true) {
                console.log('✅ Número con WhatsApp confirmado');
                return { valido: true, whatsappActivo: true, numeroWhatsApp: numeroConPais };
            } else {
                console.log('⚠️ Número sin WhatsApp detectado - Continuando con advertencia visual');
                return { 
                    valido: true, // NO bloqueamos, solo advertimos
                    whatsappActivo: false,
                    advertencia: true,
                    mensaje: 'Este número no tiene WhatsApp activo'
                };
            }
        }

        console.warn('⚠️ Respuesta inesperada de la API, continuando sin validación estricta');
        return { valido: true, advertencia: true };

    } catch (error) {
        console.error('❌ Error al validar WhatsApp:', error);
        return { valido: true, advertencia: true };
    }
}

// Enviar datos (simulación)
/**
 * Envía los datos del formulario (simulación por ahora)
 */
async function enviarAN8N(datos: FormularioTurnoData, aceptoTerminos: boolean): Promise<N8NResponse> {
    const payload = {
        numero_cedula: datos.cedula,
        numero_celular: datos.celular,
        acepto_terminos: aceptoTerminos,
        timestamp: new Date().toISOString(),
        origen: 'formulario_web'
    };

    console.log('Datos que se enviarian a n8n:', payload);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const numeroAleatorio = Math.floor(Math.random() * 999) + 1;
    const turnoId = 'T' + numeroAleatorio.toString().padStart(3, '0');
    
    return {
        success: true,
        turno_id: turnoId,
        message: 'Turno creado exitosamente'
    };
}

/**
 * Carga la configuración pública desde el servidor
 */
async function cargarConfigPublica(): Promise<void> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const respuesta = await fetch(PUBLIC_CONFIG_ENDPOINT, { 
            cache: 'no-store',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!respuesta.ok) {
            throw new Error('Respuesta inválida de configuración');
        }

        const data = await respuesta.json();
        
        if (logoImg) {
            const logoUrl = typeof data.logoUrl === 'string' && data.logoUrl.trim().length > 0
                ? data.logoUrl.trim()
                : DEFAULT_LOGO_URL;

            logoImg.src = logoUrl;
            logoImg.onerror = function() {
                console.warn('Error cargando logo desde URL configurada, usando fallback');
                logoImg.src = DEFAULT_LOGO_URL;
            };
        }
        
        if (data.resetParam) {
            RESET_PARAM = data.resetParam;
            console.log('🔧 Parámetro de reset configurado:', RESET_PARAM);
        }
        
        if (data.expirationMinutes) {
            EXPIRATION_MINUTES = data.expirationMinutes;
            console.log('⏱️ Tiempo de expiración configurado:', EXPIRATION_MINUTES, 'minutos');
        }

        if (data.whatsappApiUrl) {
            WHATSAPP_API_URL = data.whatsappApiUrl;
            console.log('📱 WhatsApp API URL configurada:', WHATSAPP_API_URL);
        } else {
            console.warn('⚠️ WhatsApp API URL no encontrada en configuración');
        }
        
        if (data.whatsappApiToken) {
            WHATSAPP_API_TOKEN = data.whatsappApiToken;
            console.log('🔑 WhatsApp API Token configurado:', WHATSAPP_API_TOKEN.substring(0, 10) + '...');
        } else {
            console.warn('⚠️ WhatsApp API Token no encontrado en configuración');
        }
    } catch (error) {
        console.error('Error cargando configuración pública:', error);
        if (logoImg) {
            logoImg.src = DEFAULT_LOGO_URL;
        }
    }
}

// Establecer estado de procesamiento
function setProcessing(isProcessing: boolean): void {
    if (formShell) {
        formShell.classList.toggle('is-loading', isProcessing);
    }
    if (loading) {
        loading.classList.toggle('visible', isProcessing);
    }
    if (submitBtn) {
        submitBtn.disabled = isProcessing;
    }
    if (isProcessing) {
        form.setAttribute('aria-busy', 'true');
    } else {
        form.removeAttribute('aria-busy');
    }
}

// Mostrar resultado del turno
function mostrarResultado(turnoId: string): void {
    if (headerElement) {
        headerElement.classList.add('hidden');
    }
    
    if (formShell) {
        formShell.classList.remove('visible');
        formShell.classList.add('hidden');
    }
    if (successMessage) {
        successMessage.classList.remove('hidden');
        successMessage.classList.add('visible');
    }
    
    if (turnoId && turnoIdElemento) {
        turnoIdElemento.textContent = turnoId;
        guardarTurno(turnoId);
    } else {
        turnoIdElemento.textContent = 'N/A';
    }
    
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
    form.reset();
    
    if (cedulaInput) cedulaInput.classList.remove('error', 'success');
    if (celularInput) celularInput.classList.remove('error', 'success');
}

// Mostrar alerta
function mostrarAlerta(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    if (!alertContainer) {
        return;
    }
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-' + tipo;
    alerta.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    alerta.textContent = mensaje;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alerta);
}

/**
 * Carga y muestra información de la agencia desde la URL
 */
async function cargarInfoAgencia(): Promise<void> {
    const agenciaIdParam = obtenerParametroURL('id_agencia');
    
    if (!agenciaIdParam) {
        return; // No hay agencia en la URL
    }

    const agenciaId = parseInt(agenciaIdParam);
    
    if (isNaN(agenciaId) || agenciaId <= 0) {
        console.warn('⚠️ ID de agencia inválido en URL:', agenciaIdParam);
        return;
    }

    try {
        const response = await fetch(`/api/turnos/agencia/${agenciaId}`);
        
        if (!response.ok) {
            console.warn('⚠️ No se pudo cargar información de la agencia');
            return;
        }

        const data = await response.json();
        
        if (data.success && data.data) {
            const agencia = data.data;
            const agenciaInfoElement = document.getElementById('agenciaInfo');
            const agenciaNombreElement = document.getElementById('agenciaNombre');
            
            if (agenciaInfoElement && agenciaNombreElement) {
                agenciaNombreElement.textContent = agencia.nombre;
                agenciaInfoElement.style.display = 'inline-flex';
                console.log(`📍 Agencia cargada: ${agencia.nombre} (ID: ${agenciaId})`);
            }
        }
    } catch (error) {
        console.error('Error cargando información de agencia:', error);
    }
}

// Inicializar aplicación
(async function inicializar() {
    const accesoValido = await verificarAcceso();
    if (!accesoValido) {
        return;
    }

    await cargarConfigPublica();
    await cargarInfoAgencia(); // Cargar información de la agencia si está en la URL
    
    const hayTurnoGuardado = verificarTurnoGuardado();

    if (!hayTurnoGuardado && celularInput) {
        celularInput.focus();
    }
})();

// Event Listeners
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
        const remaining = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
        mostrarAlerta(`Por favor espera ${remaining} segundo(s) antes de enviar otra solicitud.`, 'error');
        return;
    }

    const formData = new FormData(form);
    const datos = {
        cedula: (formData.get('cedula') || '').toString().trim(),
        celular: (formData.get('celular') || '').toString().trim()
    };

    const aceptoTerminosCheckbox = document.getElementById('aceptoTerminos');
    const aceptoTerminos = aceptoTerminosCheckbox instanceof HTMLInputElement
        ? aceptoTerminosCheckbox.checked
        : false;

    // Capturar preferencias de notificaciones
    const activarAudioCheckbox = document.getElementById('activarAudio');
    const activarAudio = activarAudioCheckbox instanceof HTMLInputElement
        ? activarAudioCheckbox.checked
        : false;

    const activarPushCheckbox = document.getElementById('activarPush');
    const activarPush = activarPushCheckbox instanceof HTMLInputElement
        ? activarPushCheckbox.checked
        : false;

    if (cedulaInput) cedulaInput.classList.remove('error', 'success');
    if (celularInput) celularInput.classList.remove('error', 'success');

    if (!datos.cedula || !datos.celular) {
        mostrarAlerta('Todos los campos son obligatorios.', 'error');
        if (!datos.cedula && cedulaInput) cedulaInput.classList.add('error');
        if (!datos.celular && celularInput) celularInput.classList.add('error');
        return;
    }

    if (!aceptoTerminos) {
        mostrarAlerta('Debes autorizar el tratamiento de datos para continuar.', 'error');
        return;
    }

    const validacionId = validarIdentificacion(datos.cedula);
    if (!validacionId.valido) {
        mostrarAlerta(validacionId.mensaje || 'Identificación inválida', 'error');
        if (cedulaInput) cedulaInput.classList.add('error');
        return;
    }

    console.log(`✅ Identificación válida - Tipo: ${validacionId.tipo}`);

    const celularLimpio = datos.celular.replace(/[\s\-\(\)]/g, '');
    
    if (!/^\d{10}$/.test(celularLimpio) && !/^3\d{9}$/.test(celularLimpio)) {
        mostrarAlerta('Ingresa un número de celular válido con 10 dígitos.', 'error');
        if (celularInput) celularInput.classList.add('error');
        return;
    }
    
    setProcessing(true);
    mostrarAlerta('Validando número de WhatsApp...', 'info');
    
    const validacionWhatsApp = await validarWhatsApp(datos.celular);
    
    // Aplicar estilos visuales según el resultado de la validación
    if (celularInput) {
        celularInput.classList.remove('error', 'success');
        
        if (validacionWhatsApp.whatsappActivo === true) {
            // Número válido con WhatsApp activo - borde verde
            celularInput.classList.add('success');
            console.log('✅ WhatsApp activo - borde verde');
        } else if (validacionWhatsApp.whatsappActivo === false) {
            // Número sin WhatsApp - borde rojo pero NO bloqueamos
            celularInput.classList.add('error');
            console.warn('⚠️ WhatsApp no activo - borde rojo (continuando de todas formas)');
        }
    }

    // Mostrar advertencia si el número no tiene WhatsApp, pero continuar
    if (validacionWhatsApp.advertencia && validacionWhatsApp.mensaje) {
        mostrarAlerta(validacionWhatsApp.mensaje, 'warning');
    }

    if (cedulaInput) cedulaInput.classList.add('success');

    lastSubmitTime = now;

    try {
        // Obtener agencia_id de la URL
        const agenciaIdParam = obtenerParametroURL('id_agencia');
        const agenciaId = agenciaIdParam ? parseInt(agenciaIdParam) : 1;
        
        console.log(`📍 Agencia seleccionada desde URL: ${agenciaId}`);
        
        // Llamar al API real para crear el turno
        mostrarAlerta('Creando turno...', 'info');
        
        const turnoResponse = await fetch('/api/turnos/solicitar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente: {
                    identificacion: datos.cedula,
                    tipo_identificacion: datos.cedula.length === 13 ? 'ruc' : 
                                       datos.cedula.length === 10 ? 'cedula' : 'pasaporte',
                    celular: datos.celular
                },
                agencia_id: agenciaId,
                whatsapp_validado: validacionWhatsApp.whatsappActivo === true // true si está activo, false si no
            })
        });

        if (!turnoResponse.ok) {
            const errorData = await turnoResponse.json();
            throw new Error(errorData.message || 'Error creando turno');
        }

        const turnoData = await turnoResponse.json();
        
        if (turnoData.success && turnoData.data) {
            // Generar token para la página de confirmación
            const tokenResponse = await fetch('/api/token/generar-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    turnoId: turnoData.data.numero_turno, // Usar numero_turno (T001) en lugar de turno_id (1)
                    cedula: datos.cedula,
                    celular: datos.celular,
                    activarAudio,
                    activarPush
                })
            });

            if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                // Mantener id_agencia en la URL para la confirmación
                window.location.replace(`/confirmacion?id_agencia=${encodeURIComponent(turnoData.data.agencia_id)}&token=${encodeURIComponent(tokenData.token)}`);
            } else {
                console.error('Error generando token de seguridad');
                mostrarAlerta('Turno creado, pero error generando token.', 'warning');
                setProcessing(false);
            }
        } else {
            throw new Error('Respuesta inválida del servidor');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('No pudimos procesar la solicitud. Intenta de nuevo en unos segundos.', 'error');
        setProcessing(false);
    }
});

// Event listeners para validación en tiempo real
if (cedulaInput) {
    cedulaInput.addEventListener('input', function (event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        const valor = target.value;
        cedulaInput.classList.remove('error', 'success');
        
        if (valor.length >= 5) {
            cedulaInput.classList.add('success');
        }
    });
    
    cedulaInput.addEventListener('blur', function(event: Event) {
        const target = event.target as HTMLInputElement;
        const valor = target.value.trim();
        cedulaInput.classList.remove('error', 'success');
        
        if (valor.length > 0) {
            const validacion = validarIdentificacion(valor);
            if (validacion.valido) {
                cedulaInput.classList.add('success');
            } else {
                cedulaInput.classList.add('error');
            }
        }
    });
}

if (celularInput) {
    celularInput.addEventListener('input', function (event: Event) {
        const target = event.target as HTMLInputElement;
        target.value = target.value.replace(/[^\d\s\-]/g, '');

        const valor = target.value;
        const limpio = valor.replace(/[\s\-\(\)]/g, '');
        celularInput.classList.remove('error', 'success');
        
        if (limpio.length === 10 && /^\d{10}$/.test(limpio)) {
            celularInput.classList.add('success');
        } else if (limpio.length > 10) {
            celularInput.classList.add('error');
        }
    });
    
    celularInput.addEventListener('blur', function(event: Event) {
        const target = event.target as HTMLInputElement;
        const valor = target.value.trim();
        const limpio = valor.replace(/[\s\-\(\)]/g, '');
        celularInput.classList.remove('error', 'success');
        
        if (limpio.length > 0) {
            if (limpio.length === 10 && /^\d{10}$/.test(limpio)) {
                celularInput.classList.add('success');
            } else {
                celularInput.classList.add('error');
            }
        }
    });
}
