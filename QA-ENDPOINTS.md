# QA - Endpoints del Sistema de Turnos

## Resumen de Cambios Implementados

### Nuevos Endpoints
1. **POST /api/webhook/finalizar-turno** - Finaliza un turno después de ser atendido
2. **POST /api/webhook/cancelar-turno** - Cancela un turno cuando el cliente no se presenta

### Modificaciones en Base de Datos
- Agregadas columnas: `tiempo_atencion_minutos`, `observaciones`
- Nuevo estado en enum: `'finalizado'`

### Webhooks Implementados
- `tipo_evento: 'turno_finalizado'` - Notifica cuando se finaliza un turno
- `tipo_evento: 'turno_cancelado'` - Notifica cuando se cancela un turno

---

## Plan de Pruebas

### 1. GET /api/turnos/agencias
**Objetivo:** Verificar que retorna lista de agencias activas

**Request:**
```bash
curl -X GET http://localhost:3000/api/turnos/agencias
```

**Respuesta Esperada:**
- Status: 200
- Body: Array de agencias con `id`, `nombre`, `codigo`

**Casos de Prueba:**
- ✅ Retorna solo agencias activas
- ✅ Incluye código generado automáticamente (formato: XX999)

---

### 2. POST /api/turnos/solicitar
**Objetivo:** Crear un nuevo turno y enviar webhook

**Request:**
```bash
curl -X POST http://localhost:3000/api/turnos/solicitar \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {
      "identificacion": "1234567890",
      "celular": "0987654321"
    },
    "agencia_id": 2
  }'
```

**Respuesta Esperada:**
- Status: 200
- Body: Turno creado con QR
- Webhook enviado: `tipo_evento: 'turno_creado'`

**Casos de Prueba:**
- ✅ Crea turno correctamente
- ✅ Genera número de turno único por agencia/día
- ✅ Genera código QR
- ✅ Envía webhook a n8n
- ⚠️ Valida campos requeridos
- ⚠️ Previene duplicados en mismo día

---

### 3. GET /api/turnos/estado/:numero_turno
**Objetivo:** Consultar estado actual de un turno

**Request:**
```bash
curl -X GET "http://localhost:3000/api/turnos/estado/T001?agenciaId=2"
```

**Respuesta Esperada:**
- Status: 200
- Body: Estado del turno (pendiente/llamado/finalizado/cancelado)

**Casos de Prueba:**
- ✅ Retorna estado correcto
- ✅ Filtra por fecha actual (CURRENT_DATE)
- ✅ Filtra por agencia_id
- ⚠️ Retorna 404 si no existe
- ⚠️ No retorna turnos de días anteriores

---

### 4. POST /api/webhook/asignar-turno
**Objetivo:** Asignar turno a módulo/asesor y enviar webhook

**Request:**
```bash
curl -X POST http://localhost:3000/api/webhook/asignar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "id_turno": 123,
    "modulo": "Caja 1",
    "asesor": "María González"
  }'
```

**Respuesta Esperada:**
- Status: 200
- Body: Confirmación de asignación
- Estado cambia a: `'llamado'`
- Webhook enviado: `tipo_evento: 'turno_asignado'`

**Casos de Prueba:**
- ✅ Asigna turno correctamente
- ✅ Calcula `tiempo_espera_minutos`
- ✅ Registra `fecha_asignacion`
- ✅ Envía webhook con módulo y asesor
- ⚠️ Solo asigna turnos en estado 'pendiente'
- ⚠️ Valida que id_turno exista
- ⚠️ Valida campos requeridos

---

### 5. POST /api/webhook/finalizar-turno ⭐ NUEVO
**Objetivo:** Finalizar un turno atendido y enviar webhook

**Request:**
```bash
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "id_turno": 123,
    "observaciones": "Cliente atendido satisfactoriamente"
  }'
```

**Respuesta Esperada:**
- Status: 200
- Body: Turno finalizado con `tiempo_atencion_minutos` calculado
- Estado cambia a: `'finalizado'`
- Webhook enviado: `tipo_evento: 'turno_finalizado'`

**Casos de Prueba:**
- ✅ Finaliza turno correctamente
- ✅ Calcula `tiempo_atencion_minutos` automáticamente
- ✅ Guarda observaciones
- ✅ Envía webhook con tiempo de atención
- ⚠️ Solo finaliza turnos en estado 'llamado'
- ⚠️ Valida que id_turno exista
- ⚠️ Observaciones es opcional
- ❌ Error si turno no existe
- ❌ Error si turno no está en 'llamado'

