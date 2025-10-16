/**
 * Script para ejecutar migración de asignación de turnos
 * Agrega columnas: modulo, asesor, fecha_asignacion
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function ejecutarMigracion() {
  console.log('🚀 Iniciando migración de asignación de turnos...\n');
  
  try {
    // Leer archivo SQL
    const sqlPath = path.join(__dirname, '../migrations/add-asignacion-turno.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('📄 Archivo SQL cargado');
    console.log('🔄 Ejecutando migración...\n');
    
    // Ejecutar migración
    await pool.query(sql);
    
    console.log('✅ Migración ejecutada correctamente\n');
    
    // Verificar columnas creadas
    console.log('🔍 Verificando columnas creadas...\n');
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'turnos_ia' 
        AND table_name = 'turnos' 
        AND column_name IN ('modulo', 'asesor', 'fecha_asignacion')
      ORDER BY column_name;
    `);
    
    if (result.rows.length === 3) {
      console.log('✅ Columnas verificadas:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
      console.log('');
    } else {
      console.log('⚠️  Advertencia: Se esperaban 3 columnas pero se encontraron', result.rows.length);
    }
    
    // Verificar índices
    console.log('🔍 Verificando índices creados...\n');
    const indices = await pool.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE schemaname = 'turnos_ia' 
        AND tablename = 'turnos'
        AND indexname IN ('idx_turnos_numero_turno', 'idx_turnos_asignados');
    `);
    
    if (indices.rows.length > 0) {
      console.log('✅ Índices creados:');
      indices.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
      console.log('');
    }
    
    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

ejecutarMigracion();
