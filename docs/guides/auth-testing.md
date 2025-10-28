# 🔐 Pruebas del Sistema de Autenticación Admin

## Fecha: 14 de octubre de 2025

## Descripción General
Sistema de tres capas de seguridad implementado para controlar el acceso al formulario de turnos:
1. **Autenticación Admin** → Login con usuario/contraseña
2. **Generador de QR** → Creación de códigos QR con tokens de acceso
3. **Validación de Acceso** → Verificación de token antes de mostrar formulario

---

## ✅ Componentes Implementados

### 1. Backend - Autenticación Admin
**Archivo:** `src/routes/api/token.ts`

#### Endpoints Creados:
- ✅ `POST /api/token/admin/login` - Login de administrador
- ✅ `POST /api/token/admin/verificar-sesion` - Verificar sesión activa
- ✅ `GET /api/token/generar-acceso` - Generar token de acceso (15 min)
- ✅ `GET /api/token/verificar-acceso/:token` - Verificar token de acceso

**Utilidades JWT:** `src/utils/jwtUtils.ts`
- ✅ `generarTokenSesion()` - Token de sesión (1 hora)
- ✅ `verificarTokenSesion()` - Validar sesión admin
- ✅ `generarTokenAcceso()` - Token de acceso al formulario (15 min)
- ✅ `verificarTokenAcceso()` - Validar acceso al formulario

### 2. Frontend - Páginas de Admin
**Archivos Creados:**
- ✅ `public/admin-login.html` (426 líneas) - Página de login
- ✅ `public/admin-qr-generator.html` (600+ líneas) - Generador de QR

**Rutas en:** `src/app.ts`
- ✅ `/admin-login` - Acceso a página de login
- ✅ `/admin-qr-generator` - Acceso al generador de QR

### 3. Validación en Formulario
**Archivo:** `public/solicitar-turno.html`
- ✅ Función `verificarAcceso()` - Valida token en URL
- ✅ Bloqueo automático sin token válido
- ✅ Mensaje de "Acceso Restringido"

---

## 🧪 Plan de Pruebas

### PRUEBA 1: Acceso Directo Bloqueado
**Objetivo:** Verificar que no se puede acceder directamente al formulario

1. Abrir navegador en modo incógnito
2. Navegar a: `http://localhost:3000/solicitar`
3. **Resultado Esperado:** ❌ Mensaje "Acceso Restringido" con icono de candado 🔒

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 2: Login Admin - Credenciales Correctas
**Objetivo:** Verificar login exitoso

1. Abrir: `http://localhost:3000/admin-login`
2. Ingresar credenciales:
   - Usuario: `admin_chevyplan`
   - Contraseña: `ChevyPlan2025!Secure`
3. Click en "Iniciar Sesión"
4. **Resultado Esperado:** ✅ Redirección a `/admin-qr-generator`

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 3: Login Admin - Credenciales Incorrectas
**Objetivo:** Verificar rechazo de credenciales inválidas

1. Abrir: `http://localhost:3000/admin-login`
2. Ingresar credenciales incorrectas:
   - Usuario: `admin`
   - Contraseña: `wrong_password`
3. Click en "Iniciar Sesión"
4. **Resultado Esperado:** ❌ Mensaje de error "Usuario o contraseña incorrectos"

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 4: Generación de QR
**Objetivo:** Verificar que se genera correctamente el código QR

1. Login exitoso como admin
2. En página `/admin-qr-generator`:
   - Verificar que se muestra el código QR automáticamente
   - Verificar contador de expiración (15:00)
   - Verificar estadísticas (QR Generados: 1)
3. **Resultado Esperado:** ✅ QR visible con countdown activo

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 5: Countdown de Expiración
**Objetivo:** Verificar que el countdown funciona correctamente

1. Generar QR en panel admin
2. Observar el contador de expiración
3. Esperar 1 minuto
4. **Resultado Esperado:** ✅ Contador debe mostrar 14:00 después de 1 minuto

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 6: Descarga de QR
**Objetivo:** Verificar descarga de imagen QR

1. En panel admin con QR generado
2. Click en botón "💾 Descargar QR"
3. **Resultado Esperado:** ✅ Descarga archivo PNG con nombre `qr-turno-chevyplan-[timestamp].png`

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 7: Generar Nuevo QR
**Objetivo:** Verificar regeneración de QR

1. En panel admin
2. Click en "🔄 Generar Nuevo QR"
3. Verificar:
   - QR se actualiza
   - Contador reinicia a 15:00
   - Estadística "QR Generados" incrementa
4. **Resultado Esperado:** ✅ Nuevo QR con contador reiniciado

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 8: Escaneo de QR - Acceso Válido
**Objetivo:** Verificar que el QR permite acceso al formulario

1. Generar QR en panel admin
2. Copiar URL del QR (debería ser: `http://localhost:3000/solicitar?access=[TOKEN]`)
3. Abrir URL en nueva ventana/incógnito
4. **Resultado Esperado:** ✅ Formulario de turnos visible y funcional

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 9: Token Expirado
**Objetivo:** Verificar bloqueo con token expirado

**NOTA:** Para prueba rápida, cambiar `ACCESS_TOKEN_EXPIRATION_MINUTES=15` a `ACCESS_TOKEN_EXPIRATION_MINUTES=1` en `.env`

