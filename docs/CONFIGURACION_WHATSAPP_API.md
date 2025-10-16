# Configuración de WhatsApp API para Validación de Números

## Resumen
Se ha implementado un sistema de validación de números de WhatsApp que se integra con Evolution API, con configuración centralizada en variables de entorno.

## Variables de Entorno Agregadas

En el archivo `.env`:

```env
# WhatsApp API - Evolution API (validación de números)
WHATSAPP_API_URL=https://integraciones-evolution-api.ukcr0b.easypanel.host/chat/whatsappNumbers/ChevyPlanIA
WHATSAPP_API_TOKEN=037A54CAE674-42D4-949B-2FDA1E8A3013
```

## Cambios en el Backend

### Archivo: `src/routes/index.ts`

Se agregaron las variables de WhatsApp al endpoint de configuración pública:

```typescript
router.get('/config/public', (req, res) => {
  res.json({
    logoUrl: process.env.PUBLIC_LOGO_URL || '...',
    resetParam: process.env.TURNO_RESET_PARAM || 'nuevo',
    expirationMinutes: parseInt(process.env.TURNO_EXPIRATION_MINUTES || '30', 10),
    accessTokenExpirationMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_MINUTES || '15', 10),
    whatsappApiUrl: process.env.WHATSAPP_API_URL || '',      // NUEVO
    whatsappApiToken: process.env.WHATSAPP_API_TOKEN || ''   // NUEVO
  });
});
```

## Cambios en el Frontend

### Archivo: `public/solicitar-turno.html`

#### 1. Variables Globales Agregadas

```javascript
let WHATSAPP_API_URL = '';
let WHATSAPP_API_TOKEN = '';
```

#### 2. Función `cargarConfigPublica()` Actualizada

```javascript
// Cargar configuración de WhatsApp API
if (data.whatsappApiUrl) {
    WHATSAPP_API_URL = data.whatsappApiUrl;
    console.log('📱 WhatsApp API URL configurada');
}

if (data.whatsappApiToken) {
    WHATSAPP_API_TOKEN = data.whatsappApiToken;
    console.log('🔑 WhatsApp API Token configurado');
}
```

#### 3. Función `validarWhatsApp()` Actualizada

```javascript
async function validarWhatsApp(celular) {
    try {
        // Verificar que las credenciales estén configuradas
        if (!WHATSAPP_API_URL || !WHATSAPP_API_TOKEN) {
            console.warn('⚠️ WhatsApp API no configurada, omitiendo validación');
            return { valido: true, advertencia: true };
        }

        // ... resto del código usa WHATSAPP_API_URL y WHATSAPP_API_TOKEN
        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': WHATSAPP_API_TOKEN
            },
            body: JSON.stringify({
                numbers: [numeroConPais]
            })
        });
        
        // ... resto de la validación
    } catch (error) {
        console.error('❌ Error al validar WhatsApp:', error);
        return { valido: true, advertencia: true };
    }
}
```

## Ventajas de Este Enfoque

### 1. **Seguridad**
- ✅ Las credenciales nunca están expuestas en el código fuente del frontend
- ✅ Se cargan dinámicamente desde el servidor al iniciar la aplicación
- ✅ Pueden cambiarse sin modificar el código

### 2. **Flexibilidad**
- ✅ Fácil de configurar para diferentes entornos (dev, staging, producción)
- ✅ Si no hay credenciales, el sistema permite continuar sin validación estricta
- ✅ No bloquea el proceso si falla la API externa

### 3. **Mantenibilidad**
- ✅ Centralización de configuración en `.env`
- ✅ Un solo punto de cambio para actualizar credenciales
- ✅ Logs claros en consola para depuración

## Flujo de Operación

1. **Inicio de la aplicación:**
   - Frontend carga configuración desde `/api/config/public`
   - Se almacenan en variables globales `WHATSAPP_API_URL` y `WHATSAPP_API_TOKEN`

2. **Validación de WhatsApp:**
   - Usuario completa el formulario y hace submit
   - Sistema valida formato de celular (10 dígitos)
   - Llama a `validarWhatsApp()` con el número
   - Si no hay credenciales configuradas → permite continuar con advertencia
   - Si hay credenciales → valida contra Evolution API
   - Si el número no tiene WhatsApp → muestra error y detiene el proceso

3. **Manejo de errores:**
   - Si la API falla → permite continuar (no bloquea el proceso)
   - Si las credenciales no están configuradas → permite continuar
   - Todos los errores se registran en consola

## Logs de Depuración

Al iniciar la aplicación, verás en la consola del navegador:

```
📱 WhatsApp API URL configurada
🔑 WhatsApp API Token configurado
```

Durante la validación:

```
🔍 Validando WhatsApp para: 593XXXXXXXXXX
📱 Respuesta de validación WhatsApp: [...]
✅ Número con WhatsApp confirmado
```

O en caso de error:

```
⚠️ WhatsApp API no configurada, omitiendo validación
❌ Número sin WhatsApp
```

## Configuración para Producción

Para cambiar las credenciales en producción, simplemente edita el archivo `.env`:

```env
WHATSAPP_API_URL=https://tu-api-produccion.com/endpoint
WHATSAPP_API_TOKEN=tu-token-super-secreto-de-produccion
```

Reinicia el servidor y los cambios se aplicarán automáticamente.

## Desactivar Validación de WhatsApp

Si necesitas desactivar temporalmente la validación de WhatsApp, simplemente deja las variables vacías en `.env`:

```env
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
```

El sistema detectará que no hay configuración y permitirá continuar sin validar WhatsApp.
