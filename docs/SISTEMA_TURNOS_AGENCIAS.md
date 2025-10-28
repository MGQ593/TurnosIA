# 📍 Sistema de Turnos con Agencias Específicas

## 🎯 Descripción

El sistema ahora permite generar URLs únicas para cada agencia, donde el parámetro `id_agencia` determina a qué agencia pertenece el turno solicitado.

---

## 🔗 Formato de URL

```
http://localhost:3000/solicitar-turno.html?id_agencia=<ID>&access=<TOKEN>
```

### Parámetros:
- **`id_agencia`**: ID de la agencia (1, 2, 3, etc.)
- **`access`**: Token JWT de acceso (válido por 15 minutos)

---

## 🏢 Agencias Disponibles

Según el esquema `turnos_ia`, las agencias iniciales son:

| ID | Código | Nombre |
|----|--------|--------|
| 1 | AG001 | Agencia Principal |
| 2 | AG002 | Agencia Norte |
| 3 | AG003 | Agencia Sur |

---

## 🚀 Generar URL para una Agencia

### Opción 1: Script Automatizado

```bash
# Generar URL para Agencia Principal (ID 1)
node generar-url-agencia.js 1

# Generar URL para Agencia Norte (ID 2)
node generar-url-agencia.js 2

# Generar URL para Agencia Sur (ID 3)
node generar-url-agencia.js 3
```

**Salida:**
```
🎯 URL GENERADA CON AGENCIA

📍 Agencia ID: 1
⏰ Token válido por: 15 minutos

🌐 URL COMPLETA:
   http://localhost:3000/solicitar-turno.html?id_agencia=1&access=eyJhbGci...
```

### Opción 2: Manual

1. Generar token de acceso:
   ```bash
   node generar-url.js
   ```

2. Agregar parámetro `id_agencia` a la URL:
   ```
   http://localhost:3000/solicitar-turno.html?id_agencia=2&access=<TOKEN>
   ```

---

## 🎨 Interfaz de Usuario

Cuando el usuario accede a una URL con `id_agencia`:

1. **El sistema muestra el nombre de la agencia** en el encabezado del formulario:
   ```
   📍 Agencia Principal
   ```

2. **El turno se crea automáticamente** para esa agencia (no requiere selección manual)

3. **En los logs del servidor** se muestra:
   ```
   📍 Agencia seleccionada desde URL: 1
   ```

---

## 📝 Ejemplo Completo

### Paso 1: Generar URL
```bash
node generar-url-agencia.js 2
```

### Paso 2: Usuario accede a la URL
```
http://localhost:3000/solicitar-turno.html?id_agencia=2&access=eyJhbGci...
```

### Paso 3: Formulario muestra
```
┌─────────────────────────────────────────┐
│           🏢 ChevyPlan                  │
│         Turnos en línea                 │
│      Solicitar turno                    │
│                                         │
│    📍 Agencia Norte                     │
│                                         │
│  [ Número de celular   ]                │
│  [ Número de identificación ]           │
│  [✓] Autorizo tratamiento de datos     │
│                                         │
│      [ Solicitar turno ]                │
└─────────────────────────────────────────┘
```

### Paso 4: Usuario completa y envía
- Celular: 0991234567
- Identificación: 1234567890

### Paso 5: Sistema crea turno
```
📝 Solicitud de turno recibida
📍 Agencia seleccionada desde URL: 2
👤 Cliente: 1234567890
🔢 Número de turno generado: T001
✅ Turno creado para Agencia Norte
```

---

## 🔍 Verificación en Base de Datos

```sql
-- Ver turno creado con su agencia
SELECT 
    t.numero_turno,
    t.estado,
    a.nombre as agencia,
    c.identificacion,
    t.created_at
FROM turnos_ia.turnos t
JOIN turnos_ia.agencias a ON t.agencia_id = a.id
JOIN turnos_ia.clientes c ON t.cliente_id = c.id
ORDER BY t.created_at DESC
LIMIT 1;
```

