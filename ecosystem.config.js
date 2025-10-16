module.exports = {
  apps: [{
    name: 'sistema-turnos',
    script: 'dist/index.js',
    instances: 'max', // Usar todos los cores disponibles
    exec_mode: 'cluster',
    
    // Variables de entorno para desarrollo
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    
    // Variables de entorno para producción
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Configuración de logs
    log_file: 'logs/combined.log',
    out_file: 'logs/out.log',
    error_file: 'logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuración de reinicio automático
    watch: false, // No usar watch en producción
    ignore_watch: ['node_modules', 'logs', 'public'],
    
    // Configuración de memoria
    max_memory_restart: '1G',
    
    // Configuración de reinicio en caso de crash
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Configuración de tiempo de espera
    kill_timeout: 5000,
    
    // Variables adicionales
    node_args: '--max-old-space-size=1024'
  }]
};