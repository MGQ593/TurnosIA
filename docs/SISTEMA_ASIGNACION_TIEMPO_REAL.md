# Sistema de Asignación de Turnos en Tiempo Real

**Fecha**: 15 de octubre de 2025  
**Versión**: 1.0.0

## 📋 Descripción General

Sistema de polling que permite notificar en tiempo real a los clientes cuando su turno ha sido asignado a un módulo específico y un asesor. La página de confirmación consulta automáticamente cada 5 segundos el estado del turno y muestra la información de asignación tan pronto como esté disponible.

---

## 🎯 Flujo Completo

```
1. Cliente solicita turno
   ↓
2. Sistema genera turno T001 → Envía a n8n (webhook actual)
   ↓
3. Cliente ve página confirmación con T001
   ↓
4. [Polling cada 5 segundos - consultando estado]
   ↓
5. Asesor llama al turno T001 desde su sistema
   ↓
6. Sistema externo envía webhook a /api/webhook/asignar-turno
   {
     "numero_turno": "T001",
     "modulo": "Módulo 3",
     "asesor": "Juan Pérez"
   }
   ↓
7. Base de datos actualizada con asignación
   ↓
8. Siguiente consulta de polling detecta cambio
   ↓
9. Página muestra: "Módulo 3 - Juan Pérez"
   ↓
10. Redirige INMEDIATAMENTE a "Sesión finalizada"
```

---

## 🔌 Endpoints de la API

### 1. Consultar Estado de Asignación (Usado por Polling)

**Endpoint**: `GET /api/turnos/estado/:numero`

**Descripción**: Consulta si un turno ha sido asignado a un módulo y asesor.

**Parámetros**:
- `numero` (path): Número del turno (ej: T001, T042)

**Respuesta Exitosa** (200 OK):
```json
{
  "success": true,
  "data": {
    "asignado": true,
    "modulo": "Módulo 3",
    "asesor": "Juan Pérez",
    "fecha_asignacion": "2025-10-15T18:45:23.456Z"
  }
}
```

**Respuesta Sin Asignar** (200 OK):
```json
{
  "success": true,
  "data": {
    "asignado": false
  }
}
```

**Respuesta Turno No Existe** (404 Not Found):
```json
{
  "success": false,
  "message": "Turno no encontrado"
}
```

---

### 2. Asignar Turno (Webhook desde Sistema Externo)

**Endpoint**: `POST /api/webhook/asignar-turno`

**Descripción**: Asigna un turno a un módulo y asesor específico. Este endpoint debe ser llamado por el sistema externo cuando un asesor está listo para atender al cliente.

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "numero_turno": "T001",
  "modulo": "Módulo 3",
  "asesor": "Juan Pérez"
}
```

**Campos**:
- `numero_turno` (string, requerido): Número del turno a asignar
- `modulo` (string, requerido): Nombre o número del módulo de atención
- `asesor` (string, requerido): Nombre completo del asesor que atenderá

**Respuesta Exitosa** (200 OK):
```json
{
  "success": true,
  "message": "Turno asignado correctamente",
  "data": {
    "numero_turno": "T001",
    "modulo": "Módulo 3",
    "asesor": "Juan Pérez",
    "fecha_asignacion": "2025-10-15T18:45:23.456Z"
  }
}
```

**Respuesta Error - Validación** (400 Bad Request):
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "error": "numero_turno: String must contain at least 1 character(s)"
}
```

**Respuesta Error - Turno No Existe** (404 Not Found):
```json
{
  "success": false,
  "message": "No se pudo asignar el turno. Verifique que el número de turno existe."
}
```

---

## 💾 Base de Datos

### Columnas Agregadas a `turnos_ia.turnos`

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `modulo` | VARCHAR(100) | YES | Módulo donde será atendido (ej: "Módulo 1", "Ventanilla 3") |
| `asesor` | VARCHAR(150) | YES | Nombre del asesor que atenderá (ej: "Juan Pérez") |
| `fecha_asignacion` | TIMESTAMP | YES | Fecha y hora cuando se asignó el turno |

### Índices Creados

1. **idx_turnos_numero_turno**: Búsqueda rápida por número de turno
2. **idx_turnos_asignados**: Filtrado eficiente de turnos asignados

---

## 🔄 Funcionamiento del Polling

### Frontend (confirmacion.ts)

El cliente ejecuta polling automático cada 5 segundos:

```typescript
// Cada 5 segundos consulta el estado
setInterval(async () => {
  const response = await fetch(`/api/turnos/estado/${numeroTurno}`);
  const data = await response.json();
  
  if (data.success && data.data?.asignado) {
    // Detener polling
    clearInterval(intervalo);
    
    // Mostrar módulo y asesor
    mostrarAsignacion(data.data.modulo, data.data.asesor);
    
    // Redirigir inmediatamente a sesión finalizada
    setTimeout(() => {
      mostrarSesionFinalizada();
    }, 0);
  }
}, 5000);
```

