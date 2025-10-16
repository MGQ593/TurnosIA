# 📖 Guía de Usuario - Panel de Administración ChevyPlan

## 🎯 Descripción

Este sistema permite a los administradores de ChevyPlan generar códigos QR que dan acceso temporal al formulario de solicitud de turnos. Solo los usuarios que escanean un código QR válido pueden acceder al sistema.

---

## 🔐 1. Acceso al Panel de Administración

### Paso 1: Abrir la página de login

Abre tu navegador web y navega a:
```
http://localhost:3000/admin-login
```

O en producción:
```
https://turnos.chevyplan.com.ec/admin-login
```

### Paso 2: Ingresar credenciales

Ingresa tus credenciales de administrador:

- **Usuario:** `admin_chevyplan`
- **Contraseña:** `ChevyPlan2025!Secure`

> ⚠️ **Importante:** Estas credenciales están configuradas en el archivo `.env` del servidor. Si no tienes acceso, contacta al administrador del sistema.

### Paso 3: Iniciar sesión

Click en el botón **"Iniciar Sesión"**

Si las credenciales son correctas, serás redirigido automáticamente al generador de códigos QR.

---

## 📱 2. Generar Códigos QR

### Vista Principal

Una vez autenticado, verás el panel de generación de QR con:

1. **Tu usuario** - Muestra el nombre de usuario con el que iniciaste sesión
2. **Código QR** - Se genera automáticamente al entrar
3. **Contador de expiración** - Muestra cuánto tiempo queda antes de que expire el QR
4. **Botones de acción** - Generar nuevo QR, descargar, cerrar sesión
5. **Estadísticas** - QR generados y tiempo de sesión activa

### El Código QR

El código QR generado contiene una URL especial que incluye:
```
http://localhost:3000/solicitar?access=[TOKEN_SEGURO]
```

Este token de acceso es válido por **15 minutos** desde su generación.

### Características del Token

- ✅ **Temporal:** Expira después de 15 minutos
- ✅ **Seguro:** Firmado digitalmente, no se puede manipular
- ✅ **Único:** Cada QR genera un nuevo token
- ✅ **Trazable:** Cada generación queda registrada

---

## 🔄 3. Uso del Sistema

### Escenario Típico

#### Para el Administrador:

1. **Inicia sesión** en el panel admin
2. El sistema **genera automáticamente** un código QR
3. **Muestra el QR** en una tablet o pantalla en la oficina
4. Los clientes **escanean el QR** con sus celulares
5. Cuando el contador llega a **00:00**, genera un **nuevo QR**

#### Para el Cliente:

1. **Escanea el código QR** con la cámara de su celular
2. Se abre automáticamente el **formulario de solicitud**
3. **Completa sus datos** (cédula y celular)
4. **Acepta los términos** y envía el formulario
5. Recibe su **número de turno** (ejemplo: T045)

---

## ⚙️ 4. Funciones del Panel

### 🔄 Generar Nuevo QR

**¿Cuándo usar?**
- Cuando el contador llega a 00:00 (expirado)
- Cuando necesitas un código QR fresco
- Al inicio de cada día laboral

**Cómo hacerlo:**
1. Click en el botón **"🔄 Generar Nuevo QR"**
2. El código QR se actualiza inmediatamente
3. El contador se reinicia a **15:00**
4. El contador de **"QR Generados"** aumenta en 1

### 💾 Descargar QR

**¿Cuándo usar?**
- Para imprimir el QR en papel
- Para compartir el QR por email
- Para mostrar en presentaciones

**Cómo hacerlo:**
1. Click en el botón **"💾 Descargar QR"**
2. Se descarga una imagen PNG con el nombre:
   ```
   qr-turno-chevyplan-1729012345678.png
   ```
3. Puedes imprimir o compartir este archivo

> ⚠️ **Nota:** El QR descargado expira en 15 minutos. Si lo vas a usar más tarde, genera uno nuevo cuando lo necesites.

### 🚪 Cerrar Sesión

**¿Cuándo usar?**
- Al finalizar tu turno
- Cuando vas a dejar la computadora desatendida
- Para cambiar de usuario

**Cómo hacerlo:**
1. Click en el botón **"🚪 Cerrar Sesión"**
2. Confirma que quieres cerrar la sesión
3. Serás redirigido a la página de login
4. Tu sesión se elimina completamente

---

## ⏱️ 5. Entendiendo el Contador

### Formato del Contador

```
15:00 → 15 minutos, 0 segundos
14:30 → 14 minutos, 30 segundos
00:05 → 0 minutos, 5 segundos
EXPIRADO → Token ya no es válido
```

### Estados del Token

| Tiempo Restante | Estado | Color | Acción Recomendada |
|----------------|--------|-------|-------------------|
| 15:00 - 05:01 | ✅ Válido | Amarillo | Usar normalmente |
| 05:00 - 01:01 | ⚠️ Por expirar | Amarillo | Preparar nuevo QR |
| 01:00 - 00:00 | 🔴 Crítico | Amarillo | Generar nuevo ahora |
| EXPIRADO | ❌ Inválido | - | Debe generar nuevo |

