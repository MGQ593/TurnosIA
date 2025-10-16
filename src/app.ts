import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';

import { initializeDatabase } from './db/database';
import apiRoutes from './routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));

// Middleware CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas API
app.use('/api', apiRoutes);

// Ruta principal - redirige al formulario de solicitud
app.get('/', (req, res) => {
  res.redirect(301, '/solicitar');
});

// Ruta pública para QR impreso - genera token automáticamente
app.get('/solicitar-turno', (req, res) => {
  // Redirigir a la API que genera el token y luego al formulario
  res.redirect('/api/token/acceso-qr');
});

// Ruta del formulario de solicitud de turno (requiere token)
app.get('/solicitar', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/solicitar-turno.html'));
});

// Ruta de confirmación de turno
app.get('/confirmacion', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/confirmacion.html'));
});

// Rutas de administración
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-login.html'));
});

app.get('/admin-qr-generator', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin-qr-generator.html'));
});

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejo de rutas no encontradas - redirigir páginas HTML a la principal
app.use('*', (req, res) => {
  // Si es una solicitud de API, responder con JSON 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Ruta no encontrada'
    });
  }
  
  // Para cualquier otra ruta (especialmente .html), redirigir al formulario principal
  res.redirect(301, '/');
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Sistema de turnos disponible en http://localhost:${PORT}`);
      console.log(`🔗 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

export default app;