**Payload del Webhook:**
```json
{
  "tipo_evento": "turno_finalizado",
  "id_turno": 123,
  "numero_turno": "T001",
  "agencia_id": 2,
  "modulo": "Caja 1",
  "asesor": "María González",
  "estado": "finalizado",
  "fecha_finalizacion": "2025-11-12T10:30:00.000Z",
  "tiempo_atencion_minutos": 5.5,
  "observaciones": "Cliente atendido satisfactoriamente",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

---

### 6. POST /api/webhook/cancelar-turno ⭐ NUEVO
**Objetivo:** Cancelar turno cuando cliente no se presenta

**Request:**
```bash
curl -X POST http://localhost:3000/api/webhook/cancelar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "id_turno": 123,
    "motivo": "Cliente no se presentó a la cita"
  }'
```

**Respuesta Esperada:**
- Status: 200
- Body: Turno cancelado
- Estado cambia a: `'cancelado'`
- Webhook enviado: `tipo_evento: 'turno_cancelado'`

**Casos de Prueba:**
- ✅ Cancela turno correctamente
- ✅ Guarda motivo en observaciones
- ✅ Envía webhook con motivo
- ⚠️ Cancela turnos en estado 'pendiente' o 'llamado'
- ⚠️ Valida que id_turno exista
- ⚠️ Motivo es opcional
- ❌ Error si turno no existe
- ❌ Error si turno ya está 'finalizado' o 'cancelado'

**Payload del Webhook:**
```json
{
  "tipo_evento": "turno_cancelado",
  "id_turno": 123,
  "numero_turno": "T001",
  "agencia_id": 2,
  "modulo": "Caja 1",
  "asesor": "María González",
  "estado": "cancelado",
  "fecha_cancelacion": "2025-11-12T10:30:00.000Z",
  "motivo": "Cliente no se presentó a la cita",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

---

## Flujo Completo de un Turno (Happy Path)

### Escenario 1: Turno Atendido Exitosamente

1. **Cliente solicita turno**
   ```
   POST /api/turnos/solicitar
   → Estado: 'pendiente'
   → Webhook: tipo_evento: 'turno_creado'
   ```

2. **Sistema asigna turno a módulo**
   ```
   POST /api/webhook/asignar-turno
   → Estado: 'llamado'
   → Webhook: tipo_evento: 'turno_asignado'
   → Calcula: tiempo_espera_minutos
   ```

3. **Cliente es atendido**
   ```
   POST /api/webhook/finalizar-turno
   → Estado: 'finalizado'
   → Webhook: tipo_evento: 'turno_finalizado'
   → Calcula: tiempo_atencion_minutos
   ```

### Escenario 2: Cliente No Se Presenta

1. **Cliente solicita turno**
   ```
   POST /api/turnos/solicitar
   → Estado: 'pendiente'
   ```

2. **Sistema asigna turno a módulo**
   ```
   POST /api/webhook/asignar-turno
   → Estado: 'llamado'
   ```

3. **Cliente no se presenta**
   ```
   POST /api/webhook/cancelar-turno
   → Estado: 'cancelado'
   → Webhook: tipo_evento: 'turno_cancelado'
   ```

### Escenario 3: Cancelación Antes de Asignar

1. **Cliente solicita turno**
   ```
   POST /api/turnos/solicitar
   → Estado: 'pendiente'
   ```

2. **Cliente cancela antes de ser llamado**
   ```
   POST /api/webhook/cancelar-turno
   → Estado: 'cancelado'
   → Webhook: tipo_evento: 'turno_cancelado'
   → modulo y asesor: null (no fue asignado)
   ```

---

## Casos de Error a Probar

### Error 1: ID de turno no existe
```bash
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{"id_turno": 99999}'
```
**Esperado:**
- Status: 200
- Message: "El turno con ID 99999 no existe."

### Error 2: Turno no está en estado válido
```bash
# Intentar finalizar un turno 'pendiente'
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{"id_turno": 123}'
```
**Esperado:**
- Status: 200
- Message: "El turno T001 no puede ser finalizado. Estado actual: pendiente."

### Error 3: Intentar cancelar turno ya finalizado
```bash
curl -X POST http://localhost:3000/api/webhook/cancelar-turno \
  -H "Content-Type: application/json" \
  -d '{"id_turno": 123}'
```
**Esperado:**
- Status: 200
- Message: "El turno T001 no puede ser cancelado. Estado actual: finalizado."

### Error 4: Validación de campos
```bash
# Falta id_turno
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Esperado:**
- Status: 400
- Message: "Datos de entrada inválidos"

---

## Verificación de Webhooks

### Configuración
- URL: `https://chevyplan.app.n8n.cloud/webhook/turnos`
- Variable: `WEBHOOK_TURNOS_URL` en .env

### Tipos de Eventos
1. `turno_creado` - Creación de turno
2. `turno_asignado` - Asignación a módulo/asesor
3. `turno_finalizado` - Finalización de atención ⭐ NUEVO
4. `turno_cancelado` - Cancelación por inasistencia ⭐ NUEVO

### Reintentos
- Máximo 3 intentos
- Backoff exponencial: 1s, 2s, 3s
- Timeout: 10 segundos por intento

---

## Migración de Base de Datos

### Script de Migración
```bash
node scripts/run-migration.js add-finalizacion-cancelacion-campos.sql
```

### Columnas Agregadas
- `tiempo_atencion_minutos DECIMAL(10, 2)` - Tiempo de atención calculado
- `observaciones TEXT` - Motivos/notas

### Verificación
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'turnos_ia'
  AND table_name = 'turnos'
  AND column_name IN ('tiempo_atencion_minutos', 'observaciones');
```

---

## Checklist Final de QA

### Funcionalidad
- [ ] Todos los endpoints responden correctamente
- [ ] Validaciones funcionan (campos requeridos, tipos)
- [ ] Estados de turno cambian correctamente
- [ ] Cálculos automáticos son precisos
- [ ] Webhooks se envían en todos los casos

### Base de Datos
- [ ] Migración ejecutada correctamente
- [ ] Columnas existen con tipos correctos
- [ ] Datos se guardan correctamente
- [ ] Queries filtran por fecha actual

### Webhooks
- [ ] 4 tipos de eventos funcionan
- [ ] Reintentos funcionan correctamente
- [ ] Payloads contienen todos los datos
- [ ] Logs son claros y útiles

### Seguridad
- [ ] Validación de inputs con Zod
- [ ] No hay SQL injection
- [ ] Manejo correcto de errores
- [ ] No se exponen datos sensibles

### Performance
- [ ] Queries optimizadas (índices, filtros)
- [ ] Timeout de webhooks configurado
- [ ] Sin memory leaks
- [ ] Compilación exitosa

---

## Comandos Útiles

### Desarrollo
```bash
npm run dev          # Iniciar servidor en desarrollo
npm run build        # Compilar TypeScript
npm start            # Iniciar servidor compilado
```

### Base de Datos
```bash
# Ejecutar migración
node scripts/run-migration.js <archivo.sql>

# Ver estructura de tabla
node -e "require('dotenv').config(); const {Pool}=require('pg'); const p=new Pool({host:process.env.DB_HOST,port:process.env.DB_PORT,database:process.env.DB_NAME,user:process.env.DB_USER,password:process.env.DB_PASSWORD}); p.query('SELECT * FROM turnos_ia.turnos LIMIT 5').then(r=>{console.table(r.rows);p.end()})"
```

### Git
```bash
git status           # Ver cambios
git log --oneline -5 # Ver últimos commits
git diff             # Ver diferencias
```

---

## Notas Finales

### Commits Relacionados
- `a7edde0` - feat: Agregar endpoint para finalizar turnos
- `d8f882c` - feat: Agregar endpoint para cancelar turnos
- `0af7339` - fix: Agregar columnas faltantes en BD

### Archivos Modificados
- `src/db/queries.ts` - Funciones finalizarTurno() y cancelarTurno()
- `src/routes/api/turnos.ts` - Endpoints de finalización y cancelación
- `src/services/webhookService.ts` - Webhooks de finalización y cancelación
- `src/types/index.ts` - Interfaces actualizadas
- `database/migrations/add-finalizacion-cancelacion-campos.sql` - Migración BD
- `scripts/run-migration.js` - Script de migración

### Próximos Pasos Sugeridos
1. Probar todos los endpoints en producción
2. Monitorear logs de webhooks en n8n
3. Verificar que todos los tipos de evento sean procesados
4. Configurar alertas si webhooks fallan
5. Documentar en Postman/Swagger
