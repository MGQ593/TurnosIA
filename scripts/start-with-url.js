// Script para iniciar el servidor y generar URL de acceso
// Uso: node start-with-url.js [id_agencia]
require('dotenv').config();
const { spawn } = require('child_process');
const { generarTokenAcceso } = require('../dist/utils/jwtUtils');

// Obtener ID de agencia de los argumentos (opcional)
const args = process.argv.slice(2);
const agenciaId = args[0] ? parseInt(args[0]) : null;

console.log('\n🚀 INICIANDO SERVIDOR Y GENERANDO URL DE ACCESO\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Generar token y URL
const token = generarTokenAcceso();
let url = `http://localhost:3000/solicitar-turno.html`;

// Agregar parámetros a la URL
if (agenciaId && !isNaN(agenciaId) && agenciaId > 0) {
  url += `?id_agencia=${agenciaId}&access=${token}`;
  console.log(`📍 Agencia ID: ${agenciaId}`);
} else {
  url += `?access=${token}`;
  console.log('📍 Sin agencia específica (se asignará por defecto)');
}

console.log('✅ Token de acceso generado!\n');
console.log('🌐 URL COMPLETA PARA ACCEDER AL FORMULARIO:');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\n   ${url}\n`);
console.log('═══════════════════════════════════════════════════════════════');
console.log('\n⏰ Token válido por: 15 minutos');
console.log('📋 Copia esta URL en tu navegador\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Iniciar el servidor
console.log('🔄 Iniciando servidor...\n');

const server = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error);
});

server.on('exit', (code) => {
  console.log(`\n⚠️  Servidor detenido con código: ${code}`);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Deteniendo servidor...');
  server.kill();
  process.exit();
});
