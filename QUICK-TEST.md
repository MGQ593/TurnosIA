# Guía Rápida de Pruebas - Endpoints Nuevos

## 🚀 Inicio Rápido

### Opción 1: Pruebas Automáticas
```bash
# Iniciar el servidor
npm start

# En otra terminal, ejecutar tests
node scripts/test-endpoints.js
```

### Opción 2: Pruebas en Producción
```bash
# Ejecutar tests contra producción
TEST_URL=https://servicios-de-chat-turnosia.0hidyn.easypanel.host node scripts/test-endpoints.js
```

---

## 📋 Checklist Manual de QA

### ✅ Preparación
- [ ] Migración ejecutada: `node scripts/run-migration.js add-finalizacion-cancelacion-campos.sql`
- [ ] Build exitoso: `npm run build`
- [ ] Servidor corriendo: `npm start`
- [ ] Webhook URL configurada en .env

### ✅ Test 1: Finalizar Turno

**Pasos:**
1. Crear un turno nuevo (POST /api/turnos/solicitar)
2. Asignar el turno (POST /api/webhook/asignar-turno)
3. Finalizar el turno (POST /api/webhook/cancelar-turno)

**Comando de prueba:**
```bash
# Reemplaza {id_turno} con un ID real
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "id_turno": 123,
    "observaciones": "Cliente atendido correctamente"
  }'
```

**Verificar:**
- [ ] Status 200
- [ ] `success: true`
- [ ] `estado: "finalizado"`
- [ ] `tiempo_atencion_minutos` calculado (número > 0)
- [ ] Webhook enviado a n8n con `tipo_evento: "turno_finalizado"`
- [ ] Logs en consola muestran "✅ Turno finalizado"

### ✅ Test 2: Cancelar Turno

**Comando de prueba:**
```bash
# Reemplaza {id_turno} con un ID real
curl -X POST http://localhost:3000/api/webhook/cancelar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "id_turno": 124,
    "motivo": "Cliente no se presentó"
  }'
```

**Verificar:**
- [ ] Status 200
- [ ] `success: true`
- [ ] `estado: "cancelado"`
- [ ] `motivo` guardado en respuesta
- [ ] Webhook enviado a n8n con `tipo_evento: "turno_cancelado"`
- [ ] Logs en consola muestran "✅ Turno cancelado"

### ✅ Test 3: Casos de Error

**Test 3.1: Finalizar turno que no existe**
```bash
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{"id_turno": 99999999}'
```
**Esperado:** `success: false`, mensaje: "El turno con ID 99999999 no existe."

**Test 3.2: Finalizar turno en estado incorrecto**
```bash
# Intentar finalizar un turno 'pendiente'
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{"id_turno": {id_pendiente}}'
```
**Esperado:** `success: false`, mensaje: "...no puede ser finalizado. Estado actual: pendiente."

**Test 3.3: Campo requerido faltante**
```bash
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Esperado:** Status 400, `success: false`, error de validación

### ✅ Test 4: Webhooks en n8n

**Verificar en n8n:**
1. Ir a: https://chevyplan.app.n8n.cloud
2. Verificar que lleguen 4 tipos de eventos:
   - [ ] `turno_creado`
   - [ ] `turno_asignado`
   - [ ] `turno_finalizado` ⭐ NUEVO
   - [ ] `turno_cancelado` ⭐ NUEVO

3. Verificar payload de `turno_finalizado`:
   ```json
   {
     "tipo_evento": "turno_finalizado",
     "id_turno": 123,
     "numero_turno": "T001",
     "agencia_id": 2,
     "modulo": "Caja 1",
     "asesor": "María González",
     "estado": "finalizado",
     "fecha_finalizacion": "...",
     "tiempo_atencion_minutos": 5.5,
     "observaciones": "...",
     "timestamp": "..."
   }
   ```

4. Verificar payload de `turno_cancelado`:
   ```json
   {
     "tipo_evento": "turno_cancelado",
     "id_turno": 124,
     "numero_turno": "T002",
     "agencia_id": 2,
     "modulo": "Caja 1",
     "asesor": "María González",
     "estado": "cancelado",
     "fecha_cancelacion": "...",
     "motivo": "Cliente no se presentó",
     "timestamp": "..."
   }
   ```

### ✅ Test 5: Base de Datos

**Verificar columnas nuevas:**
```sql
SELECT
  numero_turno,
  estado,
  tiempo_espera_minutos,
  tiempo_atencion_minutos,
  observaciones,
  created_at,
  updated_at
FROM turnos_ia.turnos
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;
```

**Verificar:**
- [ ] `tiempo_atencion_minutos` tiene valores para turnos finalizados
- [ ] `observaciones` contiene texto para turnos finalizados/cancelados
- [ ] Estados incluyen 'finalizado' y 'cancelado'

---

## 🔍 Flujos Completos a Probar

### Flujo 1: Cliente Atendido (Happy Path)
```bash
# 1. Crear turno
TURNO=$(curl -s -X POST http://localhost:3000/api/turnos/solicitar \
  -H "Content-Type: application/json" \
  -d '{"cliente":{"identificacion":"1234567890","celular":"0987654321"},"agencia_id":2}' \
  | jq -r '.data.turno.id')

