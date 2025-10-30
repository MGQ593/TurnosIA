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
  direccion?: string;
  telefono?: string;
  email?: string;
  activa?: boolean;
}

// Declaración para la librería qrcode (cargada vía CDN)
declare const qrcode: any;

// ==========================================
// Variables Globales
// ==========================================
let currentAccessToken: string | null = null;
let currentQrUrl: string | null = null;
let expirationMinutes = 15;
let countdownInterval: number | null = null;
let qrGeneratedCount = 0;
let sessionStartTime = Date.now();
let sessionTimeInterval: number | null = null;
let agencias: Agencia[] = [];
let agenciaEditando: Agencia | null = null;

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
    currentQrUrl = qrUrl; // Guardar URL para mostrar

    console.log('📱 Generando QR para agencia', agenciaId, '- URL:', qrUrl);

    // Generar QR usando qrcode-generator
    const qr = qrcode(0, 'M');
    qr.addData(qrUrl);
    qr.make();

    // Dibujar QR en canvas
    if (!qrCanvas) {
      throw new Error('Canvas no encontrado');
    }

    const cellSize = 3; // Reducido a 3 para QR más compacto
    const margin = 3;
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

    // Mostrar URL debajo del QR
    mostrarUrlGenerada(qrUrl);

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
 * Muestra la URL generada debajo del QR
 */
function mostrarUrlGenerada(url: string): void {
  // Buscar o crear el elemento para mostrar la URL
  let urlDisplay = document.getElementById('qrUrlDisplay');

  if (!urlDisplay) {
    // Crear el elemento si no existe
    const qrInfo = document.querySelector('.qr-info');
    if (!qrInfo) return;

    urlDisplay = document.createElement('div');
    urlDisplay.id = 'qrUrlDisplay';
    urlDisplay.style.cssText = `
      margin-top: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 8px;
      word-break: break-all;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #0369a1;
      max-width: 100%;
      overflow-x: auto;
    `;

    // Insertar después del qr-info
    qrInfo.parentNode?.insertBefore(urlDisplay, qrInfo.nextSibling);
  }

  // Actualizar contenido con la URL y un botón para copiar
  urlDisplay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <strong style="color: #0369a1; font-size: 12px;">🔗 URL del QR:</strong>
      <button id="btnCopyUrl" style="
        padding: 4px 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        📋 Copiar URL
      </button>
    </div>
    <div style="
      background: white;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #e0f2fe;
      font-size: 11px;
      line-height: 1.4;
    ">${url}</div>
  `;

  // Agregar evento al botón de copiar
  const btnCopy = document.getElementById('btnCopyUrl');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => copiarUrl(url));
  }
}

/**
 * Copia la URL al portapapeles
 */
function copiarUrl(url: string): void {
  navigator.clipboard.writeText(url).then(() => {
    const btnCopy = document.getElementById('btnCopyUrl');
    if (btnCopy) {
      const originalText = btnCopy.innerHTML;
      btnCopy.innerHTML = '✅ Copiado!';
      btnCopy.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';

      setTimeout(() => {
        btnCopy.innerHTML = originalText;
        btnCopy.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      }, 2000);
    }
  }).catch(err => {
    console.error('Error al copiar URL:', err);
    mostrarError('No se pudo copiar la URL al portapapeles');
  });
}

// ==========================================
// Funciones de Gestión de Agencias
// ==========================================

/**
 * Abre el modal para crear una nueva agencia
 */
function abrirModalNuevaAgencia(): void {
  agenciaEditando = null;
  const modal = document.getElementById('modalAgencia');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('formAgencia') as HTMLFormElement;

  if (modalTitle) modalTitle.textContent = 'Nueva Agencia';
  if (form) form.reset();

  // Limpiar errores
  mostrarErrorModal('');

  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Abre el modal para editar una agencia existente
 */
function abrirModalEditarAgencia(): void {
  const selectAgencia = document.getElementById('selectAgencia') as HTMLSelectElement;
  if (!selectAgencia || !selectAgencia.value) {
    mostrarError('Por favor selecciona una agencia primero');
    return;
  }

  const agenciaId = parseInt(selectAgencia.value);
  const agencia = agencias.find(ag => ag.id === agenciaId);

  if (!agencia) {
    mostrarError('Agencia no encontrada');
    return;
  }

  agenciaEditando = agencia;

  const modal = document.getElementById('modalAgencia');
  const modalTitle = document.getElementById('modalTitle');

  if (modalTitle) modalTitle.textContent = 'Editar Agencia';

  // Llenar el formulario con los datos de la agencia
  const inputNombre = document.getElementById('inputNombre') as HTMLInputElement;
  const inputDireccion = document.getElementById('inputDireccion') as HTMLInputElement;

  if (inputNombre) inputNombre.value = agencia.nombre;
  if (inputDireccion) inputDireccion.value = agencia.direccion || '';

  // Limpiar errores
  mostrarErrorModal('');

  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Cierra el modal de agencia
 */
function cerrarModalAgencia(): void {
  const modal = document.getElementById('modalAgencia');
  if (modal) {
    modal.style.display = 'none';
  }
  agenciaEditando = null;
}

/**
 * Guarda una agencia (crear o actualizar)
 */
async function guardarAgencia(event: Event): Promise<void> {
  event.preventDefault();

  const inputNombre = document.getElementById('inputNombre') as HTMLInputElement;
  const inputDireccion = document.getElementById('inputDireccion') as HTMLInputElement;

  const datos = {
    nombre: inputNombre?.value.trim(),
    direccion: inputDireccion?.value.trim() || ''
  };

  if (!datos.nombre) {
    mostrarErrorModal('El nombre es requerido');
    return;
  }

  try {
    let url = '/api/turnos/agencias';
    let method = 'POST';

    if (agenciaEditando) {
      url = `/api/turnos/agencias/${agenciaEditando.id}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    const result: ApiResponse = await response.json();

    if (!result.success) {
      mostrarErrorModal(result.message || 'Error al guardar la agencia');
      return;
    }

    console.log('✅ Agencia guardada exitosamente');

    // Cerrar modal
    cerrarModalAgencia();

    // Recargar lista de agencias
    await cargarAgencias();

    // Mostrar mensaje de éxito
    mostrarError('');
    const successMsg = agenciaEditando ? 'Agencia actualizada exitosamente' : 'Agencia creada exitosamente';

    // Mensaje temporal de éxito
    const originalError = errorMessage?.textContent || '';
    if (errorMessage) {
      errorMessage.textContent = `✅ ${successMsg}`;
      errorMessage.style.display = 'block';
      errorMessage.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      errorMessage.style.borderColor = '#22c55e';
      errorMessage.style.color = '#166534';

      setTimeout(() => {
        errorMessage.style.display = 'none';
        errorMessage.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
        errorMessage.style.borderColor = '#f87171';
        errorMessage.style.color = '#991b1b';
        errorMessage.textContent = originalError;
      }, 3000);
    }

  } catch (error) {
    console.error('Error guardando agencia:', error);
    mostrarErrorModal('Error al guardar la agencia. Por favor intenta nuevamente.');
  }
}

