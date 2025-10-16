# 🎫 Sistema de Turnos con QR - Documentación

## 📋 Descripción General

Sistema de turnos con doble factor de seguridad que previene solicitudes múltiples indiscriminadas mediante:
1. **Expiración temporal** (configurable, por defecto 30 minutos)
2. **Parámetro URL especial** para permitir nuevos turnos

## 🔐 Cómo Funciona

### Flujo Normal (Cliente)

```
1. Cliente escanea QR público
   URL: http://localhost:3000
   
2. Llena formulario y solicita turno
   → Genera turno: T840327
   
3. Turno se guarda en navegador (localStorage)
   → Bloqueado por 30 minutos
   
4. Cliente intenta escanear QR otra vez
   → Ve su turno anterior (NO puede solicitar otro)
   
5. Recarga página o escanea QR
   → Sigue viendo el mismo turno
```

### Flujo con Reset (Staff/Admin)

```
1. Han pasado 30+ minutos desde el turno anterior
   
2. Staff escanea QR especial o ingresa URL:
   http://localhost:3000/?nuevo=true
   
3. Sistema valida:
   ✅ ¿Han pasado 30 minutos? SÍ
   → Limpia turno anterior
   → Permite solicitar nuevo turno
   
4. Si NO han pasado 30 minutos:
   ❌ Muestra mensaje: "Debe esperar X minutos más"
   → Mantiene turno anterior visible
```

## 🎨 Generación de QR Codes

### QR Público (Para clientes en la oficina)
```
URL: http://tu-dominio.com
```
- Genera este QR y colócalo en la oficina
- Los clientes lo escanean para solicitar turnos
- NO permite resetear antes de tiempo
- **🔒 Cierre automático**: La ventana se cerrará después de 30 minutos

### QR Privado (Para staff)
```
URL: http://tu-dominio.com/?nuevo=true
```
- Genera este QR y guárdalo en privado
- Solo para uso del staff cuando sea necesario
- Permite resetear turnos después de expiración

## ⚙️ Configuración

### Variables de Entorno

En tu archivo `.env`:

```bash
# Valor del parámetro para resetear turnos
# IMPORTANTE: Cambia 'nuevo' por un valor secreto
TURNO_RESET_PARAM=nuevo

# Tiempo de expiración en minutos
TURNO_EXPIRATION_MINUTES=30
```

### Cambiar el Parámetro Secreto

Para mayor seguridad, cambia el valor:

```bash
# En .env
TURNO_RESET_PARAM=MiClaveSecreta2025

# La URL especial ahora será:
http://localhost:3000/?nuevo=true  # ❌ Ya NO funciona
http://localhost:3000/?MiClaveSecreta2025=true  # ✅ Nueva URL
```

### Ajustar Tiempo de Expiración

```bash
# 15 minutos (más restrictivo)
TURNO_EXPIRATION_MINUTES=15

# 1 hora (más flexible)
TURNO_EXPIRATION_MINUTES=60

# 2 horas
TURNO_EXPIRATION_MINUTES=120
```

## 🛡️ Protecciones del Sistema

### 1. Rate Limiting
- 1 turno cada 30 minutos por navegador
- Almacenado en localStorage del navegador
- No se puede burlar sin limpiar datos del navegador

### 2. Validación Doble Factor
- Tiempo + Parámetro URL especial
- Ambos deben cumplirse para permitir nuevo turno

### 3. Cierre Automático de Ventana 🆕
- **Después de 30 minutos**, la ventana del navegador:
  1. Intenta cerrarse automáticamente
  2. Si no puede cerrar (ventana abierta manualmente), muestra mensaje: "Sesión Finalizada"
  3. Limpia el localStorage automáticamente
- **Previene**: Que el cliente mantenga la ventana abierta indefinidamente
- **Ventaja**: Libera el dispositivo para el siguiente cliente

### 4. Persistencia de Turno
- El turno se mantiene aunque:
  - Recargues la página
  - Cierres y abras el navegador
  - Ingreses la URL directamente

