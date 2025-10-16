import { Router } from 'express';
import turnosRouter from './api/turnos';
import whatsappRouter from './api/whatsapp';
import tokenRouter from './api/token';

const router = Router();

// Middleware para logging específico de API
router.use((req, res, next) => {
  console.log(`📡 API ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Configuración pública para el frontend
router.get('/config/public', (req, res) => {
  // Debug: Imprimir variables de WhatsApp
  console.log('🔍 DEBUG WhatsApp API URL:', process.env.WHATSAPP_API_URL);
  console.log('🔍 DEBUG WhatsApp API Token:', process.env.WHATSAPP_API_TOKEN);
  
  res.json({
    logoUrl: process.env.PUBLIC_LOGO_URL || 'https://www.chevyplan.com.ec/wp-content/uploads/2025/10/wb_chevyplan_logo-financiamiento-w_v5.webp',
    resetParam: process.env.TURNO_RESET_PARAM || 'nuevo',
    expirationMinutes: parseInt(process.env.TURNO_EXPIRATION_MINUTES || '30', 10),
    accessTokenExpirationMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_MINUTES || '15', 10),
    asignacionDisplayTimeSeconds: parseInt(process.env.ASIGNACION_DISPLAY_TIME_SECONDS || '3', 10),
    whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN || ''
  });
});

// Rutas de API
router.use('/turnos', turnosRouter);
router.use('/whatsapp', whatsappRouter);
router.use('/token', tokenRouter);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta por defecto para rutas API no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta API no encontrada: ${req.method} ${req.originalUrl}`
  });
});

export default router;