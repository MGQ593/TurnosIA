import { Router, Request, Response } from 'express';
import { TurnosQueries, ClientesQueries, AgenciasQueries } from '../../db/queries';
import { SolicitarTurnoRequest, TurnoCreatedResponse, ApiResponse } from '../../types';
import { z } from 'zod';
import QRCode from 'qrcode';
import { enviarTurnoWebhook, enviarAsignacionTurnoWebhook, enviarFinalizacionTurnoWebhook, enviarCancelacionTurnoWebhook } from '../../services/webhookService';

const router = Router();

// Esquemas de validación - Solo datos del formulario
const solicitarTurnoSchema = z.object({
  cliente: z.object({
    nombres: z.string().optional(), // Opcional - se generará automáticamente
    identificacion: z.string().min(1, 'Identificación es requerida'),
    celular: z.string().min(10, 'Celular debe tener al menos 10 dígitos')
  }),
  agencia_id: z.number().int().positive('ID de agencia debe ser positivo'),
  whatsapp_validado: z.boolean().optional() // Estado de validación de WhatsApp
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
        codigo: ag.codigo,
        direccion: ag.direccion,
        telefono: ag.telefono,
        email: ag.email,
        activa: ag.activa
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
 * POST /api/turnos/agencias
 * Crea una nueva agencia
 */
router.post('/agencias', async (req: Request, res: Response) => {
  try {
    console.log('🏢 Creando nueva agencia:', req.body);

    const { nombre, direccion } = req.body;

    // Validar campo requerido
    if (!nombre) {
      const response: ApiResponse = {
        success: false,
        message: 'El nombre es requerido'
      };
      return res.status(400).json(response);
    }

    // Crear agencia en la base de datos
    // El código se genera automáticamente en la función crear()
    const nuevaAgencia = await AgenciasQueries.crear({
      nombre,
      direccion,
      activa: true
    });

    console.log('✅ Agencia creada exitosamente:', nuevaAgencia);

    const response: ApiResponse = {
      success: true,
      message: 'Agencia creada exitosamente',
      data: nuevaAgencia
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error creando agencia:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Error al crear agencia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * PUT /api/turnos/agencias/:id
 * Actualiza una agencia existente
 */
router.put('/agencias/:id', async (req: Request, res: Response) => {
  try {
    const agenciaId = parseInt(req.params.id);

    if (isNaN(agenciaId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de agencia inválido'
      };
      return res.status(400).json(response);
    }

    console.log(`🏢 Actualizando agencia ${agenciaId}:`, req.body);

    const { nombre, direccion, activa } = req.body;

    // Actualizar agencia (el código no se puede cambiar una vez creado)
    const agenciaActualizada = await AgenciasQueries.actualizar(agenciaId, {
      nombre,
      direccion,
      activa
    });

    if (!agenciaActualizada) {
      const response: ApiResponse = {
        success: false,
        message: 'Agencia no encontrada'
      };
      return res.status(404).json(response);
    }

    console.log('✅ Agencia actualizada exitosamente:', agenciaActualizada);

    const response: ApiResponse = {
      success: true,
      message: 'Agencia actualizada exitosamente',
      data: agenciaActualizada
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error actualizando agencia:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Error al actualizar agencia',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * DELETE /api/turnos/agencias/:id
 * Desactiva una agencia (soft delete)
 */
router.delete('/agencias/:id', async (req: Request, res: Response) => {
  try {
    const agenciaId = parseInt(req.params.id);

    if (isNaN(agenciaId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID de agencia inválido'
      };
      return res.status(400).json(response);
    }

    console.log(`🗑️ Desactivando agencia ${agenciaId}`);

    // Desactivar agencia (soft delete)
    const agenciaDesactivada = await AgenciasQueries.actualizar(agenciaId, {
      activa: false
    });

    if (!agenciaDesactivada) {
      const response: ApiResponse = {
        success: false,
        message: 'Agencia no encontrada'
      };
      return res.status(404).json(response);
    }

    console.log('✅ Agencia desactivada exitosamente');

    const response: ApiResponse = {
      success: true,
      message: 'Agencia desactivada exitosamente',
      data: agenciaDesactivada
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Error desactivando agencia:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Error al desactivar agencia',
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

    const { cliente: datosCliente, agencia_id, whatsapp_validado } = validationResult.data;

    // Log del estado de validación de WhatsApp
    console.log('📱 WhatsApp validado:', whatsapp_validado === true ? 'Sí ✅' : whatsapp_validado === false ? 'No ❌' : 'No verificado ⚠️');

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

    // Crear el turno y obtener la agencia en paralelo (queries independientes)
    console.log('🎫 Creando turno para agencia:', agencia_id);
    const [turno, agencia] = await Promise.all([
      TurnosQueries.crear(
        agencia_id,
        cliente.id,
        cliente.nombres,
        datosCliente.celular
      ),
      AgenciasQueries.obtenerPorId(agencia_id)
    ]);
    console.log('✅ Turno creado:', turno.numero_turno);

    // Generar código QR
    const qrData = JSON.stringify({
      turno_id: turno.id,
      numero_turno: turno.numero_turno,
      fecha_hora: turno.fecha_hora,
      cliente: cliente.nombres,
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

    // Disparar webhook de n8n en background (fire-and-forget) — no bloquea la respuesta
    if (agencia) {
      enviarTurnoWebhook({
        id_turno: turno.id,
        numero_turno: turno.numero_turno,
        cedula: datosCliente.identificacion,
        telefono: datosCliente.celular,
        sucursal: agencia.nombre,
        sucursal_id: agencia_id,
        fecha_hora: turno.fecha_hora,
        whatsapp_validado: whatsapp_validado ?? false
      })
        .then(result => {
          if (result.success) {
            console.log(`✅ Webhook turno ${turno.numero_turno} enviado en ${result.attempts} intento(s)`);
          } else {
            console.error(`❌ Webhook turno ${turno.numero_turno} falló: ${result.message}`);
          }
        })
        .catch(err => {
          console.error(`❌ Webhook turno ${turno.numero_turno} excepción:`, err);
        });
    } else {
      console.warn(`⚠️ Agencia ${agencia_id} no encontrada — se omite webhook para turno ${turno.numero_turno}`);
    }

    // Respuesta inmediata al cliente (sin esperar al webhook)
    const response: ApiResponse = {
      success: true,
      data: {
        turno_id: turno.id,
        numero_turno: turno.numero_turno,
        agencia_id: turno.agencia_id,
        fecha_hora: turno.fecha_hora,
        estado: turno.estado,
        codigo_qr: codigoQR,
        cliente: {
          nombre: cliente.nombres,
          identificacion: datosCliente.identificacion,
          celular: datosCliente.celular
        }
      },
      message: 'Turno solicitado exitosamente.'
    };

    console.log('✅ Turno procesado correctamente');
    res.status(201).json(response);

  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Error solicitando turno:', error, stack ? `\nStack: ${stack}` : '');

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
 * Requiere agenciaId como query param para evitar colisiones entre agencias
 */
router.get('/estado/:numero', async (req: Request, res: Response) => {
  try {
    const { numero } = req.params;
    const agenciaId = parseInt(req.query.agenciaId as string);
    
    if (!agenciaId || isNaN(agenciaId)) {
      const response: ApiResponse = {
        success: false,
        message: 'El ID de la agencia es requerido'
      };
      return res.status(400).json(response);
    }
    
    console.log(`🔍 Consultando estado del turno: ${numero} de agencia ${agenciaId}`);
    
    const estado = await TurnosQueries.obtenerEstadoAsignacion(numero, agenciaId);
    
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
 * IMPORTANTE: Ahora requiere id_turno (ID único) para evitar colisiones entre turnos del mismo día
 */
router.post('/webhook/asignar-turno', async (req: Request, res: Response) => {
  try {
    console.log('📥 Webhook de asignación recibido:', req.body);

    // Validar datos (ahora usa id_turno en lugar de numero_turno + agencia_id)
    const asignarSchema = z.object({
      id_turno: z.number().int().positive('ID de turno es requerido'),
      modulo: z.string().min(1, 'Módulo es requerido'),
      asesor: z.string().min(1, 'Asesor es requerido'),
      // Campos opcionales para logging y compatibilidad
      numero_turno: z.string().optional(),
      agencia_id: z.number().int().positive().optional()
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

    const { id_turno, modulo, asesor, numero_turno, agencia_id } = validationResult.data;

    // Asignar turno usando el ID único
    const turnoAsignado = await TurnosQueries.asignarTurnoPorId(id_turno, modulo, asesor);

    if (!turnoAsignado) {
      // Si no se pudo asignar, verificar si el turno existe y por qué no se asignó
      const turnoExistente = await TurnosQueries.obtenerTurnoPorId(id_turno);

      if (!turnoExistente) {
        const response: ApiResponse = {
          success: false,
          message: `El turno con ID ${id_turno} no existe.`
        };
        return res.status(200).json(response);
      }

      // Si el turno existe pero no está pendiente, informar el estado actual
      if (turnoExistente.estado === 'llamado' && turnoExistente.asesor) {
        const response: ApiResponse = {
          success: false,
          message: `El turno ${turnoExistente.numero_turno} ya fue llamado por ${turnoExistente.asesor} en ${turnoExistente.modulo || 'módulo desconocido'}.`,
          data: {
            id_turno: turnoExistente.id,
            numero_turno: turnoExistente.numero_turno,
            estado: turnoExistente.estado,
            modulo: turnoExistente.modulo,
            asesor: turnoExistente.asesor,
            fecha_asignacion: turnoExistente.fecha_asignacion
          }
        };
        return res.status(200).json(response);
      }

      // Otros estados
      const response: ApiResponse = {
        success: false,
        message: `El turno ${turnoExistente.numero_turno} no está en estado pendiente. Estado actual: ${turnoExistente.estado}.`
      };
      return res.status(200).json(response);
    }

    console.log(`✅ Turno ID ${id_turno} (${turnoAsignado.numero_turno}) asignado a ${modulo} - ${asesor}`);

    // Enviar notificación de asignación al webhook de n8n
    const webhookResultado = await enviarAsignacionTurnoWebhook({
      id_turno: turnoAsignado.id,
      numero_turno: turnoAsignado.numero_turno,
      agencia_id: turnoAsignado.agencia_id,
      modulo: turnoAsignado.modulo || '',
      asesor: turnoAsignado.asesor || '',
      estado: turnoAsignado.estado,
      fecha_asignacion: turnoAsignado.fecha_asignacion || new Date()
    });

    if (webhookResultado.success) {
      console.log(`✅ Notificación de asignación enviada correctamente en ${webhookResultado.attempts} intento(s)`);
    } else {
      console.warn(`⚠️ No se pudo enviar la notificación de asignación: ${webhookResultado.message}`);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Turno asignado correctamente',
      data: {
        id_turno: turnoAsignado.id,
        numero_turno: turnoAsignado.numero_turno,
        agencia_id: turnoAsignado.agencia_id,
        modulo: turnoAsignado.modulo,
        asesor: turnoAsignado.asesor,
        estado: turnoAsignado.estado,
        fecha_asignacion: turnoAsignado.fecha_asignacion
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

/**
 * POST /api/webhook/finalizar-turno
 * Webhook para finalizar un turno después de ser atendido
 * Este endpoint es llamado por sistemas externos cuando un turno ha sido completamente atendido
 */
router.post('/webhook/finalizar-turno', async (req: Request, res: Response) => {
  try {
    console.log('📥 Webhook de finalización recibido:', req.body);

    // Validar datos
    const finalizarSchema = z.object({
      id_turno: z.number().int().positive('ID de turno es requerido'),
      observaciones: z.string().optional()
    });

    const validationResult = finalizarSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.error('❌ Validación fallida:', validationResult.error.errors);
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
      return res.status(400).json(response);
    }

    const { id_turno, observaciones } = validationResult.data;

    // Finalizar turno
    const turnoFinalizado = await TurnosQueries.finalizarTurno(id_turno, observaciones);

    if (!turnoFinalizado) {
      // Si no se pudo finalizar, verificar si el turno existe
      const turnoExistente = await TurnosQueries.obtenerTurnoPorId(id_turno);

      if (!turnoExistente) {
        const response: ApiResponse = {
          success: false,
          message: `El turno con ID ${id_turno} no existe.`
        };
        return res.status(200).json(response);
      }

      // Si el turno existe pero no está en estado 'llamado'
      const response: ApiResponse = {
        success: false,
        message: `El turno ${turnoExistente.numero_turno} no puede ser finalizado. Estado actual: ${turnoExistente.estado}.`
      };
      return res.status(200).json(response);
    }

    console.log(`✅ Turno ID ${id_turno} (${turnoFinalizado.numero_turno}) finalizado`);

    // Enviar notificación de finalización al webhook de n8n
    const webhookResultado = await enviarFinalizacionTurnoWebhook({
      id_turno: turnoFinalizado.id,
      numero_turno: turnoFinalizado.numero_turno,
      agencia_id: turnoFinalizado.agencia_id,
      modulo: turnoFinalizado.modulo || '',
      asesor: turnoFinalizado.asesor || '',
      estado: turnoFinalizado.estado,
      fecha_finalizacion: turnoFinalizado.updated_at,
      tiempo_atencion_minutos: turnoFinalizado.tiempo_atencion_minutos || 0,
      observaciones: turnoFinalizado.observaciones || undefined
    });

    if (webhookResultado.success) {
      console.log(`✅ Notificación de finalización enviada correctamente en ${webhookResultado.attempts} intento(s)`);
    } else {
      console.warn(`⚠️ No se pudo enviar notificación de finalización: ${webhookResultado.message}`);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Turno finalizado correctamente',
      data: {
        id_turno: turnoFinalizado.id,
        numero_turno: turnoFinalizado.numero_turno,
        agencia_id: turnoFinalizado.agencia_id,
        estado: turnoFinalizado.estado,
        fecha_finalizacion: turnoFinalizado.updated_at,
        tiempo_atencion_minutos: turnoFinalizado.tiempo_atencion_minutos
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error finalizando turno:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

/**
 * POST /api/webhook/cancelar-turno
 * Webhook para cancelar un turno cuando el cliente no se presenta
 * Este endpoint es llamado por sistemas externos cuando un cliente no acude a su cita
 */
router.post('/webhook/cancelar-turno', async (req: Request, res: Response) => {
  try {
    console.log('📥 Webhook de cancelación recibido:', req.body);

    // Validar datos
    const cancelarSchema = z.object({
      id_turno: z.number().int().positive('ID de turno es requerido'),
      motivo: z.string().optional()
    });

    const validationResult = cancelarSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.error('❌ Validación fallida:', validationResult.error.errors);
      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
      return res.status(400).json(response);
    }

    const { id_turno, motivo } = validationResult.data;

    // Cancelar turno
    const turnoCancelado = await TurnosQueries.cancelarTurno(id_turno, motivo);

    if (!turnoCancelado) {
      // Si no se pudo cancelar, verificar si el turno existe
      const turnoExistente = await TurnosQueries.obtenerTurnoPorId(id_turno);

      if (!turnoExistente) {
        const response: ApiResponse = {
          success: false,
          message: `El turno con ID ${id_turno} no existe.`
        };
        return res.status(200).json(response);
      }

      // Si el turno existe pero no está en estado válido para cancelar
      const response: ApiResponse = {
        success: false,
        message: `El turno ${turnoExistente.numero_turno} no puede ser cancelado. Estado actual: ${turnoExistente.estado}.`
      };
      return res.status(200).json(response);
    }

    console.log(`✅ Turno ID ${id_turno} (${turnoCancelado.numero_turno}) cancelado`);

    // Enviar notificación de cancelación al webhook de n8n
    const webhookResultado = await enviarCancelacionTurnoWebhook({
      id_turno: turnoCancelado.id,
      numero_turno: turnoCancelado.numero_turno,
      agencia_id: turnoCancelado.agencia_id,
      modulo: turnoCancelado.modulo || undefined,
      asesor: turnoCancelado.asesor || undefined,
      estado: turnoCancelado.estado,
      fecha_cancelacion: turnoCancelado.updated_at,
      motivo: turnoCancelado.observaciones || undefined
    });

    if (webhookResultado.success) {
      console.log(`✅ Notificación de cancelación enviada correctamente en ${webhookResultado.attempts} intento(s)`);
    } else {
      console.warn(`⚠️ No se pudo enviar notificación de cancelación: ${webhookResultado.message}`);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Turno cancelado correctamente',
      data: {
        id_turno: turnoCancelado.id,
        numero_turno: turnoCancelado.numero_turno,
        agencia_id: turnoCancelado.agencia_id,
        estado: turnoCancelado.estado,
        fecha_cancelacion: turnoCancelado.updated_at,
        motivo: turnoCancelado.observaciones
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error cancelando turno:', error);

    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };

    res.status(500).json(response);
  }
});

export default router;