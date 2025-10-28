# 🔧 Webhook de Asignación de Turno - Con Agencia ID

## 📋 Resumen

Se actualizó el webhook `/api/turnos/webhook/asignar-turno` para **requerir `agencia_id`** y evitar colisiones cuando múltiples agencias tienen el mismo número de turno (ej: T001, T002, T003).

## ⚠️ BREAKING CHANGE

**Antes:**
```json
{
  "numero_turno": "T003",
  "modulo": "Módulo 2",
  "asesor": "Juan Pérez"
}
```

**Ahora (REQUERIDO):**
```json
{
  "numero_turno": "T003",
  "agencia_id": 2,
  "modulo": "Módulo 2",
  "asesor": "Juan Pérez"
}
```

## 🎯 Problema Resuelto

### Escenario Anterior (Problemático)
- **Agencia 1** tiene turno T003
- **Agencia 2** tiene turno T003
- Al enviar webhook con solo `numero_turno: "T003"` → ❌ **Se asignaba el primer turno encontrado** (sin importar la agencia)

### Escenario Actual (Correcto)
- **Agencia 1** tiene turno T003
- **Agencia 2** tiene turno T003
- Al enviar webhook con `numero_turno: "T003"` y `agencia_id: 2` → ✅ **Se asigna el turno correcto de la Agencia 2**

## 📡 Endpoint

### POST `/api/turnos/webhook/asignar-turno`

Asigna un turno a un módulo y asesor específico.

#### Request Body
```json
{
  "numero_turno": "T003",      // String - Número del turno (ej: T001, T002)
  "agencia_id": 2,             // Number - ID de la agencia (REQUERIDO)
  "modulo": "Módulo 2",        // String - Nombre del módulo
  "asesor": "Juan Pérez"       // String - Nombre del asesor
}
```

#### Validaciones
- `numero_turno`: String, mínimo 1 carácter
- `agencia_id`: Number, entero positivo (REQUERIDO)
- `modulo`: String, mínimo 1 carácter
- `asesor`: String, mínimo 1 carácter

#### Response Success (200)
```json
{
  "success": true,
  "message": "Turno asignado correctamente",
  "data": {
    "numero_turno": "T003",
    "agencia_id": 2,
    "modulo": "Módulo 2",
    "asesor": "Juan Pérez",
    "fecha_asignacion": "2025-10-15T20:19:18.423Z"
  }
}
```

#### Response Error - No Encontrado (404)
```json
{
  "success": false,
  "message": "No se pudo asignar el turno. Verifique que el turno T003 existe en la agencia 2."
}
```

#### Response Error - Validación (400)
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "error": "agencia_id: ID de agencia es requerido"
}
```

## 🧪 Script de Prueba Actualizado

### Uso Anterior (Obsoleto)
```bash
node scripts/test-asignar-turno.js T003 "Módulo 2" "Juan Pérez"
```

### Uso Actual (REQUERIDO)
```bash
node scripts/test-asignar-turno.js <agencia_id> <numero_turno> <modulo> <asesor>
```

### Ejemplos
```bash
# Asignar turno T003 de Agencia 1
node scripts/test-asignar-turno.js 1 T003 "Módulo 2" "Juan Pérez"

# Asignar turno T003 de Agencia 2
node scripts/test-asignar-turno.js 2 T003 "Módulo 1" "María González"

