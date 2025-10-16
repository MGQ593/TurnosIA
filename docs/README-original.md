# 🏥 Sistema de Turnos con Node.js + Autenticación Admin

Sistema de gestión de turnos migrado desde Cloudflare Workers a Node.js + Express + TypeScript + PostgreSQL con **sistema de autenticación de tres capas** para control de acceso mediante códigos QR.

## 📋 Características Principales

- ✅ **Sistema de autenticación admin** con JWT
- ✅ **Generador de QR protegido** con credenciales
- ✅ **Access tokens temporales** (15 minutos)
- ✅ **Validación de acceso** al formulario
- ✅ API REST completa para gestión de turnos y agencias
- ✅ Interfaz web responsive para solicitud de turnos
- ✅ Integración con WhatsApp para notificaciones
- ✅ Base de datos PostgreSQL real (sin simulaciones)
- ✅ Validación de números de WhatsApp
- ✅ Arquitectura modular con TypeScript
- ✅ Seguridad con JWT (JSON Web Tokens)

## 🚀 Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Frontend**: HTML + CSS + JavaScript (servidor estático)
- **Validaciones**: Zod
- **QR Codes**: qrcode-generator
- **Seguridad**: Helmet.js + CORS
- **HTTP Client**: Fetch API
- **Process Manager**: PM2 (recomendado para producción)

## 📁 Estructura del Proyecto

```
src/
├── routes/          # Rutas del API y páginas web
│   ├── api/
│   │   ├── agencias.ts      # CRUD de agencias
│   │   ├── turnos.ts        # Gestión de turnos
│   │   ├── whatsapp.ts      # Validación WhatsApp
│   │   └── token.ts         # ⭐ Autenticación y tokens JWT
│   └── index.ts             # Router principal
├── services/        # Lógica de negocio (futuras implementaciones)
├── db/              # Conexión y queries de base de datos
│   ├── database.ts          # Conexión PostgreSQL
│   └── queries.ts           # Queries SQL organizadas
├── types/           # Definiciones TypeScript
│   └── index.ts             # Tipos principales
├── middleware/      # Middleware Express (futuras implementaciones)
├── utils/           # Utilidades compartidas
│   └── jwtUtils.ts          # ⭐ Funciones JWT (3 tipos de tokens)
└── app.ts           # Configuración principal de Express
public/              # Archivos estáticos
├── solicitar-turno.html     # Formulario de solicitud (protegido)
├── confirmacion.html        # Confirmación de turno
├── admin-login.html         # ⭐ Login de administrador
└── admin-qr-generator.html  # ⭐ Generador de QR (protegido)
```

## ⚙️ Instalación y Configuración

### 1. Requisitos Previos

- Node.js v18 o superior
- PostgreSQL v12 o superior
- npm o yarn

### 2. Clonar e Instalar Dependencias

```bash
git clone <repository-url>
cd turnos-app
npm install
```

### 3. Configuración de Base de Datos

Crear un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configurar las variables de entorno en `.env`:

```env
# Base de datos PostgreSQL
DB_HOST=68.154.24.20
DB_PORT=2483
DB_NAME=agente_ia
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Puerto del servidor
PORT=3000

# Configuración de la aplicación
NODE_ENV=development

# ⭐ SEGURIDAD JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=TU_CLAVE_SECRETA_SUPER_SEGURA_CAMBIAME_EN_PRODUCCION_12345

# ⭐ CREDENCIALES DE ADMINISTRADOR
ADMIN_USERNAME=admin_chevyplan
ADMIN_PASSWORD=ChevyPlan2025!Secure

# ⭐ TIEMPOS DE EXPIRACIÓN (en minutos)
TURNO_EXPIRATION_MINUTES=30
ACCESS_TOKEN_EXPIRATION_MINUTES=15

# WhatsApp API (configurar según tu proveedor)
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=

# Configuración de CORS
CORS_ORIGIN=*
```

## 🔐 Sistema de Seguridad (3 Capas)

### Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│            CAPA 1: AUTENTICACIÓN ADMIN                      │
│  Usuario + Contraseña → Session Token (1 hora)             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│            CAPA 2: GENERADOR DE QR                          │
│  Session Token válido → Access Token (15 min)              │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│            CAPA 3: ACCESO AL FORMULARIO                     │
│  Access Token válido → Formulario de turno                 │
└─────────────────────────────────────────────────────────────┘
```

### Tipos de Tokens JWT

| Token | Duración | Propósito | Almacenamiento |
|-------|----------|-----------|----------------|
| **Session Token** | 1 hora | Sesión de administrador | sessionStorage |
| **Access Token** | 15 min | Acceso al formulario | URL parameter |
| **Turno Token** | 30 min | Confirmación de turno | URL parameter |

### Endpoints de Autenticación

```
POST /api/token/admin/login              - Login de administrador
POST /api/token/admin/verificar-sesion   - Verificar sesión activa
GET  /api/token/generar-acceso           - Generar access token
GET  /api/token/verificar-acceso/:token  - Verificar access token
POST /api/token/generar-token            - Generar turno token
GET  /api/token/verificar-token/:token   - Verificar turno token
```

### Flujo de Usuario

#### Administrador:
1. Login en `/admin-login` con credenciales de `.env`
2. Acceso a `/admin-qr-generator` (verificación de sesión)
3. Generación de QR con access token de 15 minutos
4. Mostrar QR a clientes (tablet/pantalla)

#### Cliente:
1. Escanear QR con celular
2. Acceso a `/solicitar?access=[TOKEN]` (validación automática)
3. Completar formulario (cédula, celular)
4. Recibir número de turno (T001-T999)

### Protecciones Implementadas

- ✅ Acceso directo bloqueado sin token válido
- ✅ Tokens firmados digitalmente (no manipulables)
- ✅ Expiración automática de tokens
- ✅ Credenciales en variables de entorno
- ✅ Validación server-side en cada request
- ✅ Sesiones temporales (sessionStorage)

### 4. Esquema de Base de Datos

El sistema requiere las siguientes tablas en PostgreSQL:

```sql
-- Tabla de agencias
CREATE TABLE agencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    identificacion VARCHAR(50) NOT NULL UNIQUE,
    tipo_identificacion VARCHAR(2) NOT NULL CHECK (tipo_identificacion IN ('CC', 'TI', 'CE', 'PP')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de turnos
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    agencia_id INTEGER REFERENCES agencias(id),
    numero_turno VARCHAR(50) NOT NULL UNIQUE,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'atendido', 'cancelado')),
    motivo TEXT NOT NULL,
    observaciones TEXT,
    codigo_qr TEXT,
    whatsapp_enviado BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX idx_turnos_fecha_cita ON turnos(fecha_cita);
CREATE INDEX idx_turnos_agencia_fecha ON turnos(agencia_id, fecha_cita);
CREATE INDEX idx_clientes_identificacion ON clientes(identificacion);
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Ejecutar servidor en producción
npm start

# Verificar tipos TypeScript
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 🚀 Despliegue en Producción

### Con PM2 (Recomendado)

1. Instalar PM2 globalmente:
```bash
npm install -g pm2
```

2. Compilar el proyecto:
```bash
npm run build
```

3. Crear archivo `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'sistema-turnos',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

4. Iniciar con PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Con Docker

Crear `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY public/ ./public/

EXPOSE 3000

CMD ["npm", "start"]
```

## 📡 API Endpoints

### 🔐 Autenticación (⭐ NUEVO)
- `POST /api/token/admin/login` - Login de administrador
- `POST /api/token/admin/verificar-sesion` - Verificar sesión activa
- `GET /api/token/generar-acceso` - Generar access token (15 min)
- `GET /api/token/verificar-acceso/:token` - Verificar access token
- `POST /api/token/generar-token` - Generar turno token
- `GET /api/token/verificar-token/:token` - Verificar turno token

### Agencias
- `GET /api/agencias` - Listar todas las agencias
- `GET /api/agencias?activas=true` - Listar agencias activas
- `GET /api/agencias/:id` - Obtener agencia por ID
- `POST /api/agencias` - Crear nueva agencia
- `PUT /api/agencias/:id` - Actualizar agencia
- `DELETE /api/agencias/:id` - Eliminar agencia

### Turnos
- `POST /api/turnos/solicitar` - Solicitar nuevo turno
- `GET /api/turnos/:id` - Obtener turno por ID
- `GET /api/turnos/agencia/:agenciaId/fecha/:fecha` - Turnos por agencia y fecha

### WhatsApp
- `POST /api/whatsapp/validar` - Validar número de WhatsApp
- `POST /api/whatsapp/enviar` - Enviar mensaje (placeholder)

### Utilidades
- `GET /api/health` - Health check
- `GET /api/config/public` - Configuración pública (logo, tiempos de expiración)

## 🌐 Páginas Web

### Páginas Públicas
- `/admin-login` - Login de administrador

### Páginas Protegidas
- `/admin-qr-generator` - Generador de QR (⭐ requiere sesión admin)
- `/solicitar?access=[TOKEN]` - Formulario de turnos (⭐ requiere access token)
- `/confirmacion?token=[TOKEN]` - Confirmación de turno (⭐ requiere turno token)

## 🔧 Configuración Adicional

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | `68.154.24.20` |
| `DB_PORT` | Puerto de PostgreSQL | `2483` |
| `DB_NAME` | Nombre de la base de datos | `agente_ia` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `PUBLIC_LOGO_URL` | Logo mostrado en el formulario web | `https://www.chevyplan.com.ec/...` |
| `TURNO_RESET_PARAM` | Valor del parámetro URL para resetear turnos (ej: `?nuevo=true`) | `nuevo` |
| `TURNO_EXPIRATION_MINUTES` | Minutos antes de que un turno expire y permita solicitar otro | `30` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (turnos seguros) | - |

### Seguridad

El sistema incluye:
- **Tokens JWT**: Los turnos se transmiten como tokens firmados e inviolables
- Helmet.js para headers de seguridad
- CORS configurado
- Validación de entrada con Zod
- Sanitización de queries SQL
- Rate limiting
- Protección contra manipulación de URL (tokens JWT con expiración)

