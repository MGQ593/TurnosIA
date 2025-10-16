import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la conexión a PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || '68.154.24.20',
  port: parseInt(process.env.DB_PORT || '2483'),
  database: process.env.DB_NAME || 'agente_ia',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  max: 20, // Máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
  connectionTimeoutMillis: 2000, // Tiempo máximo para establecer conexión
  ssl: false, // Configurar según necesidades del servidor
  // Configurar el search_path para usar el esquema turnos_ia
  options: '-c search_path=turnos_ia,public'
};

// Pool de conexiones
let pool: Pool | null = null;

/**
 * Inicializa la conexión a la base de datos
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!pool) {
      // Debug de configuración
      console.log('🔍 Configuración de DB:', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user,
        password: dbConfig.password ? '***CONFIGURADA***' : '***NO CONFIGURADA***'
      });
      
      pool = new Pool(dbConfig);
      
      // Test de conexión
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      console.log('✅ Conexión a PostgreSQL establecida correctamente');
      console.log(`📊 Base de datos: ${dbConfig.database} en ${dbConfig.host}:${dbConfig.port}`);
    }
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    throw error;
  }
}

/**
 * Ejecuta una consulta SQL
 */
export async function query(text: string, params?: any[]): Promise<any> {
  if (!pool) {
    throw new Error('Base de datos no inicializada. Llama a initializeDatabase() primero.');
  }

  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log(`🔍 Query ejecutada en ${duration}ms:`, text.substring(0, 100));
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ Error en query (${duration}ms):`, {
      query: text.substring(0, 100),
      params,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
}

/**
 * Obtiene una conexión del pool para transacciones
 */
export async function getClient() {
  if (!pool) {
    throw new Error('Base de datos no inicializada. Llama a initializeDatabase() primero.');
  }
  
  return await pool.connect();
}

/**
 * Cierra todas las conexiones del pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Conexiones de base de datos cerradas');
  }
}

/**
 * Verifica si la base de datos está conectada
 */
export function isDatabaseConnected(): boolean {
  return pool !== null;
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando conexiones de base de datos...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando conexiones de base de datos...');
  await closeDatabase();
  process.exit(0);
});