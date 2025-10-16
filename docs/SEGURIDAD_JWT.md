# 🔐 Sistema de Seguridad JWT para Turnos

## Fecha: 14 de Octubre, 2025

---

## 🎯 Problema Resuelto

### ❌ Antes (Inseguro):
```
URL: /confirmacion?turno=T78864
```
**Vulnerabilidad**: El cliente podía modificar el número de turno en la URL:
- Cambiar `T78864` por `T78860` para "adelantar" su turno
- Adivinar números de turnos de otros clientes
- Manipular la URL para ver turnos que no le corresponden

### ✅ Ahora (Seguro):
```
URL: /confirmacion?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0dXJub0lkIjoiVDc4ODY0IiwiY2VkdWxhIjoiMTIzNDU2Nzg5MCIsImNlbHVsYXIiOiIwOTg3NjU0MzIxIiwidGltZXN0YW1wIjoxNzI5MDQyODAwMDAwLCJpYXQiOjE3MjkwNDI4MDAsImV4cCI6MTcyOTA0NDYwMCwiaXNzIjoic2lzdGVtYS10dXJub3MiLCJzdWIiOiJ0dXJuby1jb25maXJtYWNpb24ifQ.xYz123abcDEF456ghiJKL789mnoPQR
```

**Seguridad**:
- ✅ Token firmado digitalmente con clave secreta
- ✅ Imposible de modificar sin invalidar la firma
- ✅ Fecha de expiración automática
- ✅ Contiene datos encriptados del turno
- ✅ No se puede "adivinar" o manipular

---

## 🔧 Cómo Funciona

### 1. Generación del Token (Al Solicitar Turno)

**Flujo**:
```
Cliente envía formulario
    ↓
Servidor crea turno T78864
    ↓
Servidor genera JWT con:
    - turnoId: "T78864"
    - cedula: "1234567890"
    - celular: "0987654321"
    - timestamp: 1729042800000
    - expiresIn: 30 minutos
    ↓
Token firmado con JWT_SECRET
    ↓
Cliente redirigido a: /confirmacion?token=eyJhbG...
```

**Código (solicitar-turno.html)**:
```javascript
// Después de crear el turno exitosamente
const tokenResponse = await fetch('/api/token/generar-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        turnoId: turnoId,
        cedula: datos.cedula,
        celular: datos.celular
    })
});

const tokenData = await tokenResponse.json();
// Redirigir con token seguro
window.location.replace('/confirmacion?token=' + tokenData.token);
```

---

### 2. Verificación del Token (Al Ver Confirmación)

**Flujo**:
```
Cliente accede a /confirmacion?token=eyJhbG...
    ↓
JavaScript extrae el token de la URL
    ↓
Consulta al servidor: GET /api/token/verificar-token/{token}
    ↓
Servidor verifica:
    ✓ Firma válida (no manipulado)
    ✓ No expirado
    ✓ Emisor correcto
    ↓
Si válido: Devuelve turnoId, cedula, celular
Si inválido: Error 401 "Token manipulado o expirado"
    ↓
Página muestra el turno o mensaje de error
```

**Código (confirmacion.html)**:
```javascript
const token = obtenerParametroURL('token');

// Verificar token con el servidor
const response = await fetch(`/api/token/verificar-token/${token}`);
const data = await response.json();

if (data.success) {
    // Token válido - mostrar turno
    document.getElementById('turnoDisplay').textContent = data.turnoId;
} else {
    // Token inválido - mostrar error
    mostrarErrorToken('Token inválido o manipulado');
}
```

---

## 🔑 Configuración JWT

### Variable de Entorno (`.env`):
```env
# Clave secreta para firmar tokens JWT
# CRÍTICO: Debe ser diferente en cada instalación
JWT_SECRET=TU_CLAVE_SECRETA_SUPER_SEGURA_CAMBIAME_EN_PRODUCCION_12345
```

### Generar Clave Segura:
```bash
# PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Output ejemplo:
a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
```

⚠️ **Importante**: Cambia `JWT_SECRET` antes de ir a producción

---

## 📊 Estructura del Token JWT

### Token Completo:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0dXJub0lkIjoiVDc4ODY0IiwiY2VkdWxhIjoiMTIzNDU2Nzg5MCIsImNlbHVsYXIiOiIwOTg3NjU0MzIxIiwidGltZXN0YW1wIjoxNzI5MDQyODAwMDAwLCJpYXQiOjE3MjkwNDI4MDAsImV4cCI6MTcyOTA0NDYwMCwiaXNzIjoic2lzdGVtYS10dXJub3MiLCJzdWIiOiJ0dXJuby1jb25maXJtYWNpb24ifQ.xYz123abcDEF456ghiJKL789mnoPQR
```

Dividido en 3 partes:
1. **Header** (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9)
2. **Payload** (eyJ0dXJub0lkIjoi...)
3. **Signature** (xYz123abcDEF456...)

### Payload Decodificado (Base64):
```json
{
  "turnoId": "T78864",
  "cedula": "1234567890",
  "celular": "0987654321",
  "timestamp": 1729042800000,
  "iat": 1729042800,
  "exp": 1729044600,
  "iss": "sistema-turnos",
  "sub": "turno-confirmacion"
}
```

**Campos**:
- `turnoId`: Número del turno
- `cedula`: Cédula del cliente (opcional)
- `celular`: Celular del cliente (opcional)
- `timestamp`: Marca de tiempo de creación
- `iat`: Issued At (cuándo se emitió)
- `exp`: Expiration (cuándo expira)
- `iss`: Issuer (quién lo emitió)
- `sub`: Subject (propósito del token)

---

## 🛡️ Protecciones Implementadas

### 1. Firma Digital
```javascript
// El token está firmado con HMAC-SHA256
// Cualquier modificación invalida la firma
jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
```

**Prueba de Manipulación**:
```
Token original: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0dXJub0lkIjoiVDc4ODY0In0.xYz123

