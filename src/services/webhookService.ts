/**
 * Servicio para enviar notificaciones de turnos al webhook de n8n
 */

interface TurnoWebhookData {
  id_turno: number;
  numero_turno: string;
  cedula: string;
  telefono: string;
  sucursal: string;
  sucursal_id: number;
  fecha_hora: Date;
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
    id_turno: data.id_turno,
    numero_turno: data.numero_turno,
    cedula: data.cedula,
    telefono: data.telefono,
    sucursal: data.sucursal,
    sucursal_id: data.sucursal_id,
    fecha_hora: data.fecha_hora,
    timestamp: new Date().toISOString()
  };

  let lastError: Error | null = null;

  // Intentar enviar hasta maxRetries veces
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Intento ${attempt}/${maxRetries} - Enviando turno ${data.numero_turno} al webhook n8n`);

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
