import { query } from './database';
import { 
  Agencia, 
  Cliente, 
  Turno, 
  TurnoConDetalles,
  CrearClienteRequest,
  CrearAgenciaRequest,
  ActualizarAgenciaRequest,
  SolicitarTurnoRequest,
  QueryResult 
} from '../types';

/**
 * Consultas relacionadas con agencias
 */
export class AgenciasQueries {
  
  /**
   * Obtiene todas las agencias
   */
  static async obtenerTodas(): Promise<Agencia[]> {
    const result = await query(`
      SELECT id, nombre, codigo, direccion, telefono, email, 
             activa, created_at, updated_at
      FROM turnos_ia.agencias
      ORDER BY nombre ASC
    `);
    
    return result.rows;
  }

  /**
   * Obtiene agencias activas
   */
  static async obtenerActivas(): Promise<Agencia[]> {
    const result = await query(`
      SELECT id, nombre, codigo, direccion, telefono, email, 
             activa, created_at, updated_at
      FROM turnos_ia.agencias
      WHERE activa = true
      ORDER BY nombre ASC
    `);
    
    return result.rows;
  }

  /**
   * Obtiene una agencia por ID
   */
  static async obtenerPorId(id: number): Promise<Agencia | null> {
    const result = await query(`
      SELECT id, nombre, codigo, direccion, telefono, email, 
             activa, created_at, updated_at
      FROM turnos_ia.agencias
      WHERE id = $1
    `, [id]);
    
    return result.rows[0] || null;
  }

  /**
   * Crea una nueva agencia
   * El código se genera automáticamente como: iniciales del nombre + ID (ej: MA003)
   */
  static async crear(agencia: CrearAgenciaRequest): Promise<Agencia> {
    // Primero insertar con un código temporal
    const codigoTemporal = 'TEMP_' + Date.now();

    const result = await query(`
      INSERT INTO agencias (nombre, codigo, direccion, activa)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, codigo, direccion,
                activa,
                created_at, updated_at
    `, [
      agencia.nombre,
      codigoTemporal,
      agencia.direccion || '',
      agencia.activa ?? true
    ]);

    const nuevaAgencia = result.rows[0];

    // Generar código final: primeras 2 letras del nombre + ID con 3 dígitos
    // Ejemplo: "Manta" -> "MA003" (si ID es 3)
    const iniciales = agencia.nombre
      .substring(0, 2)
      .toUpperCase()
      .replace(/\s/g, '');
    const codigoFinal = iniciales + nuevaAgencia.id.toString().padStart(3, '0');

    // Actualizar con el código final
    const updateResult = await query(`
      UPDATE agencias
      SET codigo = $1
      WHERE id = $2
      RETURNING id, nombre, codigo, direccion,
                activa,
                created_at, updated_at
    `, [codigoFinal, nuevaAgencia.id]);

    console.log(`✅ Agencia creada con código: ${codigoFinal}`);

    return updateResult.rows[0];
  }

  /**
   * Actualiza una agencia
   */
  static async actualizar(id: number, cambios: ActualizarAgenciaRequest): Promise<Agencia | null> {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (cambios.nombre !== undefined) {
      campos.push(`nombre = $${contador++}`);
      valores.push(cambios.nombre);
    }
    if (cambios.direccion !== undefined) {
      campos.push(`direccion = $${contador++}`);
      valores.push(cambios.direccion);
    }
    if (cambios.activa !== undefined) {
      campos.push(`activa = $${contador++}`);
      valores.push(cambios.activa);
    }

    if (campos.length === 0) {
      return this.obtenerPorId(id);
    }

    campos.push(`updated_at = NOW()`);
    valores.push(id);

    const result = await query(`
      UPDATE agencias
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING id, nombre, codigo, direccion, telefono, email,
                activa,
                created_at, updated_at
    `, valores);
    
    return result.rows[0] || null;
  }

  /**
   * Elimina una agencia
   */
  static async eliminar(id: number): Promise<boolean> {
    const result = await query(`
      DELETE FROM agencias WHERE id = $1
    `, [id]);
    
    return result.rowCount > 0;
  }
}

/**
 * Consultas relacionadas con clientes
 */
export class ClientesQueries {

