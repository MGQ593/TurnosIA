/**
 * Script de pruebas automáticas para endpoints de turnos
 * Ejecuta todos los casos de prueba del QA
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testHeader(name) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`TEST: ${name}`, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

function assertResponse(test, expected, actual) {
  testResults.total++;
  if (expected === actual) {
    testResults.passed++;
    log(`✅ ${test}: PASS`, colors.green);
    return true;
  } else {
    testResults.failed++;
    log(`❌ ${test}: FAIL (esperado: ${expected}, recibido: ${actual})`, colors.red);
    return false;
  }
}

async function test1_GetAgencias() {
  testHeader('GET /api/turnos/agencias');

  try {
    const response = await fetch(`${BASE_URL}/api/turnos/agencias`);
    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);
    assertResponse('Data is array', true, Array.isArray(data.data));

    if (data.data.length > 0) {
      const agencia = data.data[0];
      assertResponse('Agencia has id', true, !!agencia.id);
      assertResponse('Agencia has nombre', true, !!agencia.nombre);
      assertResponse('Agencia has codigo', true, !!agencia.codigo);
      log(`📊 Agencias encontradas: ${data.data.length}`, colors.blue);
    }

    return data.data[0]; // Retornar primera agencia para siguientes tests
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
    return null;
  }
}

async function test2_SolicitarTurno(agenciaId) {
  testHeader('POST /api/turnos/solicitar');

  if (!agenciaId) {
    log('⚠️ Skipping - No hay agencia ID', colors.yellow);
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/turnos/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: {
          identificacion: '1234567890',
          celular: '0987654321',
          nombres: 'Test QA'
        },
        agencia_id: agenciaId,
        whatsapp_validado: false
      })
    });

    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);
    assertResponse('Has turno data', true, !!data.data?.turno);
    assertResponse('Has QR code', true, !!data.data?.codigo_qr);

    if (data.data?.turno) {
      const turno = data.data.turno;
      log(`📝 Turno creado: ${turno.numero_turno} (ID: ${turno.id})`, colors.blue);
      log(`📍 Estado: ${turno.estado}`, colors.blue);
      return turno;
    }

    return null;
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
    return null;
  }
}

async function test3_ConsultarEstado(numeroTurno, agenciaId) {
  testHeader('GET /api/turnos/estado/:numero_turno');

  if (!numeroTurno || !agenciaId) {
    log('⚠️ Skipping - Faltan datos del turno', colors.yellow);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/turnos/estado/${numeroTurno}?agenciaId=${agenciaId}`);
    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);
    assertResponse('Has estado', true, !!data.data?.estado);

    if (data.data) {
      log(`📊 Estado: ${data.data.estado}`, colors.blue);
      log(`📊 Asignado: ${data.data.asignado}`, colors.blue);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
  }
}

async function test4_AsignarTurno(idTurno) {
  testHeader('POST /api/webhook/asignar-turno');

  if (!idTurno) {
    log('⚠️ Skipping - No hay turno ID', colors.yellow);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/webhook/asignar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_turno: idTurno,
        modulo: 'QA Test Module',
        asesor: 'QA Test Asesor'
      })
    });

    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);

    if (data.data) {
      log(`📊 Módulo: ${data.data.modulo}`, colors.blue);
      log(`📊 Asesor: ${data.data.asesor}`, colors.blue);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
  }
}

async function test5_FinalizarTurno(idTurno) {
  testHeader('POST /api/webhook/finalizar-turno ⭐ NUEVO');

  if (!idTurno) {
    log('⚠️ Skipping - No hay turno ID', colors.yellow);
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/webhook/finalizar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_turno: idTurno,
        observaciones: 'QA Test - Cliente atendido satisfactoriamente'
      })
    });

    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);
    assertResponse('Estado is finalizado', 'finalizado', data.data?.estado);
    assertResponse('Has tiempo_atencion', true, typeof data.data?.tiempo_atencion_minutos === 'number');

    if (data.data) {
      log(`📊 Estado: ${data.data.estado}`, colors.blue);
      log(`📊 Tiempo atención: ${data.data.tiempo_atencion_minutos} min`, colors.blue);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
  }
}

async function test6_CancelarTurno(agenciaId) {
  testHeader('POST /api/webhook/cancelar-turno ⭐ NUEVO');

  if (!agenciaId) {
    log('⚠️ Skipping - No hay agencia ID', colors.yellow);
    return;
  }

  // Crear un turno nuevo para cancelar
  log('📝 Creando turno para cancelar...', colors.cyan);

  try {
    const createResponse = await fetch(`${BASE_URL}/api/turnos/solicitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cliente: {
          identificacion: '9999999999',
          celular: '0999999999',
          nombres: 'Test Cancelar'
        },
        agencia_id: agenciaId,
        whatsapp_validado: false
      })
    });

    const createData = await createResponse.json();

    if (!createData.data?.turno) {
      log('❌ No se pudo crear turno para cancelar', colors.red);
      return;
    }

    const turnoId = createData.data.turno.id;
    log(`📝 Turno creado: ${createData.data.turno.numero_turno} (ID: ${turnoId})`, colors.blue);

    // Asignar el turno primero
    log('📝 Asignando turno...', colors.cyan);
    await fetch(`${BASE_URL}/api/webhook/asignar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_turno: turnoId,
        modulo: 'QA Cancel Test',
        asesor: 'QA Cancel Asesor'
      })
    });

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Ahora cancelar
    log('📝 Cancelando turno...', colors.cyan);
    const response = await fetch(`${BASE_URL}/api/webhook/cancelar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_turno: turnoId,
        motivo: 'QA Test - Cliente no se presentó'
      })
    });

    const data = await response.json();

    assertResponse('Status code', 200, response.status);
    assertResponse('Response success', true, data.success);
    assertResponse('Estado is cancelado', 'cancelado', data.data?.estado);
    assertResponse('Has motivo', true, !!data.data?.motivo);

    if (data.data) {
      log(`📊 Estado: ${data.data.estado}`, colors.blue);
      log(`📊 Motivo: ${data.data.motivo}`, colors.blue);
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
    testResults.failed++;
    testResults.total++;
  }
}

async function test7_ErrorCases() {
  testHeader('Casos de Error');

  // Test 1: ID no existe
  try {
    const response = await fetch(`${BASE_URL}/api/webhook/finalizar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_turno: 99999999 })
    });

    const data = await response.json();
    assertResponse('ID no existe - returns 200', 200, response.status);
    assertResponse('ID no existe - success false', false, data.success);
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }

  // Test 2: Campo faltante
  try {
    const response = await fetch(`${BASE_URL}/api/webhook/finalizar-turno`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const data = await response.json();
    assertResponse('Campo faltante - returns 400', 400, response.status);
    assertResponse('Campo faltante - success false', false, data.success);
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red);
  }
}

async function runAllTests() {
  log('\n🚀 Iniciando suite de pruebas de QA', colors.cyan);
  log(`📍 Base URL: ${BASE_URL}`, colors.cyan);
  log(`📅 Fecha: ${new Date().toLocaleString()}`, colors.cyan);

  let agencia = null;
  let turno = null;

  // Test 1: Obtener agencias
  agencia = await test1_GetAgencias();

  if (agencia) {
    // Test 2: Solicitar turno
    turno = await test2_SolicitarTurno(agencia.id);

    if (turno) {
      // Test 3: Consultar estado
      await test3_ConsultarEstado(turno.numero_turno, agencia.id);

      // Test 4: Asignar turno
      await test4_AsignarTurno(turno.id);

      // Esperar 2 segundos para que se registre la asignación
      log('\n⏳ Esperando 2 segundos antes de finalizar...', colors.yellow);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 5: Finalizar turno
      await test5_FinalizarTurno(turno.id);
    }

    // Test 6: Cancelar turno (crea uno nuevo)
    await test6_CancelarTurno(agencia.id);
  }

  // Test 7: Casos de error
  await test7_ErrorCases();

  // Resumen final
  log('\n' + '='.repeat(60), colors.cyan);
  log('📊 RESUMEN DE PRUEBAS', colors.cyan);
  log('='.repeat(60), colors.cyan);
  log(`Total de pruebas: ${testResults.total}`, colors.blue);
  log(`✅ Pasadas: ${testResults.passed}`, colors.green);
  log(`❌ Fallidas: ${testResults.failed}`, colors.red);

  const percentage = ((testResults.passed / testResults.total) * 100).toFixed(2);
  log(`📈 Tasa de éxito: ${percentage}%`, colors.blue);

  if (testResults.failed === 0) {
    log('\n🎉 ¡TODOS LOS TESTS PASARON!', colors.green);
  } else {
    log('\n⚠️ Algunos tests fallaron. Revisa los detalles arriba.', colors.yellow);
  }
}

// Ejecutar tests
runAllTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, colors.red);
  process.exit(1);
});