### 4. Expiración Automática
- Después del tiempo configurado, el turno expira
- Permite solicitar nuevo turno automáticamente

## 📱 Casos de Uso

### Caso 1: Cliente Normal
```
09:00 - Escanea QR, solicita turno T001
09:05 - Intenta solicitar otro → Bloqueado
09:15 - Intenta solicitar otro → Bloqueado
09:30 - Intenta solicitar otro → Bloqueado
09:31 - Turno expiró → Puede solicitar nuevo
```

### Caso 2: Staff con URL Especial
```
09:00 - Cliente solicita turno T001
09:10 - Cliente necesita otro turno urgente
09:10 - Staff usa URL especial (?nuevo=true)
09:10 - Sistema valida: Solo 10 min
       → Muestra: "Debe esperar 20 minutos más"
09:30 - Staff usa URL especial (?nuevo=true)
       → ✅ Permite nuevo turno
```

### Caso 3: Cierre Automático 🆕
```
09:00 - Cliente escanea QR, solicita turno T001
09:00 - Sistema programa cierre para las 09:30
09:15 - Cliente es atendido y sale
09:20 - Cliente olvida cerrar la ventana
09:30 - ⏰ Sistema cierra automáticamente la ventana
       → O muestra "Sesión Finalizada"
       → Limpia localStorage
09:31 - Siguiente cliente puede usar el dispositivo
```

### Caso 4: Múltiples Clientes (Mismo Dispositivo)
```
09:00 - Cliente A solicita turno en tablet pública
09:05 - Cliente B intenta usar misma tablet
       → Ve turno de Cliente A (bloqueado)
09:30 - Turno expira
       → Cliente B puede solicitar nuevo turno
```

## 🔧 Solución de Problemas

### Problema: "No puedo solicitar nuevo turno"
**Solución**: 
1. Verifica que hayan pasado 30 minutos
2. Usa la URL con parámetro especial: `?nuevo=true`
3. Si aún no funciona, limpia localStorage:
   ```javascript
   // En consola del navegador (F12)
   localStorage.removeItem('turno_actual');
   location.reload();
   ```

### Problema: "Cambié TURNO_RESET_PARAM pero no funciona"
**Solución**:
1. Reinicia el servidor: `npm run dev`
2. Verifica el nuevo parámetro en consola del navegador
3. Actualiza tus QR codes con el nuevo parámetro

### Problema: "Los clientes solicitan múltiples turnos"
**Solución**:
1. Reduce `TURNO_EXPIRATION_MINUTES` (ej: de 30 a 15)
2. Cambia `TURNO_RESET_PARAM` a un valor secreto
3. No compartas el QR con parámetro especial
4. Implementa validación por cédula en backend (futuro)

## 📊 Recomendaciones

### Para Oficinas Pequeñas
```bash
TURNO_EXPIRATION_MINUTES=15
TURNO_RESET_PARAM=admin2025
```

### Para Oficinas con Alto Tráfico
```bash
TURNO_EXPIRATION_MINUTES=30
TURNO_RESET_PARAM=ChevyStaff_Secret_2025
```

### Para Testing/Desarrollo
```bash
TURNO_EXPIRATION_MINUTES=2
TURNO_RESET_PARAM=test
```

## 🚀 Próximas Mejoras (Recomendadas)

1. **Validación por Cédula en Backend**
   - Si la cédula ya tiene turno activo, rechazar
   - Almacenar en base de datos PostgreSQL

2. **IP Tracking**
   - Registrar IP del solicitante
   - Limitar turnos por IP

3. **Notificaciones**
   - Enviar turno por WhatsApp
   - SMS de confirmación

4. **Panel de Administración**
   - Ver turnos activos
   - Cancelar turnos manualmente
   - Estadísticas de solicitudes

## 📞 Soporte

Si necesitas ayuda adicional o personalización, revisa el código en:
- `src/routes/index.ts` - Configuración del servidor
- `public/solicitar-turno.html` - Lógica del frontend