### ¿Qué pasa cuando expira?

Cuando el contador llega a **00:00**:
- El QR **deja de funcionar** inmediatamente
- Los clientes que escaneen verán **"Acceso Restringido"**
- Debes hacer click en **"Generar Nuevo QR"**
- El nuevo QR tendrá un contador renovado de **15:00**

---

## 📊 6. Estadísticas

### QR Generados

Muestra cuántos códigos QR has generado en la sesión actual.

**Ejemplo:**
```
QR Generados: 8
```

Esto significa que has generado 8 códigos QR desde que iniciaste sesión.

> 💡 **Tip:** En un día laboral típico, podrías generar entre 32-48 QR codes (uno cada 15 minutos durante 8-12 horas).

### Sesión Activa

Muestra cuánto tiempo llevas con la sesión activa.

**Formato:** `MM:SS`

**Ejemplo:**
```
Sesión Activa: 45:32
```

Esto significa que llevas 45 minutos y 32 segundos con la sesión iniciada.

> ⚠️ **Importante:** La sesión expira automáticamente después de **1 hora** de inactividad. Si esto sucede, tendrás que iniciar sesión nuevamente.

---

## 🔒 7. Seguridad

### Mejores Prácticas

#### ✅ HACER:
- Cerrar sesión al finalizar tu turno
- Generar un nuevo QR cada vez que expire
- Mantener las credenciales seguras
- Reportar cualquier comportamiento extraño
- Usar la computadora en un lugar visible

#### ❌ NO HACER:
- Compartir tus credenciales con otros
- Dejar la sesión abierta sin supervisión
- Compartir capturas del QR por WhatsApp/Email
- Imprimir QR para uso posterior (expiran en 15 min)
- Cerrar el navegador sin hacer logout

### ¿Por qué 15 minutos?

El tiempo de 15 minutos es un balance entre:
- **Seguridad:** Tokens de corta duración son más seguros
- **Usabilidad:** Suficiente tiempo para que clientes escaneen y completen
- **Practicidad:** No requiere regenerar constantemente

### ¿Qué tan seguro es?

El sistema utiliza:
- 🔐 **JWT (JSON Web Tokens)** - Estándar de industria
- 🔑 **Firma digital** - Imposible de falsificar
- ⏱️ **Expiración automática** - Tokens tienen vida limitada
- 🚫 **Validación continua** - Cada acceso se verifica con el servidor

---

## ❓ 8. Preguntas Frecuentes (FAQ)

### ¿Qué hago si olvidé mi contraseña?

Contacta al administrador del sistema. Las credenciales están configuradas en el servidor y solo pueden ser cambiadas por personal técnico.

### ¿Puedo tener varias sesiones abiertas?

Sí, puedes tener el panel abierto en múltiples pestañas o dispositivos al mismo tiempo usando las mismas credenciales.

### ¿El QR descargado funciona para siempre?

No, el QR descargado expira en 15 minutos desde el momento de su generación, aunque lo hayas guardado como imagen.

### ¿Qué pasa si un cliente escanea un QR expirado?

Verá un mensaje amigable que dice "Acceso Restringido" y le indica que escanee un código QR actualizado.

### ¿Cuántas personas pueden usar el mismo QR?

Múltiples personas pueden escanear el mismo QR mientras esté válido (dentro de los 15 minutos). Cada una tendrá acceso independiente al formulario.

### ¿Se puede usar el QR más de una vez?

Sí, el mismo QR puede ser escaneado múltiples veces por diferentes personas durante su período de validez (15 minutos).

### ¿Qué navegador debo usar?

El sistema funciona en:
- ✅ Google Chrome (recomendado)
- ✅ Microsoft Edge
- ✅ Firefox
- ✅ Safari (iOS y macOS)

### ¿Funciona en móvil?

Sí, el panel de administración es completamente responsive y funciona en tablets y teléfonos.

---

## 🆘 9. Solución de Problemas

### Problema: "No puedo iniciar sesión"

**Posibles causas:**
1. Credenciales incorrectas
2. Servidor caído
3. Problemas de red

**Solución:**
- Verifica que estás usando las credenciales correctas
- Asegúrate de no tener Bloq Mayús activado
- Intenta refrescar la página (F5)
- Contacta a soporte técnico

### Problema: "El QR no aparece"

**Posibles causas:**
1. Sesión expirada
2. Problema de red
3. Error del servidor

**Solución:**
- Cierra sesión y vuelve a iniciar
- Verifica tu conexión a internet
- Intenta refrescar la página (F5)
- Si persiste, contacta a soporte

### Problema: "Los clientes dicen que el QR no funciona"

**Verificar:**
1. ¿El contador muestra "EXPIRADO"? → Genera un nuevo QR
2. ¿El QR es viejo? → Genera uno nuevo
3. ¿El celular escanea correctamente? → Prueba con tu celular

**Solución rápida:**
- Genera un nuevo código QR
- Verifica que el contador esté activo
- Pide al cliente que vuelva a escanear

### Problema: "Me cerró la sesión solo"

**Causa:** La sesión expira automáticamente después de 1 hora