  /**
   * Obtiene un cliente por identificación
   */
  static async obtenerPorIdentificacion(identificacion: string): Promise<Cliente | null> {
    const result = await query(`
      SELECT id, nombres, apellidos, identificacion, celular, 
             email, fecha_nacimiento, agencia_id, activo,
             created_at, updated_at
      FROM turnos_ia.clientes
      WHERE identificacion = $1
    `, [identificacion]);
    
    return result.rows[0] || null;
  }

  /**
   * Crea un nuevo cliente
   */
  static async crear(cliente: CrearClienteRequest): Promise<Cliente> {
    // Si no se proporciona nombre, usar la identificación como nombre temporal
    const nombres = cliente.nombres || `Cliente-${cliente.identificacion}`;
    
    const result = await query(`
      INSERT INTO turnos_ia.clientes (nombres, identificacion, celular)
      VALUES ($1, $2, $3)
      RETURNING id, nombres, apellidos, identificacion, celular, 
                email, fecha_nacimiento, agencia_id, activo,
                created_at, updated_at
    `, [
      nombres,
      cliente.identificacion,
      cliente.celular
    ]);
    
    console.log('✅ Cliente creado en BD:', result.rows[0]);
    
    return result.rows[0];
  }

  /**
   * Actualiza un cliente existente
   */
  static async actualizar(id: number, cliente: Partial<CrearClienteRequest>): Promise<Cliente | null> {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (cliente.nombres !== undefined) {
      campos.push(`nombres = $${contador++}`);
      valores.push(cliente.nombres);
    }
    if (cliente.celular !== undefined) {
      campos.push(`celular = $${contador++}`);
      valores.push(cliente.celular);
    }

    if (campos.length === 0) {
      const result = await query(`
        SELECT id, nombres, apellidos, identificacion, celular, 
               email, fecha_nacimiento, agencia_id, activo,
               created_at, updated_at
        FROM turnos_ia.clientes WHERE id = $1
      `, [id]);
      return result.rows[0] || null;
    }

    campos.push(`updated_at = NOW()`);
    valores.push(id);

    const result = await query(`
      UPDATE turnos_ia.clientes 
      SET ${campos.join(', ')}
      WHERE id = $${contador}
      RETURNING id, nombres, apellidos, identificacion, celular, 
                email, fecha_nacimiento, agencia_id, activo,
                created_at, updated_at
    `, valores);
    
    console.log('✅ Cliente actualizado en BD:', result.rows[0]);
    
    return result.rows[0] || null;
  }
}

/**
 * Consultas relacionadas con turnos
 */
export class TurnosQueries {