/**
 * Muestra un mensaje de error en el modal
 */
function mostrarErrorModal(mensaje: string): void {
  const modalError = document.getElementById('modalError');
  if (!modalError) return;

  if (mensaje) {
    modalError.textContent = mensaje;
    modalError.style.display = 'block';
  } else {
    modalError.style.display = 'none';
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
(window as any).abrirModalNuevaAgencia = abrirModalNuevaAgencia;
(window as any).abrirModalEditarAgencia = abrirModalEditarAgencia;
(window as any).cerrarModalAgencia = cerrarModalAgencia;
(window as any).guardarAgencia = guardarAgencia;

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
    const btnNuevaAgencia = document.getElementById('btnNuevaAgencia');
    const btnEditarAgencia = document.getElementById('btnEditarAgencia');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const formAgencia = document.getElementById('formAgencia');

    if (btnGenerarQR) {
      btnGenerarQR.addEventListener('click', () => generarNuevoQR());
    }
    if (btnDescargarQR) {
      btnDescargarQR.addEventListener('click', descargarQR);
    }
    if (btnLogout) {
      btnLogout.addEventListener('click', logout);
    }
    if (btnNuevaAgencia) {
      btnNuevaAgencia.addEventListener('click', abrirModalNuevaAgencia);
    }
    if (btnEditarAgencia) {
      btnEditarAgencia.addEventListener('click', abrirModalEditarAgencia);
    }
    if (btnCancelarModal) {
      btnCancelarModal.addEventListener('click', cerrarModalAgencia);
    }
    if (formAgencia) {
      formAgencia.addEventListener('submit', guardarAgencia);
    }

    // Cerrar modal al hacer clic fuera de él
    const modal = document.getElementById('modalAgencia');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          cerrarModalAgencia();
        }
      });
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
