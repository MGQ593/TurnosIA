# 🧪 Pruebas del Sistema de Turnos con Arquitectura Separada

## Fecha: 14 de Octubre, 2025
## Configuración Actual: TURNO_EXPIRATION_MINUTES=1 (modo prueba)

---

## ✅ Checklist de Pruebas

### 1️⃣ Acceso Inicial
- [ ] Abrir navegador en `http://localhost:3000`
- [ ] Verificar que **redirige automáticamente** a `http://localhost:3000/solicitar`
- [ ] Ver el formulario con campos de cédula y celular

**Resultado Esperado**: URL cambia de `/` a `/solicitar` automáticamente

---

### 2️⃣ Validación del Formulario
- [ ] Intentar enviar formulario vacío
- [ ] Verificar que muestra errores de validación
- [ ] Llenar cédula con letras (ej: "abc123")
- [ ] Verificar que marca el campo en rojo
- [ ] Llenar celular con menos de 10 dígitos
- [ ] Verificar que marca el campo en rojo

**Resultado Esperado**: Validación funciona correctamente

---

### 3️⃣ Envío Exitoso
- [ ] Llenar cédula: `1234567890`
- [ ] Llenar celular: `0987654321`
- [ ] Marcar checkbox "Autorizo tratamiento de datos"
- [ ] Clic en "Solicitar Turno"
- [ ] Ver spinner de carga (2 segundos)

**Resultado Esperado**: Campos se marcan en verde, botón muestra "Procesando..."

---

### 4️⃣ Redirección a Confirmación
- [ ] Después del envío, verificar que la URL cambió a `/confirmacion?turno=TXXXXXX`
- [ ] Ver la página de confirmación con:
  - ✓ Símbolo de éxito verde
  - Título "¡Turno Confirmado!"
  - Número de turno grande (ej: T123456)
  - Mensaje de WhatsApp
- [ ] **IMPORTANTE**: Abrir DevTools (F12) y ver en consola:
  ```
  ⏱️ Tiempo de expiración: 1 minutos
  ⏰ Cierre automático programado en 1 minuto(s)
  ```

**Resultado Esperado**: Página de confirmación carga correctamente

---

### 5️⃣ Prueba del Botón ATRÁS (Seguridad Principal) 🔐
- [ ] Presionar el botón **ATRÁS (←)** del navegador
- [ ] Verificar que **NO regresa** al formulario `/solicitar`
- [ ] Debería mantenerse en `/confirmacion` o ir a página externa

**Resultado Esperado**: ✅ **CRÍTICO** - El formulario NO debe aparecer

---

### 6️⃣ Prueba de Recarga (F5)
- [ ] Presionar **F5** para recargar la página
- [ ] Verificar que se mantiene en `/confirmacion?turno=TXXXXXX`
- [ ] Ver que el mismo número de turno sigue visible
- [ ] Verificar que el timer de cierre se reinicia

**Resultado Esperado**: Página se recarga pero mantiene el turno

---

### 7️⃣ Prueba de Auto-Cierre (Esperar 1 minuto) ⏰
- [ ] Esperar **60 segundos** (1 minuto configurado)
- [ ] Verificar en consola (F12):
  ```
  ⏰ Tiempo de turno expirado. Cerrando ventana...
  ```
- [ ] La ventana debería:
  - **Opción A**: Cerrarse automáticamente (si fue abierta con window.open)
  - **Opción B**: Mostrar pantalla de "Sesión Finalizada" con mensaje:
    ```
    ✅ Sesión Finalizada
    Tu turno ha sido procesado. Gracias por usar nuestro sistema.
    Puedes cerrar esta ventana de forma segura.
    ```

**Resultado Esperado**: Auto-cierre o mensaje de finalización después de 1 minuto

---

### 8️⃣ Prueba de URL Directa a Confirmación (Sin Turno)
- [ ] En el navegador, escribir manualmente: `http://localhost:3000/confirmacion`
- [ ] Presionar Enter
- [ ] Verificar que **redirige a** `/solicitar` (porque no hay parámetro turno)

**Resultado Esperado**: Redirección automática al formulario si no hay turno en URL

---

### 9️⃣ Prueba de Acceso Directo a /solicitar (Simulando QR)
- [ ] Cerrar todas las pestañas del sistema
- [ ] Abrir nueva pestaña
- [ ] Ir a `http://localhost:3000/solicitar` (simula escanear QR)
- [ ] Llenar y enviar nuevo formulario
- [ ] Verificar que todo el flujo funciona igual

**Resultado Esperado**: QR flow funciona correctamente

---

### 🔟 Prueba de Múltiples Solicitudes (Anti-Spam)
- [ ] En la página de confirmación, esperar que expire (1 minuto)
- [ ] Ver el mensaje de "Sesión Finalizada"
- [ ] Presionar **F5** para recargar
- [ ] Verificar que el mensaje persiste (no vuelve al formulario)
- [ ] Intentar navegar hacia atrás
- [ ] Verificar que **NO** se puede acceder al formulario

**Resultado Esperado**: ✅ **CRÍTICO** - Imposible solicitar otro turno sin escanear QR nuevamente

---

## 📊 Resumen de Resultados

| # | Prueba | Estado | Notas |
|---|--------|--------|-------|
| 1 | Redirección raíz → /solicitar | ⬜ | |
| 2 | Validación de campos | ⬜ | |
| 3 | Envío exitoso | ⬜ | |
| 4 | Redirección a confirmación | ⬜ | |
| 5 | 🔐 Botón atrás bloqueado | ⬜ | **CRÍTICO** |
| 6 | Recarga mantiene turno | ⬜ | |
| 7 | Auto-cierre después de 1 min | ⬜ | |
| 8 | Confirmación sin turno redirige | ⬜ | |
| 9 | Acceso directo vía QR | ⬜ | |
| 10 | 🔐 Anti múltiples solicitudes | ⬜ | **CRÍTICO** |

---

## 🎯 Pruebas Críticas de Seguridad

### ✅ El sistema DEBE prevenir:
1. ❌ Volver al formulario con botón atrás
2. ❌ Solicitar múltiples turnos recargando la página
3. ❌ Acceder al formulario después de expiración
4. ❌ Ver confirmación sin número de turno válido

### ✅ El sistema DEBE permitir:
1. ✓ Acceder al formulario SOLO vía QR (URL directa a /solicitar)
2. ✓ Ver confirmación hasta que expire el tiempo
3. ✓ Recargar la confirmación sin perder el turno
4. ✓ Auto-cerrar o mostrar mensaje después de expiración

---

## 🐛 Registro de Bugs Encontrados

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| - | - | - | - |

---

## 📝 Notas de Configuración

### Configuración Actual (Pruebas)
```env
TURNO_EXPIRATION_MINUTES=1
TURNO_RESET_PARAM=nuevo
```

### Configuración para Producción
```env
TURNO_EXPIRATION_MINUTES=30
TURNO_RESET_PARAM=nuevo
```

---

## 🚀 Próximos Pasos

Después de validar todas las pruebas:

1. [ ] Cambiar `TURNO_EXPIRATION_MINUTES=30` en `.env`
2. [ ] Reiniciar servidor: `npm run dev`
3. [ ] Generar QR con URL: `http://localhost:3000/solicitar`
4. [ ] Probar flujo completo con QR físico
5. [ ] Desplegar en servidor de producción
6. [ ] Imprimir QRs para oficinas

---

**Responsable de Pruebas**: _________  
**Fecha**: 14/10/2025  
**Versión**: 2.0 - Arquitectura de Páginas Separadas
