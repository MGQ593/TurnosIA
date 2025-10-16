/**
 * Script para ejecutar la migración de tiempo_espera_minutos
 * Agrega la columna que registra el tiempo de espera del turno
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function ejecutarMigracion() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración: add-tiempo-espera.sql');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    // Leer archivo de migración
    const sqlFile = path.join(__dirname, '../migrations/add-tiempo-espera.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar migración
    const result = await client.query(sql);
    
    console.log('✅ Migración ejecutada exitosamente\n');
    console.log('📊 Resultados:');
    
    // Mostrar resultado
    if (result.length > 0 && result[result.length - 1].rows.length > 0) {
      const stats = result[result.length - 1].rows[0];
      console.log(`   - Status: ${stats.status}`);
      console.log(`   - Turnos actualizados: ${stats.turnos_actualizados}`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Columna tiempo_espera_minutos agregada correctamente');
    console.log('📝 Tipo: DECIMAL(10, 2)');
    console.log('📊 Cálculo: EXTRACT(EPOCH FROM (fecha_asignacion - created_at)) / 60');
    
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
ejecutarMigracion()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