**Resultado:**
```
 numero_turno | estado    | agencia        | identificacion | created_at
--------------+-----------+----------------+----------------+------------------
 T001         | pendiente | Agencia Norte  | 1234567890     | 2025-10-15 ...
```

---

## 💡 Casos de Uso

### 1. QR Codes por Agencia
Generar un código QR único para cada agencia con su URL específica.

### 2. Marketing Segmentado
Enviar URLs diferentes a clientes de diferentes agencias vía:
- Email
- WhatsApp
- SMS

### 3. Puntos de Atención Físicos
Colocar códigos QR en cada agencia física que apunten a su URL específica.

### 4. Reportes por Agencia
Filtrar turnos y estadísticas por agencia fácilmente.

---

## ⚙️ Configuración Técnica

### Frontend (`src/frontend/solicitar-turno.ts`)
```typescript
// Leer agencia_id de URL
const agenciaIdParam = obtenerParametroURL('id_agencia');
const agenciaId = agenciaIdParam ? parseInt(agenciaIdParam) : 1;

// Enviar en solicitud de turno
body: JSON.stringify({
    cliente: { ... },
    agencia_id: agenciaId
})
```

### Backend (`src/routes/api/turnos.ts`)
```typescript
// Endpoint para obtener info de agencia
GET /api/turnos/agencia/:id

// Retorna:
{
  success: true,
  data: {
    id: 2,
    nombre: "Agencia Norte",
    codigo: "AG002",
    ...
  }
}
```

### HTML (`public/solicitar-turno.html`)
```html
<div id="agenciaInfo" class="agencia-info">
    <span class="agencia-icon">📍</span>
    <span id="agenciaNombre"></span>
</div>
```

---

## 🛠️ Scripts Disponibles

| Script | Descripción | Ejemplo |
|--------|-------------|---------|
| `node start-with-url.js` | Inicia servidor + genera URL genérica | `node start-with-url.js` |
| `node generar-url.js` | Genera URL genérica (agencia por defecto: 1) | `node generar-url.js` |
| `node generar-url-agencia.js <id>` | Genera URL para agencia específica | `node generar-url-agencia.js 2` |

---

## 📊 Agregar Nuevas Agencias

### Opción 1: SQL Directo
```sql
INSERT INTO turnos_ia.agencias (codigo, nombre, direccion, telefono, email, activa)
VALUES ('AG004', 'Agencia Este', 'Av. Principal 123', '023456789', 'este@chevyplan.com', true);
```

### Opción 2: DBeaver
1. Abrir tabla `turnos_ia.agencias`
2. Agregar nuevo registro
3. Guardar cambios

### Obtener ID de la nueva agencia:
```sql
SELECT id, codigo, nombre FROM turnos_ia.agencias ORDER BY id DESC LIMIT 1;
```

### Generar URL para nueva agencia:
```bash
node generar-url-agencia.js 4
```

---

## ✅ Ventajas del Sistema

1. **🎯 Trazabilidad**: Cada turno sabe exactamente a qué agencia pertenece
2. **📊 Reportes**: Filtrar estadísticas por agencia
3. **🔗 URLs Únicas**: Cada agencia tiene su propio punto de entrada
4. **📱 UX Mejorada**: Usuario ve el nombre de la agencia automáticamente
5. **🔧 Escalable**: Fácil agregar nuevas agencias sin cambiar código

---

## 🔐 Seguridad

- ✅ Token JWT con expiración de 15 minutos
- ✅ Validación de ID de agencia en backend
- ✅ Verificación de existencia de agencia antes de crear turno
- ✅ Sin exposición de datos sensibles en URL

---

## 📝 Notas

- **Por defecto**: Si no se especifica `id_agencia`, se usa la agencia con ID 1
- **Validación**: El sistema valida que la agencia exista y esté activa
- **Logs**: Todos los accesos y creaciones de turno registran la agencia
- **Flexible**: El sistema soporta agregar ilimitadas agencias

---

**Última actualización**: 15 de Octubre de 2025  
**Estado**: ✅ Funcionalidad completa y probada
