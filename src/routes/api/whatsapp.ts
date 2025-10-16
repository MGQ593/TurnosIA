import { Router, Request, Response } from 'express';
import { ValidarWhatsAppRequest, WhatsAppValidationResponse, ApiResponse } from '../../types';
import { z } from 'zod';

const router = Router();

// Esquema de validación
const validarWhatsAppSchema = z.object({
  numero: z.string().min(1, 'Número de teléfono es requerido')
});

/**
 * Función para validar y formatear número de WhatsApp
 */
function validarNumeroWhatsApp(numero: string): WhatsAppValidationResponse {
  // Limpiar el número (remover espacios, guiones, etc.)
  const numeroLimpio = numero.replace(/[\s\-\(\)\+]/g, '');
  
  // Verificar que solo contenga dígitos
  if (!/^\d+$/.test(numeroLimpio)) {
    return {
      valido: false,
      mensaje: 'El número debe contener solo dígitos'
    };
  }

  // Verificar longitud mínima y máxima
  if (numeroLimpio.length < 10) {
    return {
      valido: false,
      mensaje: 'El número debe tener al menos 10 dígitos'
    };
  }

  if (numeroLimpio.length > 15) {
    return {
      valido: false,
      mensaje: 'El número no debe exceder 15 dígitos'
    };
  }

  // Formatear el número para Colombia
  let numeroFormateado = numeroLimpio;
  
  // Si empieza con 57 (código de Colombia), mantenerlo
  if (numeroLimpio.startsWith('57')) {
    numeroFormateado = numeroLimpio;
  }
  // Si es un número de 10 dígitos que empieza con 3 (celular Colombia), agregar código de país
  else if (numeroLimpio.length === 10 && numeroLimpio.startsWith('3')) {
    numeroFormateado = '57' + numeroLimpio;
  }
  // Si ya tiene código de país pero no es 57, mantenerlo
  else if (numeroLimpio.length > 10) {
    numeroFormateado = numeroLimpio;
  }
  else {
    return {
      valido: false,
      mensaje: 'Formato de número no válido para WhatsApp'
    };
  }

  return {
    valido: true,
    mensaje: 'Número válido',
    numero_formateado: numeroFormateado
  };
}

/**
 * POST /api/whatsapp/validar
 * Valida un número de WhatsApp
 */
router.post('/validar', async (req: Request, res: Response) => {
  try {
    // Validar datos de entrada
    const validationResult = validarWhatsAppSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
      return res.status(400).json(response);
    }

    const { numero }: ValidarWhatsAppRequest = validationResult.data;
    const validacion = validarNumeroWhatsApp(numero);

    const response: ApiResponse<WhatsAppValidationResponse> = {
      success: validacion.valido,
      data: validacion,
      message: validacion.mensaje
    };

    // Si el número no es válido, devolver código 400
    if (!validacion.valido) {
      return res.status(400).json(response);
    }

    res.json(response);
  } catch (error) {
    console.error('Error validando número de WhatsApp:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * POST /api/whatsapp/enviar
 * Envía un mensaje por WhatsApp (placeholder para implementación futura)
 */
router.post('/enviar', async (req: Request, res: Response) => {
  try {
    // TODO: Implementar integración con API de WhatsApp
    // Por ahora solo simularemos el envío exitoso
    
    const { numero, mensaje } = req.body;
    
    if (!numero || !mensaje) {
      const response: ApiResponse = {
        success: false,
        message: 'Número y mensaje son requeridos'
      };
      return res.status(400).json(response);
    }

    // Validar el número primero
    const validacion = validarNumeroWhatsApp(numero);
    
    if (!validacion.valido) {
      const response: ApiResponse = {
        success: false,
        message: validacion.mensaje
      };
      return res.status(400).json(response);
    }

    // Aquí se implementaría la llamada a la API de WhatsApp
    console.log(`Enviando mensaje a ${validacion.numero_formateado}: ${mensaje}`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Mensaje enviado exitosamente (simulado)',
      data: {
        numero_destino: validacion.numero_formateado,
        mensaje_enviado: mensaje,
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error enviando mensaje por WhatsApp:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

export default router;