import type { ApiResponse } from './types';

// ==========================================
// Interfaces
// ==========================================
interface TokenAccesoResponse {
  success: boolean;
  url: string;
  token?: string;
  expiresAt?: string;
}

// Declaración para la librería QRious (cargada vía CDN)
declare const QRious: any;

// ==========================================
// Variables Globales
// ==========================================
let currentURL = '';

// ==========================================
// Elementos del DOM
// ==========================================
const qrContainer = document.getElementById('qr-container') as HTMLDivElement;
const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
const urlDisplay = document.getElementById('url-display') as HTMLDivElement;

// ==========================================
// Funciones Principales
// ==========================================

/**
 * Genera un nuevo token de acceso y crea el código QR
 */
async function generarQR(): Promise<void> {
  try {
    const response = await fetch('/api/token/generar-acceso');
    const data: ApiResponse<TokenAccesoResponse> = await response.json();

    if (!data.success || !data.data) {
      alert('Error generando token de acceso');
      return;
    }

    // Construir URL completa
    const baseURL = window.location.origin;
    currentURL = `${baseURL}${data.data.url}`;

    // Mostrar URL
    if (urlDisplay) {
      urlDisplay.textContent = currentURL;
    }

    // Generar QR usando QRious
    if (qrCanvas && typeof QRious !== 'undefined') {
      const qr = new QRious({
        element: qrCanvas,
        value: currentURL,
        size: 300,
        level: 'H',
        background: 'white',
        foreground: '#2d3748'
      });

      console.log('✅ QR generado:', currentURL);
    } else {
      console.error('❌ Canvas o QRious no disponible');
    }

    // Mostrar contenedor
    if (qrContainer) {
      qrContainer.classList.add('show');
    }

  } catch (error) {
    console.error('Error generando QR:', error);
    alert('Error generando QR. Verifica que el servidor esté corriendo.');
  }
}

/**
 * Descarga el código QR como imagen PNG
 */
function descargarQR(): void {
  if (!qrCanvas) {
    console.error('Canvas no encontrado');
    return;
  }

  try {
    const link = document.createElement('a');
    link.download = `qr-turno-${Date.now()}.png`;
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
    console.log('💾 QR descargado');
  } catch (error) {
    console.error('Error descargando QR:', error);
    alert('❌ Error al descargar el QR');
  }
}

/**
 * Copia la URL del turno al portapapeles
 */
async function copiarURL(): Promise<void> {
  if (!currentURL) {
    alert('❌ No hay URL para copiar');
    return;
  }

  try {
    await navigator.clipboard.writeText(currentURL);
    alert('✅ URL copiada al portapapeles');
    console.log('📋 URL copiada:', currentURL);
  } catch (error) {
    console.error('Error copiando URL:', error);
    alert('❌ Error copiando URL');
  }
}

// ==========================================
// Exportar funciones al scope global
// ==========================================
// Necesario porque los onclick en HTML las llaman directamente
(window as any).generarQR = generarQR;
(window as any).descargarQR = descargarQR;
(window as any).copiarURL = copiarURL;

// ==========================================
// Inicialización
// ==========================================

/**
 * Genera QR automáticamente al cargar la página
 */
window.addEventListener('load', () => {
  console.log('🔐 Generador de QR inicializado');
  generarQR();
});

// Verificar que QRious esté disponible
if (typeof QRious === 'undefined') {
  console.error('❌ QRious no está cargado. Verifica el CDN.');
}