  /**
   * Obtiene el estado de asignación de un turno por su número y agencia
   * Solo considera asignado si el estado es 'llamado' (no 'pendiente')
   * Esto evita que turnos antiguos ya procesados se detecten como recién asignados
   * IMPORTANTE: Debe filtrar por agencia_id para evitar colisiones con turnos del mismo número en otras agencias
   */
  static async obtenerEstadoAsignacion(numeroTurno: string, agenciaId: number): Promise<{
    asignado: boolean;
    modulo?: string;
    asesor?: string;
    fecha_asignacion?: Date;
  } | null> {
    const result = await query(`
      SELECT estado, modulo, asesor, fecha_asignacion
      FROM turnos_ia.turnos
      WHERE numero_turno = $1 AND agencia_id = $2
    `, [numeroTurno, agenciaId]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    
    // Solo está asignado si el estado es 'llamado' (ya no es 'pendiente')
    const asignado = row.estado === 'llamado';

    return {
      asignado,
      modulo: row.modulo || undefined,
      asesor: row.asesor || undefined,
      fecha_asignacion: row.fecha_asignacion || undefined
    };
  }

  /**
   * Asigna un turno a un módulo y asesor
   * Ahora requiere agencia_id para evitar colisiones entre agencias con mismo número de turno
   */
  static async asignarTurno(
    numeroTurno: string, 
    agenciaId: number,
    modulo: string, 
    asesor: string
  ): Promise<boolean> {
    const result = await query(`
      UPDATE turnos_ia.turnos
      SET modulo = $1,
          asesor = $2,
          estado = 'llamado',
          fecha_asignacion = NOW(),
          tiempo_espera_minutos = EXTRACT(EPOCH FROM (NOW() - created_at)) / 60,
          updated_at = NOW()
      WHERE numero_turno = $3
        AND agencia_id = $4
        AND estado = 'pendiente'
      RETURNING id, numero_turno, agencia_id, modulo, asesor, estado, fecha_asignacion, tiempo_espera_minutos, created_at
    `, [modulo, asesor, numeroTurno, agenciaId]);

    if (result.rows.length > 0) {
      console.log('✅ Turno asignado:', result.rows[0]);
      return true;
    }

    console.warn(`⚠️ No se encontró turno ${numeroTurno} para agencia ${agenciaId}`);
    return false;
  }

  /**
   * Asigna un turno a un módulo y asesor usando el ID único del turno
   * Esta es la forma recomendada para evitar colisiones entre turnos del mismo día
   * @param idTurno ID único del turno
   * @param modulo Nombre del módulo
   * @param asesor Nombre del asesor
   * @returns Datos del turno asignado o null si no se encontró
   */
  static async asignarTurnoPorId(
    idTurno: number,
    modulo: string,
    asesor: string
  ): Promise<Turno | null> {
    const result = await query(`
      UPDATE turnos_ia.turnos
      SET modulo = $1,
          asesor = $2,
          estado = 'llamado',
          fecha_asignacion = NOW(),
          tiempo_espera_minutos = EXTRACT(EPOCH FROM (NOW() - created_at)) / 60,
          updated_at = NOW()
      WHERE id = $3
        AND estado = 'pendiente'
      RETURNING id, cliente_id, agencia_id, numero_turno, fecha_hora,
                estado, prioridad, origen, modulo, asesor,
                fecha_asignacion, tiempo_espera_minutos, created_at, updated_at
    `, [modulo, asesor, idTurno]);

    if (result.rows.length > 0) {
      console.log('✅ Turno asignado por ID:', result.rows[0]);
      return result.rows[0];
    }

    console.warn(`⚠️ No se encontró turno con ID ${idTurno} en estado pendiente`);
    return null;
  }

  /**
   * Obtiene información de un turno por ID, incluyendo si ya fue asignado
   * @param idTurno ID del turno
   * @returns Información del turno o null si no existe
   */
  static async obtenerTurnoPorId(idTurno: number): Promise<Turno | null> {
    const result = await query(`
      SELECT id, cliente_id, agencia_id, numero_turno, fecha_hora,
             estado, prioridad, origen, modulo, asesor,
             fecha_asignacion, tiempo_espera_minutos, created_at, updated_at
      FROM turnos_ia.turnos
      WHERE id = $1
    `, [idTurno]);

    return result.rows[0] || null;
  }

  /**
   * Genera el siguiente número de turno para el día actual y agencia específica
   * Formato: T001 a T999 (por agencia, por día)
   */
  static async generarNumeroTurno(agenciaId: number): Promise<string> {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM turnos_ia.turnos
      WHERE DATE(created_at) = CURRENT_DATE
        AND agencia_id = $1
    `, [agenciaId]);
    
    const count = parseInt(result.rows[0].count) + 1;
    
    // Validar que no exceda 999 turnos por día por agencia
    if (count > 999) {
      throw new Error('Se ha alcanzado el límite máximo de 999 turnos por día para esta agencia');
    }
    
    const numero = `T${count.toString().padStart(3, '0')}`;
    
    console.log(`🔢 Número de turno generado para agencia ${agenciaId}: ${numero} (turnos hoy: ${result.rows[0].count})`);
    
    return numero;
  }

  /**
   * Crea un nuevo turno con datos del formulario
   * Fecha y hora se registran automáticamente al momento de crear el turno
   */
  static async crear(agenciaId: number, clienteId: number, nombreCliente: string, telefonoCliente: string): Promise<Turno> {
    const numeroTurno = await this.generarNumeroTurno(agenciaId);
    const fechaHoraActual = new Date();
    
    console.log('🔧 Insertando turno en BD:', {
      clienteId,
      agenciaId,
      numeroTurno,
      fechaHoraActual
    });
    
    const result = await query(`
      INSERT INTO turnos_ia.turnos (
        cliente_id, 
        agencia_id, 
        numero_turno, 
        fecha_hora, 
        estado, 
        prioridad, 
        origen
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, cliente_id, agencia_id, numero_turno, 
                fecha_hora, estado, prioridad, origen,
                created_at, updated_at
    `, [
      clienteId,
      agenciaId,
      numeroTurno,
      fechaHoraActual,
      'pendiente',
      'normal', // Prioridad como string según esquema
      'web' // Origen del turno
    ]);
    
    console.log('✅ Turno insertado en BD:', result.rows[0]);
    
    return result.rows[0];
  }

  /**
   * Obtiene un turno con detalles de cliente y agencia
   * NOTA: Función deshabilitada temporalmente - requiere actualización al nuevo esquema
   */
  /*
  static async obtenerConDetalles(id: number): Promise<TurnoConDetalles | null> {
    // TODO: Actualizar cuando se necesite con el nuevo esquema de base de datos
    return null;
  }
  */

  /**
   * Actualiza el código QR de un turno
   */
  static async actualizarCodigoQR(id: number, codigoQR: string): Promise<boolean> {
    const result = await query(`
      UPDATE turnos_ia.turnos 
      SET ubicacion_qr = $1, updated_at = NOW()
      WHERE id = $2
    `, [codigoQR, id]);
    
    return result.rowCount > 0;
  }

  /**
   * Marca un turno como WhatsApp enviado
   */
  static async marcarWhatsAppEnviado(id: number): Promise<boolean> {
    const result = await query(`
      UPDATE turnos 
      SET whatsapp_enviado = true, updated_at = NOW()
      WHERE id = $1
    `, [id]);
    
    return result.rowCount > 0;
  }

  /**
   * Obtiene turnos por agencia y fecha
   */
  static async obtenerPorAgenciaYFecha(agenciaId: number, fecha: Date): Promise<TurnoConDetalles[]> {
    const fechaStr = fecha.toISOString().split('T')[0];
    
    const result = await query(`
      SELECT 
        t.id, t.numero_turno, t.fecha_solicitud, t.fecha_cita, t.hora_cita,
        t.estado, t.motivo, t.observaciones, t.codigo_qr, t.whatsapp_enviado,
        t.created_at, t.updated_at,
        c.id as cliente_id, c.nombre as cliente_nombre, c.email as cliente_email,
        c.telefono as cliente_telefono, c.identificacion as cliente_identificacion,
        c.tipo_identificacion as cliente_tipo_identificacion,
        c.created_at as cliente_created_at, c.updated_at as cliente_updated_at,
        a.id as agencia_id, a.nombre as agencia_nombre, a.direccion as agencia_direccion,
        a.telefono as agencia_telefono, a.email as agencia_email, a.whatsapp as agencia_whatsapp,
        a.activa as agencia_activa, a.created_at as agencia_created_at, a.updated_at as agencia_updated_at
      FROM turnos t
      INNER JOIN clientes c ON t.cliente_id = c.id
      INNER JOIN agencias a ON t.agencia_id = a.id
      WHERE t.agencia_id = $1 AND DATE(t.fecha_cita) = $2
      ORDER BY t.hora_cita ASC
    `, [agenciaId, fechaStr]);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      cliente_id: row.cliente_id,
      agencia_id: row.agencia_id,
      numero_turno: row.numero_turno,
      fecha_solicitud: row.fecha_solicitud,
      fecha_cita: row.fecha_cita,
      hora_cita: row.hora_cita,
      estado: row.estado,
      motivo: row.motivo,
      observaciones: row.observaciones,
      codigo_qr: row.codigo_qr,
      whatsapp_enviado: row.whatsapp_enviado,
      created_at: row.created_at,
      updated_at: row.updated_at,
      cliente: {
        id: row.cliente_id,
        nombre: row.cliente_nombre,
        email: row.cliente_email,
        telefono: row.cliente_telefono,
        identificacion: row.cliente_identificacion,
        tipo_identificacion: row.cliente_tipo_identificacion,
        created_at: row.cliente_created_at,
        updated_at: row.cliente_updated_at
      },
      agencia: {
        id: row.agencia_id,
        nombre: row.agencia_nombre,
        direccion: row.agencia_direccion,
        telefono: row.agencia_telefono,
        email: row.agencia_email,
        whatsapp: row.agencia_whatsapp,
        activa: row.agencia_activa,
        created_at: row.agencia_created_at,
        updated_at: row.agencia_updated_at
      }
    }));
  }
}