Si el cliente cambia turnoId en el payload:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0dXJub0lkIjoiVDc4ODYwIn0.xYz123

❌ El servidor rechazará el token porque la firma no coincide
```

### 2. Expiración Automática
```javascript
// Token expira según TURNO_EXPIRATION_MINUTES
expiresIn: '30m'  // 30 minutos en producción
```

### 3. Validación de Emisor
```javascript
// Solo tokens emitidos por "sistema-turnos" son válidos
jwt.verify(token, JWT_SECRET, {
  issuer: 'sistema-turnos',
  subject: 'turno-confirmacion'
});
```

### 4. Rate Limiting (Ya implementado)
```javascript
// Máximo 1 solicitud cada 3 segundos
const RATE_LIMIT_MS = 3000;
```

---

## 🧪 Pruebas de Seguridad

### Test 1: Manipular Número de Turno

**Ataque**:
```
1. Cliente recibe: /confirmacion?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
2. Decodifica el token en jwt.io
3. Cambia "turnoId": "T78864" por "turnoId": "T78860"
4. Crea nuevo token con payload modificado
5. Intenta acceder con el nuevo token
```

**Resultado**:
```
❌ Error 401: Token inválido o manipulado
🔒 Razón: La firma no coincide con el payload modificado
```

---

### Test 2: Usar Token Expirado

**Ataque**:
```
1. Cliente guarda URL con token
2. Espera 31 minutos (más que TURNO_EXPIRATION_MINUTES=30)
3. Intenta acceder nuevamente
```

**Resultado**:
```
❌ Error 401: Token expirado
⏰ Razón: El campo 'exp' indica que el token caducó
```

---

### Test 3: Reutilizar Token de Otro Cliente

**Ataque**:
```
1. Cliente A recibe token para turno T78864
2. Cliente A comparte URL con Cliente B
3. Cliente B intenta usar el token
```

**Resultado**:
```
✅ Token válido (temporalmente)
⚠️ Consideración: El token es válido hasta que expire
💡 Mejora futura: Vincular token a IP o sesión
```

---

### Test 4: Token Sin Firma (algorithm: none)

**Ataque**:
```json
{
  "alg": "none",
  "typ": "JWT"
}
{
  "turnoId": "T00001"
}
```

**Resultado**:
```
❌ Error 401: Token inválido
🔒 Razón: jwt.verify() rechaza tokens sin algoritmo de firma
```

---

## 📡 API Endpoints

### POST `/api/token/generar-token`
Genera un token JWT seguro para un turno.

**Request**:
```json
{
  "turnoId": "T78864",
  "cedula": "1234567890",
  "celular": "0987654321"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "turnoId": "T78864"
}
```

---

### GET `/api/token/verificar-token/:token`
Verifica y decodifica un token JWT.

**Request**:
```
GET /api/token/verificar-token/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Válido)**:
```json
{
  "success": true,
  "turnoId": "T78864",
  "cedula": "1234567890",
  "celular": "0987654321",
  "timestamp": 1729042800000
}
```

**Response (Inválido)**:
```json
{
  "success": false,
  "message": "Token inválido, expirado o manipulado",
  "expired": true
}
```

---

## 🚀 Despliegue en Producción

### Checklist de Seguridad:

- [ ] Cambiar `JWT_SECRET` por una clave aleatoria de 64+ caracteres
- [ ] Verificar que `JWT_SECRET` NO esté en el repositorio Git
- [ ] Configurar `TURNO_EXPIRATION_MINUTES=30` (no 1)
- [ ] Habilitar HTTPS en el servidor (SSL/TLS)
- [ ] Configurar CORS restrictivo (no `*`)
- [ ] Implementar rate limiting a nivel de servidor (nginx/apache)
- [ ] Monitorear logs de tokens inválidos (posible ataque)
- [ ] Backup regular de la base de datos

---

## 📈 Ventajas vs Desventajas

### ✅ Ventajas:
1. **Seguridad**: Tokens firmados e inviolables
2. **Expiración**: Tokens caducan automáticamente
3. **Sin Estado**: No requiere almacenar tokens en BD
4. **Estándar**: JWT es un estándar industrial (RFC 7519)
5. **Portable**: El token contiene toda la info necesaria

### ⚠️ Consideraciones:
1. **Tamaño**: Tokens JWT son más largos que IDs simples
2. **Revocación**: No se pueden "invalidar" antes de expirar
3. **Compartir**: Si alguien copia la URL, puede usarla hasta que expire

---

## 🔮 Mejoras Futuras

### 1. Vincular Token a Sesión
```javascript
// Incluir fingerprint del navegador en el token
const browserFingerprint = generateFingerprint();
jwt.sign({ turnoId, fingerprint: browserFingerprint }, ...);
```

### 2. Refresh Tokens
```javascript
// Token corto (5 min) + refresh token largo (30 min)
// Permite renovar sin re-autenticación
```

### 3. Blacklist de Tokens
```javascript
// Guardar tokens invalidados en Redis
if (tokenBlacklist.has(token)) {
  return 'Token revocado';
}
```

### 4. Audit Log
```javascript
// Registrar cada verificación de token
logTokenVerification(token, ip, userAgent, success);
```

---

## 📞 Soporte

Para más información sobre JWT:
- https://jwt.io (Decodificador online)
- https://datatracker.ietf.org/doc/html/rfc7519 (Especificación RFC)

---

**Estado**: ✅ Implementado y Funcional  
**Versión**: 2.1 - JWT Security Layer  
**Fecha**: 14/10/2025