1. Cambiar expiración a 1 minuto en `.env`
2. Reiniciar servidor
3. Generar QR
4. Copiar URL
5. Esperar 2 minutos
6. Abrir URL copiada
7. **Resultado Esperado:** ❌ Mensaje "Acceso Restringido"

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 10: Manipulación de Token
**Objetivo:** Verificar que no se puede manipular el token en la URL

1. Obtener URL válida: `http://localhost:3000/solicitar?access=TOKEN_VALIDO`
2. Modificar algunos caracteres del token en la URL
3. Abrir URL modificada
4. **Resultado Esperado:** ❌ Mensaje "Acceso Restringido"

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 11: Sesión Admin - Persistencia
**Objetivo:** Verificar que la sesión persiste en pestañas

1. Login como admin
2. Abrir nueva pestaña
3. Navegar a `/admin-qr-generator`
4. **Resultado Esperado:** ✅ Acceso directo sin login (sesión activa)

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 12: Logout Admin
**Objetivo:** Verificar cierre de sesión

1. Login como admin
2. En panel de QR, click en "🚪 Cerrar Sesión"
3. Confirmar cierre
4. Intentar acceder nuevamente a `/admin-qr-generator`
5. **Resultado Esperado:** ✅ Redirección automática a `/admin-login`

**Estado:** ⏳ PENDIENTE

---

### PRUEBA 13: Flujo Completo - Happy Path
**Objetivo:** Verificar todo el flujo de principio a fin

1. **Admin Login**
   - Acceder a `/admin-login`
   - Login con credenciales correctas
   
2. **Generar QR**
   - Generar código QR
   - Descargar QR (opcional)
   
3. **Cliente Escanea QR**
   - Copiar URL del QR
   - Abrir en navegador/incógnito
   
4. **Solicitar Turno**
   - Llenar formulario
   - Cedula: 1234567890
   - Celular: 0987654321
   - Aceptar términos
   - Enviar
   
5. **Confirmación**
   - Verificar redirección a `/confirmacion?token=[TOKEN]`
   - Ver número de turno (formato T001-T999)
   - Verificar mensaje de confirmación

**Estado:** ⏳ PENDIENTE

---

## 📊 Variables de Entorno Relevantes

```env
# Seguridad JWT
JWT_SECRET=TU_CLAVE_SECRETA_SUPER_SEGURA_CAMBIAME_EN_PRODUCCION_12345

# Tiempo de expiración de turnos (para testing: 1 min)
TURNO_EXPIRATION_MINUTES=1

# Tiempo de expiración de access tokens
ACCESS_TOKEN_EXPIRATION_MINUTES=15

# Credenciales de administrador
ADMIN_USERNAME=admin_chevyplan
ADMIN_PASSWORD=ChevyPlan2025!Secure
```

---

## 🔧 Comandos Útiles

### Iniciar Servidor
```bash
npm run dev
```

### Verificar Puerto 3000
```bash
netstat -ano | findstr ":3000.*LISTENING"
```

### Detener Todos los Procesos Node
```bash
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Ver Variables de Entorno
```bash
Get-Content .env | Select-Object -Last 15
```

---

## 📱 URLs del Sistema

| Página | URL | Requiere Auth |
|--------|-----|---------------|
| Home | http://localhost:3000 | No |
| Login Admin | http://localhost:3000/admin-login | No |
| Generador QR | http://localhost:3000/admin-qr-generator | Sí (Sesión) |
| Formulario | http://localhost:3000/solicitar?access=[TOKEN] | Sí (Token) |
| Confirmación | http://localhost:3000/confirmacion?token=[TOKEN] | Sí (Token) |

---

## 🎯 Resultados Esperados

### ✅ Seguridad Implementada:
- [x] Bloqueo de acceso directo al formulario
- [x] Login admin con credenciales en .env
- [x] Tokens JWT con expiración configurable
- [x] Sesiones persistentes en sessionStorage
- [x] Validación de tokens en cada request
- [x] Mensajes claros de acceso denegado

### 🔐 Protecciones Activas:
- [x] No se puede acceder a `/solicitar` sin token válido
- [x] No se puede manipular tokens (firma digital JWT)
- [x] Tokens expiran automáticamente
- [x] Sesiones admin expiran después de 1 hora
- [x] Credenciales sensibles en variables de entorno
- [x] Logout limpia sesión completamente

---

## 📝 Notas de Implementación

### Tokens de Sesión Admin
- **Duración:** 1 hora
- **Almacenamiento:** sessionStorage (se borra al cerrar navegador)
- **Verificación:** Cada carga de página admin

### Tokens de Acceso al Formulario
- **Duración:** 15 minutos (configurable)
- **Uso único:** No reutilizable después de expiración
- **Transmisión:** Parámetro URL `?access=TOKEN`

### Tokens de Confirmación de Turno
- **Duración:** 30 minutos (o según TURNO_EXPIRATION_MINUTES)
- **Uso:** Prevenir manipulación de número de turno
- **Transmisión:** Parámetro URL `?token=TOKEN`

---

## 🚀 Próximos Pasos

1. ⏳ Ejecutar todas las pruebas listadas arriba
2. ⏳ Documentar resultados de cada prueba
3. ⏳ Corregir cualquier problema encontrado
4. ⏳ Pruebas de carga (múltiples QR simultáneos)
5. ⏳ Pruebas de seguridad (penetration testing)
6. ⏳ Actualizar documentación para producción

---

**Actualizado:** 14 de octubre de 2025  
**Versión:** 1.0  
**Estado:** Sistema completo, pendiente de testing