echo "Turno ID: $TURNO"

# 2. Asignar turno
curl -X POST http://localhost:3000/api/webhook/asignar-turno \
  -H "Content-Type: application/json" \
  -d "{\"id_turno\":$TURNO,\"modulo\":\"Caja 1\",\"asesor\":\"Test\"}"

# 3. Esperar 2 segundos
sleep 2

# 4. Finalizar turno
curl -X POST http://localhost:3000/api/webhook/finalizar-turno \
  -H "Content-Type: application/json" \
  -d "{\"id_turno\":$TURNO,\"observaciones\":\"Atendido correctamente\"}"
```

**Verificar:**
- [ ] 3 webhooks enviados (creado → asignado → finalizado)
- [ ] Tiempos calculados correctamente
- [ ] Estado final: 'finalizado'

### Flujo 2: Cliente No Se Presenta
```bash
# 1. Crear turno
TURNO=$(curl -s -X POST http://localhost:3000/api/turnos/solicitar \
  -H "Content-Type: application/json" \
  -d '{"cliente":{"identificacion":"9999999999","celular":"0999999999"},"agencia_id":2}' \
  | jq -r '.data.turno.id')

# 2. Asignar turno
curl -X POST http://localhost:3000/api/webhook/asignar-turno \
  -H "Content-Type: application/json" \
  -d "{\"id_turno\":$TURNO,\"modulo\":\"Caja 1\",\"asesor\":\"Test\"}"

# 3. Cancelar turno
curl -X POST http://localhost:3000/api/webhook/cancelar-turno \
  -H "Content-Type: application/json" \
  -d "{\"id_turno\":$TURNO,\"motivo\":\"No se presentó\"}"
```

**Verificar:**
- [ ] 3 webhooks enviados (creado → asignado → cancelado)
- [ ] Motivo guardado en observaciones
- [ ] Estado final: 'cancelado'

---

## 📊 Resultados Esperados

### Métricas de Éxito
- ✅ 100% de endpoints responden correctamente
- ✅ Todos los webhooks se envían exitosamente
- ✅ Validaciones funcionan en todos los casos
- ✅ Cálculos automáticos son precisos
- ✅ No hay errores en logs del servidor

### Logs del Servidor
Deberías ver estos logs durante las pruebas:

```
📥 Webhook de finalización recibido: { id_turno: 123, observaciones: '...' }
✅ Turno ID 123 (T001) finalizado
📤 Intento 1/3 - Enviando finalización de turno T001 al webhook n8n
✅ Finalización de turno T001 enviada exitosamente al webhook en intento 1
✅ Notificación de finalización enviada correctamente en 1 intento(s)
```

---

## 🐛 Troubleshooting

### Error: "column 'tiempo_atencion_minutos' does not exist"
**Solución:** Ejecutar migración
```bash
node scripts/run-migration.js add-finalizacion-cancelacion-campos.sql
```

### Error: Webhook fails (HTTP 404/500)
**Verificar:**
1. Variable `WEBHOOK_TURNOS_URL` en .env
2. n8n workflow está activo
3. URL es correcta: `https://chevyplan.app.n8n.cloud/webhook/turnos`

### Error: "El turno no puede ser finalizado"
**Causa:** Turno no está en estado 'llamado'
**Solución:** Asignar el turno primero con `/webhook/asignar-turno`

### Error: Connection refused
**Causa:** Servidor no está corriendo
**Solución:** `npm start` o verificar puerto 3000

---

## ✅ Checklist Final

Antes de considerar el QA completo:

- [ ] Todos los endpoints responden correctamente
- [ ] Webhooks se envían y llegan a n8n
- [ ] Cálculos de tiempo son precisos
- [ ] Validaciones funcionan
- [ ] Casos de error se manejan correctamente
- [ ] Logs son claros y útiles
- [ ] Migración de BD ejecutada en producción
- [ ] Documentación actualizada
- [ ] Tests automatizados funcionan

---

## 🚀 Despliegue a Producción

Una vez que el QA esté completo:

1. **Ejecutar migración en producción:**
   ```bash
   # Conectarse al servidor de producción
   ssh usuario@servidor

   # Ejecutar migración
   cd /ruta/turnos-app
   node scripts/run-migration.js add-finalizacion-cancelacion-campos.sql
   ```

2. **Hacer deploy del código:**
   ```bash
   git pull origin main
   npm install
   npm run build
   pm2 restart turnos-app
   ```

3. **Verificar en producción:**
   ```bash
   # Test rápido
   curl https://servicios-de-chat-turnosia.0hidyn.easypanel.host/api/turnos/agencias
   ```

4. **Monitorear logs:**
   ```bash
   pm2 logs turnos-app --lines 100
   ```

---

## 📞 Contacto

Si encuentras algún problema durante el QA, verifica:
- Logs del servidor
- Logs de n8n
- Estado de la base de datos
- Documentación en `QA-ENDPOINTS.md`
