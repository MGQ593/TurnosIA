/**
 * Script de prueba para asignar un turno
 * Simula el webhook que enviaría un sistema externo
 * 
 * Uso: node scripts/test-asignar-turno.js <agencia_id> <numero_turno> <modulo> <asesor>
 */

const https = require('https');
const http = require('http');

// Configuración
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ENDPOINT = '/api/webhook/asignar-turno';

// Argumentos de línea de comandos
const [,, agenciaId, numeroTurno, modulo, asesor] = process.argv;

if (!agenciaId || !numeroTurno || !modulo || !asesor) {
  console.log('❌ Error: Faltan argumentos\n');
  console.log('Uso:');
  console.log('  node scripts/test-asignar-turno.js <agencia_id> <numero_turno> <modulo> <asesor>\n');
  console.log('Ejemplo:');
  console.log('  node scripts/test-asignar-turno.js 1 T004 "Módulo 2" "María González"\n');
  console.log('Agencias disponibles:');
  console.log('  1 - Agencia Principal');
  console.log('  2 - Agencia Norte');
  console.log('  3 - Agencia Sur\n');
  process.exit(1);
}

const agencia = parseInt(agenciaId);
if (isNaN(agencia) || agencia <= 0) {
  console.log('❌ Error: agencia_id debe ser un número positivo\n');
  process.exit(1);
}

// Datos a enviar (ahora incluye agencia_id)
const data = JSON.stringify({
  numero_turno: numeroTurno,
  agencia_id: agencia,
  modulo: modulo,
  asesor: asesor
});

// Calcular el tamaño correcto en bytes (para caracteres UTF-8)
const dataBuffer = Buffer.from(data, 'utf8');

console.log('🧪 PRUEBA DE ASIGNACIÓN DE TURNO\n');
console.log('═══════════════════════════════════════════════');
console.log(`📍 Servidor: ${SERVER_URL}`);
console.log(`� Agencia: ${agencia}`);
console.log(`�🎫 Turno: ${numeroTurno}`);
console.log(`📍 Módulo: ${modulo}`);
console.log(`👤 Asesor: ${asesor}`);
console.log('═══════════════════════════════════════════════\n');

// Determinar si es HTTP o HTTPS
const url = new URL(SERVER_URL + ENDPOINT);
const client = url.protocol === 'https:' ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: ENDPOINT,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': dataBuffer.length
  }
};

console.log('📤 Enviando solicitud de asignación...\n');

const req = client.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📊 Status: ${res.statusCode}\n`);
    
    try {
      const result = JSON.parse(responseData);
      
      if (res.statusCode === 200 && result.success) {
        console.log('✅ ASIGNACIÓN EXITOSA!\n');
        console.log('📋 Detalles:');
        console.log(`   • Turno: ${result.data.numero_turno}`);
        console.log(`   • Módulo: ${result.data.modulo}`);
        console.log(`   • Asesor: ${result.data.asesor}`);
        console.log(`   • Fecha: ${new Date(result.data.fecha_asignacion).toLocaleString('es-EC')}`);
        console.log('\n💡 El cliente verá esta información en máximo 5 segundos\n');
      } else {
        console.log('❌ ERROR EN ASIGNACIÓN\n');
        console.log(`Mensaje: ${result.message}`);
        if (result.error) {
          console.log(`Error: ${result.error}`);
        }
        console.log('');
      }
    } catch (error) {
      console.log('❌ Error parseando respuesta:', error.message);
      console.log('Respuesta:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la solicitud:', error.message);
  process.exit(1);
});

// Enviar datos (usar el buffer para encoding correcto)
req.write(dataBuffer);
req.end();
