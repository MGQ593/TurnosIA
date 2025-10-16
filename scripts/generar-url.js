// Script para generar URL de acceso al formulario
require('dotenv').config();
const { generarTokenAcceso } = require('../dist/utils/jwtUtils');

console.log('\n🔗 GENERANDO URL DE ACCESO AL FORMULARIO\n');
console.log('═══════════════════════════════════════════════════════════════\n');

const token = generarTokenAcceso();
const url = `http://localhost:3000/solicitar-turno.html?access=${token}`;

console.log('✅ Token generado exitosamente!\n');
console.log('🌐 URL completa:');
console.log(`   ${url}\n`);
console.log('⏰ Token válido por: 15 minutos');
console.log('📋 Copia esta URL en tu navegador para acceder al formulario.\n');
console.log('═══════════════════════════════════════════════════════════════\n');