## 🎫 Sistema de Turnos con QR (Arquitectura de Páginas Separadas)

### Flujo de Seguridad Anti-Duplicados

El sistema utiliza una arquitectura de **dos páginas separadas** para prevenir solicitudes múltiples:

#### 1️⃣ Página de Solicitud: `/solicitar`
- **Acceso**: Solo mediante escaneo de código QR
- **Función**: Muestra el formulario para solicitar turno
- **Característica clave**: NO permanece en el historial del navegador

#### 2️⃣ Página de Confirmación: `/confirmacion`
- **Acceso**: Solo después de envío exitoso del formulario
- **Función**: Muestra el número de turno asignado
- **Auto-cierre**: Después de `TURNO_EXPIRATION_MINUTES` (configurable)

### 🔒 Protección Implementada

```
┌──────────────────────────────────────────────────────────────┐
│  1. Cliente escanea QR → /solicitar                          │
│  2. Llena formulario y envía                                 │
│  3. window.location.replace('/confirmacion?turno=T123')      │
│     ↳ /solicitar NO queda en historial del navegador        │
│  4. Muestra número de turno                                  │
│  5. Usuario presiona ATRÁS (←) → NO regresa al formulario   │
│  6. Usuario presiona RECARGAR (F5) → Sigue en confirmación  │
│  7. Después de 30 min → Ventana se cierra automáticamente   │
└──────────────────────────────────────────────────────────────┘
```

### ⚙️ Configuración

```env
# Tiempo en minutos antes de cerrar automáticamente la confirmación
TURNO_EXPIRATION_MINUTES=30

# Para pruebas, usar 1 minuto
TURNO_EXPIRATION_MINUTES=1
```

### 🎯 Caso de Uso: QR en Oficinas

Este diseño es ideal para:
- **Kioscos públicos** con códigos QR
- **Oficinas de atención** donde clientes escanean desde su móvil
- **Prevención de spam**: El usuario NO puede solicitar múltiples turnos refrescando la página
- **Seguridad física**: Solo escaneando el QR nuevamente se puede acceder al formulario

### 🔗 URLs del Sistema

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Redirección automática a `/solicitar` | Público |
| `/solicitar` | Formulario de solicitud de turno | Solo vía QR |
| `/confirmacion?turno=T123` | Confirmación del turno asignado | Solo después de envío exitoso |
| `/api/*` | Endpoints REST para gestión | API |

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
```
❌ Error conectando a PostgreSQL: connection refused
```
**Solución**: Verificar que PostgreSQL esté ejecutándose y las credenciales sean correctas.

### Error de TypeScript
```
Cannot find module 'express' or its corresponding type declarations
```
**Solución**: Ejecutar `npm install` para instalar todas las dependencias.

### Puerto en Uso
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solución**: Cambiar el puerto en `.env` o terminar el proceso que usa el puerto 3000.

## � Documentación Adicional

El sistema cuenta con documentación completa en los siguientes archivos:

| Documento | Descripción |
|-----------|-------------|
| `SISTEMA_AUTENTICACION_ADMIN.md` | Documentación técnica completa del sistema de autenticación |
| `GUIA_USUARIO_ADMIN.md` | Manual de usuario para administradores |
| `PRUEBAS_AUTENTICACION_ADMIN.md` | Plan de pruebas detallado con 13 casos de prueba |
| `RESUMEN_IMPLEMENTACION_FINAL.md` | Resumen ejecutivo del proyecto completado |
| `SEGURIDAD_JWT.md` | Implementación y uso de JWT en el sistema |
| `SISTEMA_TURNOS_NUMERACION.md` | Documentación del formato de turnos T001-T999 |
| `SISTEMA_TURNOS_QR.md` | Documentación del sistema de códigos QR |
| `IMPLEMENTACION_COMPLETA.md` | Resumen de todas las funcionalidades |

### 📖 Guías de Inicio Rápido

#### Para Administradores
Lee: `GUIA_USUARIO_ADMIN.md` - Manual completo con FAQ y solución de problemas

#### Para Desarrolladores
Lee: `SISTEMA_AUTENTICACION_ADMIN.md` - Arquitectura técnica y API

#### Para Testing
Lee: `PRUEBAS_AUTENTICACION_ADMIN.md` - 13 casos de prueba documentados

## �📝 Migración desde Cloudflare Workers

Este proyecto es una migración completa del sistema original de Cloudflare Workers. Las principales diferencias:

- ✅ Reemplazado Hono.js con Express.js
- ✅ Migrado de `postgres.js` a `pg` nativo
- ✅ Eliminado runtime de Workers por Node.js estándar
- ✅ Añadido soporte para archivos estáticos
- ✅ Configuración de entorno con dotenv
- ✅ Logging mejorado y manejo de errores
- ✅ **Sistema de autenticación admin con JWT** ⭐
- ✅ **Generador de QR protegido** ⭐
- ✅ **Control de acceso con tokens temporales** ⭐

## 🤝 Contribución

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

Para soporte técnico o consultas:
- Crear issue en GitHub
- Email: [tu-email@dominio.com]

**Estado del Proyecto**: ✅ Funcional - Migración completada desde Cloudflare Workers