### Características del Polling

- **Intervalo**: 5 segundos
- **Detención**: Se detiene automáticamente al detectar asignación
- **Redirección**: Inmediata (0 segundos) después de mostrar info
- **Manejo de errores**: Continúa ejecutándose incluso si hay errores de red

---

## 🧪 Cómo Probar la Implementación

### Opción 1: Usando cURL

```bash
# 1. Crear un turno (por la web o API)
# Supongamos que obtuviste el turno T004

# 2. Simular asignación desde sistema externo
curl -X POST http://localhost:3000/api/webhook/asignar-turno \
  -H "Content-Type: application/json" \
  -d '{
    "numero_turno": "T004",
    "modulo": "Módulo 2",
    "asesor": "María González"
  }'
```

### Opción 2: Usando PowerShell

```powershell
# Asignar turno T004
$body = @{
    numero_turno = "T004"
    modulo = "Módulo 2"
    asesor = "María González"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/webhook/asignar-turno" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Opción 3: Usando n8n

1. Crear un workflow en n8n
2. Agregar nodo HTTP Request:
   - **Method**: POST
   - **URL**: `https://tu-servidor.com/api/webhook/asignar-turno`
   - **Body**: JSON
   ```json
   {
     "numero_turno": "{{ $json.turno_id }}",
     "modulo": "{{ $json.modulo }}",
     "asesor": "{{ $json.asesor }}"
   }
   ```

### Opción 4: Script de Prueba Automatizado

```javascript
// test-asignacion.js
const fetch = require('node-fetch');

async function probarAsignacion() {
  const turno = 'T004'; // Cambiar por un turno real
  
  console.log(`🧪 Probando asignación para turno ${turno}...`);
  
  const response = await fetch('http://localhost:3000/api/webhook/asignar-turno', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numero_turno: turno,
      modulo: 'Módulo 2',
      asesor: 'María González'
    })
  });
  
  const data = await response.json();
  console.log('📊 Respuesta:', data);
  
  if (data.success) {
    console.log('✅ Asignación exitosa!');
    console.log(`📍 ${data.data.modulo}`);
    console.log(`👤 ${data.data.asesor}`);
  } else {
    console.log('❌ Error:', data.message);
  }
}

probarAsignacion();
```

---

## 📱 Experiencia del Usuario

### Paso 1: Página de Confirmación Inicial
```
┌─────────────────────────────┐
│   ✓                         │
│   ¡Turno Confirmado!        │
│                             │
│   Número de Turno           │
│   ━━━━━━━━━━━               │
│        T004                 │
│   ━━━━━━━━━━━               │
│                             │
│   Esperando asignación...   │
└─────────────────────────────┘
```

### Paso 2: Después de Asignación
```
┌─────────────────────────────┐
│   ✓                         │
│   ¡Turno Confirmado!        │
│                             │
│   Número de Turno           │
│   ━━━━━━━━━━━               │
│        T004                 │
│   ━━━━━━━━━━━               │
│                             │
│   🏢 Información de Atención│
│   📍 Módulo: Módulo 2       │
│   👤 Asesor: María González │
└─────────────────────────────┘

[Redirige inmediatamente]
```

### Paso 3: Sesión Finalizada
```
┌─────────────────────────────┐
│                             │
│   Sesión Finalizada         │
│                             │
│   Gracias por usar          │
│   nuestro servicio          │
│                             │
└─────────────────────────────┘
```

---

## 🔧 Integración con Sistemas Externos

### Caso de Uso 1: Sistema de Gestión de Colas

Cuando un asesor marca un turno como "En Atención":

```javascript
// En el sistema de colas
function atenderTurno(numeroTurno, moduloId, asesorId) {
  // 1. Obtener datos del módulo y asesor
  const modulo = obtenerModulo(moduloId); // ej: "Módulo 3"
  const asesor = obtenerAsesor(asesorId); // ej: "Juan Pérez"
  
  // 2. Enviar webhook al sistema de turnos
  await fetch('https://turnos.miempresa.com/api/webhook/asignar-turno', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numero_turno: numeroTurno,
      modulo: modulo.nombre,
      asesor: asesor.nombreCompleto
    })
  });
}
```

### Caso de Uso 2: Pantallas de TV

El sistema puede mostrar en pantallas:

```javascript
// Consultar turnos asignados recientemente
async function obtenerTurnosAsignados() {
  const turnos = await db.query(`
    SELECT numero_turno, modulo, asesor, fecha_asignacion
    FROM turnos_ia.turnos
    WHERE fecha_asignacion >= NOW() - INTERVAL '1 hour'
      AND modulo IS NOT NULL
    ORDER BY fecha_asignacion DESC
    LIMIT 10
  `);
  
  return turnos;
}
```