**Solución:**
- Vuelve a iniciar sesión
- El sistema está diseñado así por seguridad
- Si vas a ausentarte, cierra sesión manualmente

### Problema: "No puedo descargar el QR"

**Posibles causas:**
1. Bloqueador de descargas del navegador
2. Permisos insuficientes
3. No hay QR generado

**Solución:**
- Asegúrate de que el QR esté visible en pantalla
- Verifica que tu navegador permita descargas
- Intenta generar un nuevo QR y descargar de nuevo

---

## 📞 10. Contacto y Soporte

### Soporte Técnico

**Para problemas técnicos:**
- 📧 Email: soporte.ti@chevyplan.com.ec
- 📱 Teléfono: (04) XXX-XXXX ext. 123
- 🕐 Horario: Lunes a Viernes, 8:00 AM - 6:00 PM

### Soporte de Aplicación

**Para dudas sobre el uso:**
- 📧 Email: turnos@chevyplan.com.ec
- 📱 WhatsApp: +593 9X XXX XXXX
- 🕐 Horario: Lunes a Viernes, 8:00 AM - 5:00 PM

### Reportar Bugs

Si encuentras un problema o error en el sistema:
1. Toma una captura de pantalla del error
2. Anota qué estabas haciendo cuando ocurrió
3. Envía la información a soporte.ti@chevyplan.com.ec

---

## 📝 11. Glosario de Términos

| Término | Significado |
|---------|-------------|
| **QR Code** | Código de barras 2D que contiene información (en este caso, una URL con token) |
| **Token** | Código de seguridad único y temporal que permite acceso al sistema |
| **JWT** | JSON Web Token, estándar de seguridad usado para los tokens |
| **Sesión** | Período de tiempo desde que inicias sesión hasta que cierras o expira |
| **Expiración** | Momento en el que un token deja de ser válido |
| **Access Token** | Token específico que da acceso al formulario por 15 minutos |
| **Session Token** | Token que mantiene tu sesión de admin activa por 1 hora |
| **Countdown** | Contador regresivo que muestra el tiempo restante |

---

## 📅 12. Flujo de Trabajo Diario

### Inicio del Día

```
08:00 AM
├─ Llegar a la oficina
├─ Encender computadora/tablet
├─ Abrir navegador
├─ Ir a /admin-login
├─ Iniciar sesión
└─ ✅ QR generado automáticamente
```

### Durante el Día

```
Cada 15 minutos:
├─ Verificar contador
├─ Si está cerca de 00:00:
│  └─ Generar nuevo QR
└─ Continuar atendiendo clientes
```

### Fin del Día

```
05:00 PM
├─ Verificar que no haya clientes pendientes
├─ Cerrar sesión del panel
├─ Cerrar navegador
└─ Apagar equipo
```

---

## 🎓 13. Capacitación Recomendada

### Nuevos Usuarios

**Tiempo estimado:** 15 minutos

1. **Lectura de esta guía** (10 min)
2. **Práctica supervisada** (5 min)
   - Iniciar sesión
   - Generar 3 QR codes
   - Descargar un QR
   - Cerrar sesión

### Usuarios Experimentados

**Repaso mensual:**
- Revisar sección de seguridad
- Actualizar credenciales si es necesario
- Verificar mejores prácticas

---

## 📌 14. Resumen Rápido

### Para Iniciar

1. Abrir `/admin-login`
2. Usuario: `admin_chevyplan`
3. Contraseña: `ChevyPlan2025!Secure`
4. Click "Iniciar Sesión"

### Para Generar QR

1. QR se genera automáticamente
2. Mostrar QR a clientes
3. Cuando expire (00:00), click "Generar Nuevo QR"

### Para Finalizar

1. Click "Cerrar Sesión"
2. Confirmar
3. Cerrar navegador

---

## ✅ Lista de Verificación Diaria

```
☐ Inicié sesión correctamente
☐ El QR se muestra correctamente
☐ El contador funciona (15:00 → 14:59...)
☐ Los clientes pueden escanear sin problemas
☐ Genero nuevo QR cada vez que expira
☐ Cierro sesión al finalizar
```

---

## 🌟 Consejos Pro

### Optimización

1. **Usa una tablet dedicada** - Deja el panel abierto en una tablet en recepción
2. **Pantalla siempre visible** - Los clientes ven el QR sin preguntar
3. **Regenera proactivamente** - No esperes a que expire, genera uno nuevo a los 14 minutos
4. **Ten un QR de respaldo** - Si tienes dos pantallas, ten dos QR activos

### Atención al Cliente

1. **Señalización clara** - Cartel que diga "Escanea este QR para solicitar turno"
2. **Ayuda si es necesario** - Algunos clientes pueden necesitar ayuda para escanear
3. **Verifica el resultado** - Pregunta si el formulario se abrió correctamente
4. **Explica el proceso** - "Complete sus datos y recibirá su número de turno"

---

**Versión de la Guía:** 1.0  
**Fecha:** 14 de octubre de 2025  
**Sistema:** ChevyPlan Turnos v1.0  
**Estado:** ✅ Documento Oficial
