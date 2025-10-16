import { Router, Request, Response } from 'express';
import { 
  generarTokenTurno, 
  verificarTokenTurno, 
  generarTokenAcceso, 
  verificarTokenAcceso,
  generarTokenSesionAdmin,
  verificarTokenSesionAdmin
} from '../../utils/jwtUtils';

const router = Router();

/**
 * POST /api/turnos/generar-token
 * Genera un token JWT seguro para un turno
 */
router.post('/generar-token', (req: Request, res: Response) => {
  try {
    const { turnoId, agenciaId, cedula, celular, activarAudio = false, activarPush = false } = req.body;

    if (!turnoId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del turno es requerido'
      });
    }

    if (!agenciaId) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la agencia es requerido'
      });
    }

    const token = generarTokenTurno(turnoId, agenciaId, cedula, celular, activarAudio, activarPush);

    res.json({
      success: true,
      token,
      turnoId
    });
  } catch (error) {
    console.error('Error generando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando token de seguridad'
    });
  }
});

/**
 * GET /api/turnos/verificar-token/:token
 * Verifica y decodifica un token JWT
 */
router.get('/verificar-token/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const payload = verificarTokenTurno(token);

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido, expirado o manipulado',
        expired: true
      });
    }

    res.json({
      success: true,
      turnoId: payload.turnoId,
      cedula: payload.cedula,
      celular: payload.celular,
      activarAudio: payload.activarAudio,
      activarPush: payload.activarPush,
      timestamp: payload.timestamp
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando token'
    });
  }
});

/**
 * GET /api/token/generar-acceso
 * Genera un token temporal para acceder al formulario (sin agencia)
 */
router.get('/generar-acceso', (req: Request, res: Response) => {
  try {
    const token = generarTokenAcceso();

    res.json({
      success: true,
      token,
      expiresIn: '5 minutos',
      url: `/solicitar?access=${token}`
    });
  } catch (error) {
    console.error('Error generando token de acceso:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando token de acceso'
    });
  }
});

/**
 * POST /api/token/generar-acceso
 * Genera un token temporal para acceder al formulario con agencia específica
 */
router.post('/generar-acceso', (req: Request, res: Response) => {
  try {
    const { agenciaId } = req.body;

    console.log('🔑 Generando token de acceso para agencia:', agenciaId);

    if (!agenciaId) {
      return res.status(400).json({
        success: false,
        message: 'El ID de la agencia es requerido'
      });
    }

    const token = generarTokenAcceso();

    console.log('✅ Token generado exitosamente');

    res.json({
      success: true,
      data: {
        token,
        agenciaId,
        expiresIn: '15 minutos'
      }
    });
  } catch (error) {
    console.error('❌ Error generando token de acceso:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando token de acceso',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * GET /api/token/verificar-acceso/:token
 * Verifica un token de acceso al formulario
 */
router.get('/verificar-acceso/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const valido = verificarTokenAcceso(token);

    if (!valido) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso inválido o expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token de acceso válido'
    });
  } catch (error) {
    console.error('Error verificando token de acceso:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando token de acceso'
    });
  }
});

/**
 * POST /api/token/admin/login
 * Autentica al admin y genera token de sesión
 */
router.post('/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos'
      });
    }

    // Verificar credenciales con variables de entorno
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      console.warn(`❌ Intento de login fallido para usuario: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

    // Generar token de sesión
    const sessionToken = generarTokenSesionAdmin(username);

    res.json({
      success: true,
      token: sessionToken,
      username,
      expiresIn: '8 horas'
    });
  } catch (error) {
    console.error('Error en login admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error en autenticación'
    });
  }
});

/**
 * GET /api/token/verificar-sesion
 * Verifica la sesión del admin (requiere header Authorization)
 */
router.get('/verificar-sesion', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "
    const username = verificarTokenSesionAdmin(token);

    if (!username) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada'
      });
    }

    res.json({
      success: true,
      username,
      message: 'Sesión válida'
    });
  } catch (error) {
    console.error('Error verificando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando sesión'
    });
  }
});

/**
 * POST /api/token/admin/verificar-sesion
 * Verifica la sesión del admin (recibe token en body)
 */
router.post('/admin/verificar-sesion', (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const username = verificarTokenSesionAdmin(token);

    if (!username) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o expirada'
      });
    }

    res.json({
      success: true,
      username,
      message: 'Sesión válida'
    });
  } catch (error) {
    console.error('Error verificando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando sesión'
    });
  }
});

/**
 * GET /api/token/acceso-qr
 * Genera un token de acceso automáticamente y redirige al formulario
 * Esta ruta es para QR codes permanentes (impresos)
 */
router.get('/acceso-qr', (req: Request, res: Response) => {
  try {
    // Generar token de acceso automáticamente
    const token = generarTokenAcceso();
    
    console.log('📱 Acceso desde QR permanente - Token generado automáticamente');
    
    // Redirigir al formulario con el token
    res.redirect(`/solicitar?access=${token}`);
  } catch (error) {
    console.error('Error generando token para QR:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .card {
            background: white;
            color: #1e293b;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚠️ Error</h1>
          <p>No se pudo generar el acceso. Por favor intenta nuevamente.</p>
        </div>
      </body>
      </html>
    `);
  }
});

export default router;
