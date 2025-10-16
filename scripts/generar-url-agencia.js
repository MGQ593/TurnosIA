/**
 * Genera URL con agencia específica
 * Uso: node generar-url-agencia.js <id_agencia>
 */

const { generarTokenAcceso } = require('../dist/utils/jwtUtils');

function generarUrlConAgencia(agenciaId) {
  // Generar token de acceso
  const token = generarTokenAcceso();
  
  // Construir URL con agencia
  const baseUrl = 'http://localhost:3000/solicitar-turno.html';
  const url = `${baseUrl}?id_agencia=${agenciaId}&access=${token}`;
  
  console.log('\n🎯 URL GENERADA CON AGENCIA\n');
  console.log('═'.repeat(80));
  console.log(`\n📍 Agencia ID: ${agenciaId}`);
  console.log(`⏰ Token válido por: 15 minutos`);
  console.log('\n🌐 URL COMPLETA:\n');
  console.log(`   ${url}`);
  console.log('\n' + '═'.repeat(80));
  console.log('\n📋 Copia esta URL en tu navegador para solicitar turno en la agencia seleccionada\n');
  
  return url;
}

// Obtener ID de agencia de los argumentos
const args = process.argv.slice(2);
const agenciaId = args[0];

if (!agenciaId) {
  console.error('\n❌ Error: Debes proporcionar un ID de agencia\n');
  console.log('Uso: node generar-url-agencia.js <id_agencia>\n');
  console.log('Ejemplo: node generar-url-agencia.js 1\n');
  console.log('Agencias disponibles:');
  console.log('  1 - Agencia Principal');
  console.log('  2 - Agencia Norte');
  console.log('  3 - Agencia Sur\n');
  process.exit(1);
}

const id = parseInt(agenciaId);

if (isNaN(id) || id <= 0) {
  console.error('\n❌ Error: El ID de agencia debe ser un número positivo\n');
  process.exit(1);
}

generarUrlConAgencia(id);