# Asignar turno T005 de Agencia 3
node scripts/test-asignar-turno.js 3 T005 "Ventanilla 1" "Carlos Rodríguez"
```

## 🔄 Cambios en el Código

### 1. Base de Datos (`src/db/queries.ts`)

**Antes:**
```typescript
static async asignarTurno(
  numeroTurno: string, 
  modulo: string, 
  asesor: string
): Promise<boolean> {
  const result = await query(`
    UPDATE turnos_ia.turnos
    SET modulo = $1, asesor = $2, fecha_asignacion = NOW()
    WHERE numero_turno = $3
    RETURNING id, numero_turno, modulo, asesor, fecha_asignacion
  `, [modulo, asesor, numeroTurno]);
  // ...
}
```

**Ahora:**
```typescript
static async asignarTurno(
  numeroTurno: string, 
  agenciaId: number,
  modulo: string, 
  asesor: string
): Promise<boolean> {
  const result = await query(`
    UPDATE turnos_ia.turnos
    SET modulo = $1, asesor = $2, fecha_asignacion = NOW()
    WHERE numero_turno = $3
      AND agencia_id = $4  -- ✅ NUEVA CONDICIÓN
    RETURNING id, numero_turno, agencia_id, modulo, asesor, fecha_asignacion
  `, [modulo, asesor, numeroTurno, agenciaId]);
  // ...
}
```

### 2. Endpoint (`src/routes/api/turnos.ts`)

**Validación actualizada:**
```typescript
const asignarSchema = z.object({
  numero_turno: z.string().min(1, 'Número de turno es requerido'),
  agencia_id: z.number().int().positive('ID de agencia es requerido'), // ✅ NUEVO
  modulo: z.string().min(1, 'Módulo es requerido'),
  asesor: z.string().min(1, 'Asesor es requerido')
});
```

**Llamada actualizada:**
```typescript
const { numero_turno, agencia_id, modulo, asesor } = validationResult.data;
const asignado = await TurnosQueries.asignarTurno(
  numero_turno, 
  agencia_id,  // ✅ NUEVO PARÁMETRO
  modulo, 
  asesor
);
```

## 📊 Ejemplo de Integración con N8N

Si estás usando n8n para gestionar turnos, actualiza tu webhook HTTP Request:

```javascript
{
  "url": "http://localhost:3000/api/turnos/webhook/asignar-turno",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "numero_turno": "{{ $json.numero_turno }}",
    "agencia_id": {{ $json.agencia_id }},  // ✅ AGREGAR ESTE CAMPO
    "modulo": "{{ $json.modulo }}",
    "asesor": "{{ $json.asesor }}"
  }
}
```

## 🏢 IDs de Agencias

| ID | Nombre | Código |
|----|--------|--------|
| 1  | Agencia Principal | AGE001 |
| 2  | Agencia Norte | AGE002 |
| 3  | Agencia Sur | AGE003 |

## ⚡ Migración

### Para Sistemas Externos

1. **Identifica la agencia** del turno que quieres asignar
2. **Actualiza tus llamadas** al webhook para incluir `agencia_id`
3. **Prueba** con el script: `node scripts/test-asignar-turno.js <agencia_id> <turno> <modulo> <asesor>`

### Para Desarrolladores

1. Actualiza tus llamadas a `TurnosQueries.asignarTurno()` para incluir `agenciaId` como segundo parámetro
2. Recompila: `npm run build`
3. Reinicia el servidor

## 📝 Notas Importantes

- ✅ El sistema ahora **previene colisiones** entre agencias con mismo número de turno
- ✅ Si intentas asignar un turno con `agencia_id` incorrecto, recibirás error 404
- ✅ Los logs ahora muestran el `agencia_id` para mejor trazabilidad
- ⚠️ **BREAKING CHANGE**: Todas las integraciones existentes deben actualizarse

## 🔍 Logs de Ejemplo

**Éxito:**
```
📥 Webhook de asignación recibido: { numero_turno: 'T003', agencia_id: 2, modulo: 'Módulo 2', asesor: 'Juan Perez' }
✅ Turno asignado: { id: 16, numero_turno: 'T003', agencia_id: 2, modulo: 'Módulo 2', asesor: 'Juan Perez' }
✅ Turno T003 de agencia 2 asignado a Módulo 2 - Juan Perez
```

**Error (turno no existe para esa agencia):**
```
📥 Webhook de asignación recibido: { numero_turno: 'T999', agencia_id: 2, modulo: 'Módulo 2', asesor: 'Juan Perez' }
⚠️ No se encontró turno T999 para agencia 2
```

---

**Fecha de actualización:** 15 de Octubre, 2025  
**Versión:** 2.0.0  
**Breaking Change:** Sí
