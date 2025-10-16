import type { ApiResponse } from './types';

// ==========================================
// Interfaces
// ==========================================
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  username: string;
  message?: string;
}

// ==========================================
// Elementos del DOM
// ==========================================
const form = document.getElementById('loginForm') as HTMLFormElement;
const alert = document.getElementById('alert') as HTMLDivElement;
const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
const btnText = document.getElementById('btnText') as HTMLSpanElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

// ==========================================
// Funciones de UI
// ==========================================

/**
 * Muestra un mensaje de alerta al usuario
 */
function mostrarAlerta(mensaje: string, tipo: 'error' | 'success'): void {
  alert.textContent = mensaje;
  alert.className = `alert alert-${tipo} show`;
  
  if (tipo === 'error') {
    setTimeout(() => {
      alert.classList.remove('show');
    }, 5000);
  }
}

/**
 * Establece el estado de carga del botón
 */
function setLoading(loading: boolean): void {
  loginBtn.disabled = loading;
  
  if (loading) {
    btnText.innerHTML = 'Verificando...<span class="spinner"></span>';
  } else {
    btnText.textContent = 'Iniciar Sesión';
  }
}

/**
 * Marca los campos de entrada como error
 */
function marcarCamposError(): void {
  usernameInput.classList.add('error');
  passwordInput.classList.add('error');
  passwordInput.value = '';
  passwordInput.focus();
}

/**
 * Limpia los estados de error de los campos
 */
function limpiarErrores(): void {
  usernameInput.classList.remove('error');
  passwordInput.classList.remove('error');
}

// ==========================================
// Funciones de Autenticación
// ==========================================

/**
 * Envía las credenciales al servidor para autenticación
 */
async function login(credentials: LoginCredentials): Promise<LoginResponse | null> {
  try {
    const response = await fetch('/api/token/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data: ApiResponse<LoginResponse> = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else if (data.success) {
      // API vieja sin data wrapper
      return data as unknown as LoginResponse;
    }
    
    return null;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
}

/**
 * Guarda la sesión del administrador en sessionStorage
 */
function guardarSesion(token: string, username: string): void {
  sessionStorage.setItem('admin_session_token', token);
  sessionStorage.setItem('admin_username', username);
  console.log('✅ Sesión guardada:', username);
}

/**
 * Redirige al panel de administración
 */
function redirigirAPanel(): void {
  mostrarAlerta('✅ Acceso concedido. Redirigiendo...', 'success');
  
  setTimeout(() => {
    window.location.href = '/admin-qr-generator.html';
  }, 1000);
}

// ==========================================
// Manejadores de Eventos
// ==========================================

/**
 * Maneja el envío del formulario de login
 */
async function manejarSubmit(e: Event): Promise<void> {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  // Validación básica
  if (!username || !password) {
    mostrarAlerta('Por favor completa todos los campos', 'error');
    return;
  }

  setLoading(true);
  limpiarErrores();

  try {
    const resultado = await login({ username, password });

    if (resultado && resultado.success) {
      guardarSesion(resultado.token, resultado.username);
      redirigirAPanel();
    } else {
      const mensaje = resultado?.message || 'Usuario o contraseña incorrectos';
      mostrarAlerta(mensaje, 'error');
      marcarCamposError();
    }
  } catch (error) {
    console.error('Error en login:', error);
    mostrarAlerta('Error de conexión. Intenta nuevamente.', 'error');
  } finally {
    setLoading(false);
  }
}

// ==========================================
// Inicialización
// ==========================================

// Escuchar el evento submit del formulario
form.addEventListener('submit', manejarSubmit);

// Auto-focus en el campo de usuario
usernameInput.focus();

// Prevenir doble submit
form.addEventListener('keypress', (e: KeyboardEvent) => {
  if (e.key === 'Enter' && loginBtn.disabled) {
    e.preventDefault();
  }
});

console.log('🔐 Sistema de login admin inicializado');
