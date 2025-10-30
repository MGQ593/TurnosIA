/**
 * Servicio para enviar notificaciones de turnos al webhook de n8n
 */

interface TurnoWebhookData {
  id_turno: number; // ID único del turno en la base de datos
  numero_turno: string; // Número de turno visible (T001, T002, etc.)
  cedula: string;
  telefono: string;
  sucursal: string;
  sucursal_id: number;
  fecha_hora: Date;
  whatsapp_validado: boolean; // Indica si el número tiene WhatsApp activo
}

interface TurnoAsignadoWebhookData {
  id_turno: number; // ID único del turno
  numero_turno: string; // Número de turno visible (T001, T002, etc.)
  agencia_id: number; // ID de la agencia
  modulo: string; // Módulo asignado
  asesor: string; // Asesor asignado
  estado: string; // Estado del turno (llamado)
  fecha_asignacion: Date; // Fecha de asignación
}

interface WebhookResult {
  success: boolean;
  message: string;
  attempts: number;
}

/**
 * Envía los datos del turno al webhook de n8n con reintentos automáticos
 * @param data Datos del turno a enviar
 * @param maxRetries Número máximo de reintentos (default: 3)
 * @returns Resultado del envío con información de intentos
 */
export async function enviarTurnoWebhook(
  data: TurnoWebhookData, 
  maxRetries: number = 3
): Promise<WebhookResult> {
  const webhookUrl = process.env.WEBHOOK_TURNOS_URL;

  if (!webhookUrl) {
    console.warn('⚠️ WEBHOOK_TURNOS_URL no está configurado en .env');
    return {
      success: false,
      message: 'Webhook no configurado',
      attempts: 0
    };
  }

  const payload = {
    id_turno: data.id_turno, // ⭐ ID único para asignar el turno sin colisiones
    numero_turno: data.numero_turno, // Número visible del turno
    cedula: data.cedula,
    telefono: data.telefono,
    sucursal: data.sucursal,
    sucursal_id: data.sucursal_id,
    fecha_hora: data.fecha_hora,
    whatsapp_validado: data.whatsapp_validado, // Estado de validación de WhatsApp
    timestamp: new Date().toISOString()
  };

  let lastError: Error | null = null;

  // Intentar enviar hasta maxRetries veces
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Intento ${attempt}/${maxRetries} - Enviando turno ${data.numero_turno} al webhook n8n`);
      console.log(`📱 Datos del webhook:`, JSON.stringify(payload, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Intentar parsear la respuesta
      let result;
      try {
        result = await response.json();
      } catch {
        result = { message: 'Webhook recibido correctamente' };
      }

      console.log(`✅ Turno ${data.numero_turno} enviado exitosamente al webhook en intento ${attempt}`);
      
      return {
        success: true,
        message: 'Notificación enviada correctamente',
        attempts: attempt
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, lastError.message);

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const waitTime = attempt * 1000; // 1s, 2s, 3s
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`❌ Webhook falló después de ${maxRetries} intentos:`, lastError?.message);

  return {
    success: false,
    message: `Error al enviar notificación después de ${maxRetries} intentos: ${lastError?.message}`,
    attempts: maxRetries
  };
}

/**
 * Envía los datos de asignación de turno al webhook de n8n
 * @param data Datos de la asignación del turno
 * @param maxRetries Número máximo de reintentos (default: 3)
 * @returns Resultado del envío con información de intentos
 */
export async function enviarAsignacionTurnoWebhook(
  data: TurnoAsignadoWebhookData,
  maxRetries: number = 3
): Promise<WebhookResult> {
  const webhookUrl = process.env.WEBHOOK_TURNOS_URL;

  if (!webhookUrl) {
    console.warn('⚠️ WEBHOOK_TURNOS_URL no está configurado en .env');
    return {
      success: false,
      message: 'Webhook no configurado',
      attempts: 0
    };
  }

  const payload = {
    tipo_evento: 'turno_asignado', // ⭐ Identificador del tipo de evento
    id_turno: data.id_turno,
    numero_turno: data.numero_turno,
    agencia_id: data.agencia_id,
    modulo: data.modulo,
    asesor: data.asesor,
    estado: data.estado,
    fecha_asignacion: data.fecha_asignacion,
    timestamp: new Date().toISOString()
  };

  let lastError: Error | null = null;

  // Intentar enviar hasta maxRetries veces
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Intento ${attempt}/${maxRetries} - Enviando asignación de turno ${data.numero_turno} al webhook n8n`);
      console.log(`📱 Datos del webhook (asignación):`, JSON.stringify(payload, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Asignación de turno ${data.numero_turno} enviada exitosamente al webhook en intento ${attempt}`);

      return {
        success: true,
        message: 'Notificación de asignación enviada correctamente',
        attempts: attempt
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');
      console.error(`❌ Intento ${attempt}/${maxRetries} falló:`, lastError.message);

      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        const waitTime = attempt * 1000; // 1s, 2s, 3s
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`❌ Webhook de asignación falló después de ${maxRetries} intentos:`, lastError?.message);

  return {
    success: false,
    message: `Error al enviar notificación de asignación después de ${maxRetries} intentos: ${lastError?.message}`,
    attempts: maxRetries
  };
}
