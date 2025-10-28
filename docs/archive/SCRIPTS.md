# Scripts Disponibles

Esta carpeta contiene scripts útiles para desarrollo y producción del sistema de turnos.

## 📂 Ubicación

Todos los scripts están en la carpeta `/scripts` en la raíz del proyecto.

## 🚀 Scripts de Producción

### `start-with-url.js`

**Propósito:** Inicia el servidor y genera automáticamente una URL de acceso válida con token JWT.

**Uso:**
```bash
node scripts/start-with-url.js
```

**Qué hace:**
- Genera un token JWT de acceso al formulario (válido 15 minutos)
- Inicia el servidor Node.js en el puerto 3000
- Muestra la URL completa lista para usar

**Cuándo usarlo:**
- Inicio rápido del servidor en desarrollo
- Generación de URL de acceso para compartir
- Reinicio del servidor después de cambios

---

### `generar-url.js`

**Propósito:** Genera una URL de acceso SIN especificar agencia (el usuario selecciona después).

**Uso:**
```bash
node scripts/generar-url.js
```

**Output:**
```
http://localhost:3000/solicitar-turno.html?access=TOKEN_JWT
```

**Cuándo usarlo:**
- Generar link genérico sin agencia predefinida
- Crear URLs para acceso multi-agencia
- Regenerar token si el anterior expiró

---

### `generar-url-agencia.js`

**Propósito:** Genera una URL de acceso para una AGENCIA ESPECÍFICA.

**Uso:**
```bash
node scripts/generar-url-agencia.js <ID_AGENCIA>
```

**Ejemplos:**
```bash
# Agencia Principal (ID=1)
node scripts/generar-url-agencia.js 1

# Agencia Norte (ID=2)
node scripts/generar-url-agencia.js 2

# Agencia Sur (ID=3)
node scripts/generar-url-agencia.js 3
```

**Output:**
```
http://localhost:3000/solicitar-turno.html?id_agencia=1&access=TOKEN_JWT
```

**Cuándo usarlo:**
- Crear QR codes específicos por agencia
- Generar links personalizados para cada sucursal
- Facilitar acceso directo a una agencia

---

## 🛠️ Scripts de Desarrollo

### `build-frontend.js`

**Propósito:** Compila los archivos TypeScript del frontend a JavaScript.

**Uso:**
```bash
node scripts/build-frontend.js
```

**Qué compila:**
- `src/frontend/*.ts` → `public/js/*.js`
- Archivos: solicitar-turno, confirmacion, generar-qr, admin-login, admin-qr-generator

**Cuándo usarlo:**
- Después de modificar archivos TypeScript del frontend
- Antes de hacer deploy a producción
- Para probar cambios en el navegador

**Alternativa con npm:**
```bash
npm run build:frontend
```

---

## 📊 IDs de Agencias

Para usar con `generar-url-agencia.js`:

| ID | Código | Nombre              |
|----|--------|---------------------|
| 1  | AG001  | Agencia Principal   |
| 2  | AG002  | Agencia Norte       |
| 3  | AG003  | Agencia Sur         |

---

## 🔐 Tokens JWT

- **Token de Acceso (formulario):** Válido por 15 minutos
- **Token de Confirmación (turno):** Válido por 1 minuto
- **Renovación:** Simplemente ejecuta el script de nuevo para generar un nuevo token

---

## 📝 Notas Importantes

1. **Puerto:** Todos los scripts usan `localhost:3000` por defecto
2. **Base de Datos:** Conectan a PostgreSQL en `68.154.24.20:2483`
3. **Variables de Entorno:** Usan archivo `.env` en la raíz del proyecto
4. **Token Expirado:** Si el token expira, simplemente genera uno nuevo

---

## 🎯 Flujo de Trabajo Típico

### Desarrollo:
```bash
# 1. Hacer cambios en archivos TypeScript
# 2. Compilar frontend
npm run build:frontend

# 3. Compilar backend
npm run build:backend

# 4. Reiniciar servidor con URL
node scripts/start-with-url.js
```

### Producción:
```bash
# 1. Compilar todo
npm run build

# 2. Iniciar con PM2
pm2 start ecosystem.config.js
```

### Generar URLs:
```bash
# URL genérica
node scripts/generar-url.js

# URL para Agencia Norte
node scripts/generar-url-agencia.js 2
```

---

## 🆘 Troubleshooting

**"Puerto 3000 en uso":**
```bash
# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

**"Token inválido":**
- Verifica que el token no haya expirado (15 min)
- Genera un nuevo token con los scripts

**"Error de conexión DB":**
- Verifica el archivo `.env`
- Confirma conectividad con el servidor PostgreSQL
