/**
 * Script para ejecutar migraciones SQL en la base de datos
 * Uso: node scripts/run-migration.js <archivo-sql>
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Configurar conexión a la base de datos
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration(migrationFile) {
  const client = await pool.connect();

  try {
    console.log(`\n📦 Ejecutando migración: ${migrationFile}`);

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log(`📄 SQL cargado, ejecutando...`);

    // Ejecutar la migración
    const result = await client.query(sql);

    console.log(`✅ Migración completada exitosamente`);

    if (result.rows && result.rows.length > 0) {
      console.log(`\n📊 Resultado:`);
      console.table(result.rows);
    }

  } catch (error) {
    console.error(`❌ Error ejecutando migración:`, error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Obtener el archivo de migración de los argumentos
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Error: Debes especificar el archivo de migración');
  console.log('Uso: node scripts/run-migration.js <archivo-sql>');
  console.log('Ejemplo: node scripts/run-migration.js add-finalizacion-cancelacion-campos.sql');
  process.exit(1);
}

runMigration(migrationFile).catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