### Caso de Uso 3: Aplicación Móvil de Asesores

```javascript
// App móvil del asesor
function llamarSiguienteTurno() {
  const siguienteTurno = obtenerSiguienteTurnoEnCola();
  const miModulo = obtenerMiModulo(); // "Módulo 2"
  const miNombre = obtenerMiNombre(); // "María González"
  
  // Notificar al cliente
  await asignarTurnoAPI(siguienteTurno, miModulo, miNombre);
  
  // Actualizar pantalla del asesor
  mostrarClienteEnPantalla(siguienteTurno);
}
```

---

## ⚡ Performance y Consideraciones

### Polling vs WebSocket

**¿Por qué Polling?**
- ✅ **Simplicidad**: No requiere librerías adicionales
- ✅ **Compatibilidad**: Funciona en todos los navegadores
- ✅ **Carga aceptable**: 5 segundos es suficiente para este caso
- ✅ **Mantenibilidad**: Fácil de debuggear y mantener

**Carga estimada**:
- 1 cliente consultando: 12 requests/minuto
- 10 clientes simultáneos: 120 requests/minuto
- 100 clientes simultáneos: 1,200 requests/minuto (~20 requests/segundo)

### Optimizaciones Implementadas

1. **Índices en base de datos**: Búsqueda rápida por número de turno
2. **Polling se detiene**: Al detectar asignación para reducir carga
3. **Query eficiente**: Solo consulta las columnas necesarias
4. **Conexión pool**: Reutilización de conexiones de BD

---

## 🐛 Troubleshooting

### Problema: Polling no detecta asignación

**Síntomas**: Cliente no ve módulo/asesor después de asignar

**Solución**:
```bash
# 1. Verificar que la asignación se guardó en BD
SELECT numero_turno, modulo, asesor, fecha_asignacion 
FROM turnos_ia.turnos 
WHERE numero_turno = 'T004';

# 2. Verificar endpoint manualmente
curl http://localhost:3000/api/turnos/estado/T004

# 3. Revisar logs del navegador (F12 → Console)
```

### Problema: Webhook retorna 404

**Síntomas**: `"message": "No se pudo asignar el turno"`

**Solución**:
```bash
# Verificar que el turno existe
SELECT * FROM turnos_ia.turnos WHERE numero_turno = 'T004';

# Verificar formato del número de turno
# Debe ser exactamente como está en BD (mayúsculas, con ceros)
```

### Problema: Frontend no hace polling

**Síntomas**: No se ve actividad en Network tab del navegador

**Solución**:
1. Verificar que `confirmacion.js` se cargó correctamente
2. Revisar errores en consola del navegador
3. Verificar que el token del turno es válido

---

## 📊 Logs y Monitoreo

### Backend Logs

```bash
# Al iniciar polling (no visible en backend, solo frontend)

# Al recibir webhook de asignación:
📥 Webhook de asignación recibido: { numero_turno: 'T004', ... }
✅ Turno asignado: { id: 8, numero_turno: 'T004', modulo: 'Módulo 2', ... }
✅ Turno T004 asignado a Módulo 2 - María González
```

### Frontend Logs (Console del Navegador)

```javascript
🔄 Iniciando polling para turno: T004
🔍 Consultando estado del turno T004...
🔍 Consultando estado del turno T004...
✅ Turno asignado: { asignado: true, modulo: 'Módulo 2', asesor: 'María González' }
📍 Mostrando asignación: Módulo 2 - María González
```

---

## 🚀 Próximos Pasos y Mejoras

### Opcional: Notificación de Audio

```javascript
// Reproducir sonido cuando se asigne
function mostrarAsignacion(modulo, asesor) {
  // ... código actual ...
  
  // Agregar sonido
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
}
```

### Opcional: Vibración en móviles

```javascript
// Vibrar dispositivo móvil
if ('vibrate' in navigator) {
  navigator.vibrate([200, 100, 200]);
}
```

### Opcional: WebSocket para Futuro

Si la carga crece significativamente, considerar migrar a WebSocket:
- Socket.IO para implementación simple
- Actualización instantánea sin polling
- Reducción de carga en servidor

---

## 📄 Archivos Modificados

- ✅ `migrations/add-asignacion-turno.sql` - Migración de BD
- ✅ `src/db/queries.ts` - Queries para asignación
- ✅ `src/types/index.ts` - Tipos TypeScript
- ✅ `src/routes/api/turnos.ts` - Nuevos endpoints
- ✅ `src/frontend/confirmacion.ts` - Lógica de polling
- ✅ `public/confirmacion.html` - UI de asignación
- ✅ `scripts/ejecutar-migracion-asignacion.js` - Script de migración

---

## 📞 Soporte

Para problemas o preguntas sobre esta implementación, contacta al equipo de desarrollo.

**Última actualización**: 15 de octubre de 2025
