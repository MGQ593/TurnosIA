import { Router, Request, Response } from 'express';
import { TurnosQueries, ClientesQueries, AgenciasQueries } from '../../db/queries';
import { SolicitarTurnoRequest, TurnoCreatedResponse, ApiResponse } from '../../types';
import { z } from 'zod';
import QRCode from 'qrcode';
import { enviarTurnoWebhook } from '../../services/webhookService';

const router = Router();

// Esquemas de validación - Solo datos del formulario
const solicitarTurnoSchema = z.object({
  cliente: z.object({
    nombres: z.string().optional(), // Opcional - se generará automáticamente
    identificacion: z.string().min(1, 'Identificación es requerida'),
    celular: z.string().min(10, 'Celular debe tener al menos 10 dígitos')
  }),
  agencia_id: z.number().int().positive('ID de agencia debe ser positivo')
});

/**
 * GET /api/turnos/agencias
 * Obtiene la lista de agencias activas
 * Devuelve: id, nombre, codigo de cada agencia
 */
router.get('/agencias', async (req: Request, res: Response) => {
  try {
    console.log('🏢 Solicitando lista de agencias activas');
    
    // Obtener solo agencias activas
    const agencias = await AgenciasQueries.obtenerActivas();
    
    console.log(`✅ Se encontraron ${agencias.length} agencias activas`);
    
    const response: ApiResponse = {
      success: true,
      message: 'Agencias obtenidas correctamente',
      data: agencias.map(ag => ({
        id: ag.id,
        nombre: ag.nombre,
        codigo: ag.codigo
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error obteniendo agencias:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error al obtener agencias',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
    
    res.status(500).json(response);
  }
});

/**
 * POST /api/turnos/solicitar
 * Solicita un nuevo turno - Solo requiere datos del formulario
 * Fecha y hora se registran automáticamente
 */
router.post('/solicitar', async (req: Request, res: Response) => {
  try {
    console.log('📝 Solicitud de turno recibida:', req.body);
    
    // Validar datos de entrada
    const validationResult = solicitarTurnoSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ Validación fallida:', validationResult.error.errors);
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
      return res.status(400).json(response);
    }

    const { cliente: datosCliente, agencia_id } = validationResult.data;

    // Verificar si el cliente ya existe
    let cliente = await ClientesQueries.obtenerPorIdentificacion(datosCliente.identificacion);
    
    if (!cliente) {
      console.log('👤 Creando nuevo cliente:', datosCliente.identificacion);
      // Crear nuevo cliente (el nombre se genera automáticamente si no se proporciona)
      cliente = await ClientesQueries.crear({
        nombres: datosCliente.nombres, // Opcional - se generará automáticamente
        identificacion: datosCliente.identificacion,
        celular: datosCliente.celular
      });
      console.log('✅ Cliente creado con ID:', cliente.id);
    } else {
      console.log('👤 Cliente existente encontrado:', cliente.id);
      // Actualizar solo el celular
      await ClientesQueries.actualizar(cliente.id, {
        celular: datosCliente.celular
      });
      console.log('✅ Cliente actualizado');
    }

    // Crear el turno con fecha y hora automática
    console.log('🎫 Creando turno para agencia:', agencia_id);
    const turno = await TurnosQueries.crear(
      agencia_id,
      cliente.id,
      cliente.nombres, // Usar el nombre del cliente guardado en BD
      datosCliente.celular
    );
    console.log('✅ Turno creado:', turno.numero_turno);

    // Generar código QR
    const qrData = JSON.stringify({
      turno_id: turno.id,
      numero_turno: turno.numero_turno,
      fecha_hora: turno.fecha_hora,
      cliente: cliente.nombres, // Usar el nombre del cliente guardado en BD
      agencia_id: turno.agencia_id
    });

    const codigoQR = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    console.log('✅ Código QR generado');

    // Obtener información de la agencia para el webhook
    const agencia = await AgenciasQueries.obtenerPorId(agencia_id);
    
    // Enviar datos al webhook de n8n ANTES de responder al cliente
    let webhookResult = null;
    if (agencia) {
      webhookResult = await enviarTurnoWebhook({
        id_turno: turno.id,
        numero_turno: turno.numero_turno,
        cedula: datosCliente.identificacion,
        telefono: datosCliente.celular,
        sucursal: agencia.nombre,
        sucursal_id: agencia_id,
        fecha_hora: turno.fecha_hora
      });

      if (webhookResult.success) {
        console.log(`✅ Notificación enviada correctamente en ${webhookResult.attempts} intento(s)`);
      } else {
        console.warn(`⚠️ Fallo en notificación: ${webhookResult.message}`);
      }
    }

    // Respuesta con información del webhook
    const response: ApiResponse = {
      success: true,
      data: {
        turno_id: turno.id,
        numero_turno: turno.numero_turno,
        fecha_hora: turno.fecha_hora,
        estado: turno.estado,
        codigo_qr: codigoQR,
        cliente: {
          nombre: cliente.nombres,
          identificacion: datosCliente.identificacion,
          celular: datosCliente.celular
        },
        notificacion: webhookResult ? {
          enviada: webhookResult.success,
          mensaje: webhookResult.success 
            ? 'Recibirás notificaciones sobre tu turno' 
            : 'Turno registrado, pero las notificaciones pueden retrasarse'
        } : undefined
      },
      message: webhookResult?.success 
        ? 'Turno solicitado exitosamente. Recibirás notificaciones.' 
        : 'Turno solicitado exitosamente.'
    };

    console.log('✅ Turno procesado correctamente');
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ Error solicitando turno:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor al crear el turno',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/turnos/:id
 * Obtiene un turno por ID con detalles
 * NOTA: Endpoint deshabilitado temporalmente - requiere actualización al nuevo esquema
 */
/*
router.get('/:id', async (req: Request, res: Response) => {
  // TODO: Implementar cuando se actualice la función obtenerConDetalles
});
*/

/**
 * GET /api/turnos/agencia/:agenciaId/fecha/:fecha
 * Obtiene turnos por agencia y fecha
 */
router.get('/agencia/:agenciaId/fecha/:fecha', async (req: Request, res: Response) => {
  try {
    const agenciaId = parseInt(req.params.agenciaId);
    const fechaStr = req.params.fecha;
    
    if (isNaN(agenciaId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de agencia inválido'
      };
      return res.status(400).json(response);
    }

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      const response: ApiResponse = {
        success: false,
        message: 'Fecha inválida'
      };
      return res.status(400).json(response);
    }

    const turnos = await TurnosQueries.obtenerPorAgenciaYFecha(agenciaId, fecha);

    const response: ApiResponse = {
      success: true,
      data: turnos
    };

    res.json(response);
  } catch (error) {
    console.error('Error obteniendo turnos por agencia y fecha:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/turnos/agencia/:id
 * Obtiene información de una agencia por ID
 */
router.get('/agencia/:id', async (req: Request, res: Response) => {
  try {
    const agenciaId = parseInt(req.params.id);
    
    if (isNaN(agenciaId) || agenciaId <= 0) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de agencia inválido'
      };
      return res.status(400).json(response);
    }

    const agencia = await AgenciasQueries.obtenerPorId(agenciaId);
    
    if (!agencia) {
      const response: ApiResponse = {
        success: false,
        message: 'Agencia no encontrada'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Agencia encontrada',
      data: agencia
    };

    res.json(response);
  } catch (error) {
    console.error('Error obteniendo agencia:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/turnos/estado/:numero
 * Consulta el estado de asignación de un turno
 */
router.get('/estado/:numero', async (req: Request, res: Response) => {
  try {
    const { numero } = req.params;
    
    console.log(`🔍 Consultando estado del turno: ${numero}`);
    
    const estado = await TurnosQueries.obtenerEstadoAsignacion(numero);
    
    if (!estado) {
      const response: ApiResponse = {
        success: false,
        message: 'Turno no encontrado'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: estado
    };

    res.json(response);
  } catch (error) {
    console.error('Error consultando estado del turno:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * POST /api/webhook/asignar-turno
 * Webhook para asignar un turno a un módulo y asesor
 * Este endpoint es llamado por sistemas externos cuando un asesor llama a un turno
 * IMPORTANTE: Ahora requiere agencia_id para evitar colisiones entre agencias
 */
router.post('/webhook/asignar-turno', async (req: Request, res: Response) => {
  try {
    console.log('📥 Webhook de asignación recibido:', req.body);
    
    // Validar datos (ahora incluye agencia_id)
    const asignarSchema = z.object({
      numero_turno: z.string().min(1, 'Número de turno es requerido'),
      agencia_id: z.number().int().positive('ID de agencia es requerido'),
      modulo: z.string().min(1, 'Módulo es requerido'),
      asesor: z.string().min(1, 'Asesor es requerido')
    });

    const validationResult = asignarSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ Validación fallida:', validationResult.error.errors);
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
      return res.status(400).json(response);
    }

    const { numero_turno, agencia_id, modulo, asesor } = validationResult.data;

    // Asignar turno (ahora con agencia_id)
    const asignado = await TurnosQueries.asignarTurno(numero_turno, agencia_id, modulo, asesor);
    
    if (!asignado) {
      const response: ApiResponse = {
        success: false,
        message: `No se pudo asignar el turno. Verifique que el turno ${numero_turno} existe en la agencia ${agencia_id}.`
      };
      return res.status(404).json(response);
    }

    console.log(`✅ Turno ${numero_turno} de agencia ${agencia_id} asignado a ${modulo} - ${asesor}`);

    const response: ApiResponse = {
      success: true,
      message: 'Turno asignado correctamente',
      data: {
        numero_turno,
        agencia_id,
        modulo,
        asesor,
        fecha_asignacion: new Date()
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error asignando turno:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

export default router;