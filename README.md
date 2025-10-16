# 🏥 Sistema de Turnos con IA - ChevyPlan# Sistema de Turnos - ChevyPlan# 🏥 Sistema de Turnos con Node.js + Autenticación Admin



Sistema de gestión de turnos con Node.js + Express + TypeScript + PostgreSQL. Incluye validación de WhatsApp, autenticación JWT, generación de códigos QR y numeración de turnos por agencia.



---Sistema de gestión de turnos con validación de WhatsApp, autenticación JWT y panel de administración. Desarrollado con Node.js + Express + TypeScript + PostgreSQL con **sistema de autenticación de tres capas** para control de acceso mediante códigos QR.



## ✨ Características Principales



- ✅ **Sistema de turnos por agencia** - Numeración independiente T001-T999 por sucursal## 🚀 Características## 📋 Características Principales

- ✅ **Autenticación JWT** - Sistema de seguridad de tres capas

- ✅ **Validación WhatsApp** - Integración con Evolution API para validar números

- ✅ **Códigos QR** - Generación de QR para acceso rápido al formulario

- ✅ **Panel Admin** - Gestión de agencias y generación de URLs- ✅ Solicitud de turnos con validación de cédula ecuatoriana- ✅ **Sistema de autenticación admin** con JWT

- ✅ **Base de datos real** - PostgreSQL con esquema `turnos_ia`

- ✅ **Responsive Design** - Funciona en móviles, tablets y desktop- ✅ Validación en tiempo real de números WhatsApp (Evolution API)- ✅ **Generador de QR protegido** con credenciales

- ✅ **TypeScript** - Frontend y backend con tipado estricto

- ✅ **Logs detallados** - Auditoría completa de operaciones- ✅ Panel de administración con autenticación JWT- ✅ **Access tokens temporales** (15 minutos)



---- ✅ Generación de códigos QR para acceso- ✅ **Validación de acceso** al formulario



## 🚀 Stack Tecnológico- ✅ Sistema de tokens de seguridad con expiración- ✅ API REST completa para gestión de turnos y agencias



| Tecnología | Uso |- ✅ Logs de auditoría- ✅ Interfaz web responsive para solicitud de turnos

|------------|-----|

| **Node.js + Express** | Backend del servidor |- ✅ Responsive design- ✅ Integración con WhatsApp para notificaciones

| **TypeScript** | Tipado estático en frontend y backend |

| **PostgreSQL** | Base de datos relacional |- ✅ Base de datos PostgreSQL real (sin simulaciones)

| **JWT** | Autenticación y tokens de seguridad |

| **Evolution API** | Validación de números WhatsApp |## 📁 Estructura del Proyecto- ✅ Validación de números de WhatsApp

| **Zod** | Validación de datos |

| **Helmet.js** | Headers de seguridad |- ✅ Arquitectura modular con TypeScript

| **PM2** | Process manager para producción |

```- ✅ Seguridad con JWT (JSON Web Tokens)

---

turnos-app/

## 📁 Estructura del Proyecto

├── src/                    # Código fuente TypeScript## 🚀 Stack Tecnológico

```

turnos-app/│   ├── app.ts             # Configuración de Express

├── src/                     # Código fuente TypeScript

│   ├── routes/             # Rutas del API│   ├── index.ts           # Punto de entrada- **Backend**: Node.js + Express + TypeScript

│   │   └── api/            # Endpoints REST

│   ├── services/           # Lógica de negocio│   ├── db/                # Conexión y queries de base de datos- **Base de Datos**: PostgreSQL

│   ├── db/                 # Conexión y queries PostgreSQL

│   ├── types/              # Definiciones TypeScript│   │   ├── database.ts- **Autenticación**: JWT (JSON Web Tokens)

│   ├── utils/              # Utilidades (JWT, etc)

│   ├── frontend/           # Frontend en TypeScript│   │   └── queries.ts- **Frontend**: HTML + CSS + JavaScript (servidor estático)

│   └── app.ts              # Configuración Express

││   ├── routes/            # Rutas del API- **Validaciones**: Zod

├── public/                  # Archivos estáticos compilados

│   ├── js/                 # JavaScript compilado│   │   ├── index.ts- **QR Codes**: qrcode-generator

│   ├── css/                # Estilos

│   ├── solicitar-turno.html│   │   └── api/- **Seguridad**: Helmet.js + CORS

│   ├── confirmacion.html

│   ├── admin-login.html│   │       ├── agencias.ts- **HTTP Client**: Fetch API

│   └── admin-qr-generator.html

││   │       ├── token.ts- **Process Manager**: PM2 (recomendado para producción)

├── scripts/                 # ⭐ Scripts útiles

│   ├── start-with-url.js   # Iniciar servidor + generar URL│   │       ├── turnos.ts

│   ├── generar-url.js      # Generar URL sin agencia

│   ├── generar-url-agencia.js  # Generar URL con agencia│   │       └── whatsapp.ts## 📁 Estructura del Proyecto

│   └── build-frontend.js   # Compilar frontend TypeScript

││   ├── types/             # Definiciones TypeScript

├── docs/                    # Documentación completa

│   ├── SCRIPTS.md          # ⭐ Guía de scripts disponibles│   │   └── index.ts```

│   ├── CONFIGURACION_WHATSAPP_API.md

│   ├── GUIA_USUARIO_ADMIN.md│   └── utils/             # Utilidades (JWT, etc)src/

│   ├── SEGURIDAD_JWT.md

│   └── ... (más documentación)│       └── jwtUtils.ts├── routes/          # Rutas del API y páginas web

│

├── dist/                    # TypeScript compilado (generado)├── public/                # Archivos estáticos│   ├── api/

├── logs/                    # Logs de la aplicación

├── .env                     # Variables de entorno (no versionado)│   ├── css/              # Estilos│   │   ├── agencias.ts      # CRUD de agencias

├── .env.example            # Plantilla de configuración

├── package.json│   │   └── solicitar-turno.css│   │   ├── turnos.ts        # Gestión de turnos

├── tsconfig.json           # Configuración TypeScript backend

├── tsconfig.frontend.json  # Configuración TypeScript frontend│   ├── js/               # Scripts del cliente│   │   ├── whatsapp.ts      # Validación WhatsApp

└── ecosystem.config.js     # Configuración PM2

```│   │   └── solicitar-turno.js│   │   └── token.ts         # ⭐ Autenticación y tokens JWT



---│   ├── solicitar-turno.html│   └── index.ts             # Router principal



## ⚙️ Instalación│   ├── confirmacion.html├── services/        # Lógica de negocio (futuras implementaciones)



### 1. Requisitos Previos│   ├── admin-login.html├── db/              # Conexión y queries de base de datos



- Node.js v18 o superior│   ├── admin-qr-generator.html│   ├── database.ts          # Conexión PostgreSQL

- PostgreSQL v12 o superior

- npm o yarn│   └── generar-qr.html│   └── queries.ts           # Queries SQL organizadas



### 2. Clonar e Instalar├── docs/                  # Documentación├── types/           # Definiciones TypeScript



```bash│   ├── CONFIGURACION_WHATSAPP_API.md│   └── index.ts             # Tipos principales

git clone <repository-url>

cd turnos-app│   ├── GUIA_USUARIO_ADMIN.md├── middleware/      # Middleware Express (futuras implementaciones)

npm install

```│   ├── SEGURIDAD_JWT.md├── utils/           # Utilidades compartidas



### 3. Configurar Variables de Entorno│   └── ...│   └── jwtUtils.ts          # ⭐ Funciones JWT (3 tipos de tokens)



Crear archivo `.env` basado en `.env.example`:├── logs/                  # Logs de la aplicación└── app.ts           # Configuración principal de Express



```bash├── .env                   # Variables de entorno (no versionado)public/              # Archivos estáticos

cp .env.example .env

```├── .env.example          # Plantilla de variables de entorno├── solicitar-turno.html     # Formulario de solicitud (protegido)



Editar `.env` con tus credenciales:├── ecosystem.config.js   # Configuración PM2├── confirmacion.html        # Confirmación de turno



```env├── package.json├── admin-login.html         # ⭐ Login de administrador

# Base de Datos PostgreSQL

DB_HOST=68.154.24.20└── tsconfig.json└── admin-qr-generator.html  # ⭐ Generador de QR (protegido)

DB_PORT=2483

DB_NAME=agente_ia``````

DB_USER=tu_usuario

DB_PASSWORD=tu_password



# Puerto del Servidor## 🛠️ Instalación## ⚙️ Instalación y Configuración

PORT=3000

NODE_ENV=development



# Seguridad JWT (⚠️ CAMBIAR EN PRODUCCIÓN)### Requisitos Previos### 1. Requisitos Previos

JWT_SECRET=TU_CLAVE_SECRETA_MINIMO_32_CARACTERES



# Credenciales de Administrador (⚠️ CAMBIAR EN PRODUCCIÓN)

ADMIN_USERNAME=admin_chevyplan- Node.js 18+ - Node.js v18 o superior

ADMIN_PASSWORD=ChevyPlan2025!Secure

- PostgreSQL 12+- PostgreSQL v12 o superior

# Tiempos de Expiración (en minutos)

TURNO_EXPIRATION_MINUTES=30- npm o pnpm- npm o yarn

ACCESS_TOKEN_EXPIRATION_MINUTES=15



# WhatsApp API (Evolution API)

WHATSAPP_API_URL=https://tu-evolution-api.com/chat/whatsappNumbers/Instance### Pasos de Instalación### 2. Clonar e Instalar Dependencias

WHATSAPP_API_TOKEN=tu_token_api

```



### 4. Crear la Base de Datos1. **Clonar el repositorio**```bash



Ejecutar el script SQL para crear el esquema `turnos_ia`:   ```bashgit clone <repository-url>



```bash   git clone <repository-url>cd turnos-app

# Opción 1: Con psql

psql -h 68.154.24.20 -p 2483 -U tu_usuario -d agente_ia -f init-db-turnos-ia.sql   cd turnos-appnpm install



# Opción 2: Con DBeaver u otro cliente SQL   ``````

# Abrir init-db-turnos-ia.sql y ejecutarlo

```



Ver `docs/INSTRUCCIONES_ESQUEMA_TURNOS_IA.md` para más detalles.2. **Instalar dependencias**### 3. Configuración de Base de Datos



---   ```bash



## 🚀 Uso   npm installCrear un archivo `.env` basado en `.env.example`:



### Desarrollo   ```



```bash```bash

# Modo desarrollo con recarga automática

npm run dev3. **Configurar variables de entorno**cp .env.example .env



# Compilar frontend   ```bash```

npm run build:frontend

   cp .env.example .env

# Compilar backend

npm run build:backend   # Editar .env con tus credencialesConfigurar las variables de entorno en `.env`:



# Compilar todo   ```

npm run build

```env

# Verificar tipos sin compilar

npm run type-check4. **Iniciar en desarrollo**# Base de datos PostgreSQL

```

   ```bashDB_HOST=68.154.24.20

### Producción

   npm run devDB_PORT=2483

```bash

# Compilar proyecto   ```DB_NAME=agente_ia

npm run build

DB_USER=tu_usuario

# Iniciar servidor

npm start5. **Compilar para producción**DB_PASSWORD=tu_password



# O con PM2 (recomendado)   ```bash

pm2 start ecosystem.config.js

pm2 save   npm run build# Puerto del servidor

pm2 startup

```   npm startPORT=3000



### Scripts Útiles   ```



```bash# Configuración de la aplicación

# Iniciar servidor + generar URL de acceso

node scripts/start-with-url.js## 🔧 ConfiguraciónNODE_ENV=development



# Generar URL sin agencia específica

node scripts/generar-url.js

### Variables de Entorno Principales# ⭐ SEGURIDAD JWT (CAMBIAR EN PRODUCCIÓN)

# Generar URL para Agencia Principal (ID=1)

node scripts/generar-url-agencia.js 1JWT_SECRET=TU_CLAVE_SECRETA_SUPER_SEGURA_CAMBIAME_EN_PRODUCCION_12345



# Generar URL para Agencia Norte (ID=2)```env

node scripts/generar-url-agencia.js 2

```# Base de datos# ⭐ CREDENCIALES DE ADMINISTRADOR



📖 **Ver documentación completa de scripts en:** `docs/SCRIPTS.md`DB_HOST=localhostADMIN_USERNAME=admin_chevyplan



---DB_PORT=5432ADMIN_PASSWORD=ChevyPlan2025!Secure



## 🎯 Sistema de Numeración de TurnosDB_NAME=agente_ia



### FuncionamientoDB_USER=user# ⭐ TIEMPOS DE EXPIRACIÓN (en minutos)



Cada agencia tiene su propia secuencia de turnos **independiente**:DB_PASSWORD=passwordTURNO_EXPIRATION_MINUTES=30



| Agencia | ID | Turnos del Día |ACCESS_TOKEN_EXPIRATION_MINUTES=15

|---------|----|--------------  |

| Principal | 1 | T001, T002, T003... |# JWT

| Norte | 2 | T001, T002, T003... (independiente) |

| Sur | 3 | T001, T002, T003... (independiente) |JWT_SECRET=your-secret-key-min-32-chars# WhatsApp API (configurar según tu proveedor)



### CaracterísticasWHATSAPP_API_URL=



- **Formato:** T001 a T999 (3 dígitos con ceros a la izquierda)# WhatsApp API (Evolution API)WHATSAPP_API_TOKEN=

- **Reinicio:** Cada agencia reinicia en T001 al inicio de cada jornada (00:00)

- **Independencia:** Las agencias no comparten numeraciónWHATSAPP_API_URL=https://api.example.com/chat/whatsappNumbers/Instance

- **Límite:** Máximo 999 turnos por agencia por día

WHATSAPP_API_TOKEN=your-token# Configuración de CORS

### Ejemplo Real

CORS_ORIGIN=*

**Día 2025-10-15:**

- Agencia Principal: T001, T002, T003# Admin```

- Agencia Norte: T001, T002 (su propia secuencia)

- Agencia Sur: T001, T002 (su propia secuencia)ADMIN_USERNAME=admin



**Día 2025-10-16:** Todas reinician en T001ADMIN_PASSWORD=secure-password## 🔐 Sistema de Seguridad (3 Capas)



---



## 🔐 Sistema de Seguridad (3 Capas)# Configuración de turnos### Arquitectura de Seguridad



### ArquitecturaTURNO_EXPIRATION_MINUTES=30



```ACCESS_TOKEN_EXPIRATION_MINUTES=15```

┌─────────────────────────────────────────────────┐

│ CAPA 1: Autenticación Admin                     │```┌─────────────────────────────────────────────────────────────┐

│ Usuario + Contraseña → Session Token (1 hora)   │

└─────────────────────────────────────────────────┘│            CAPA 1: AUTENTICACIÓN ADMIN                      │

                      ↓

┌─────────────────────────────────────────────────┐Ver `.env.example` para la lista completa de variables.│  Usuario + Contraseña → Session Token (1 hora)             │

│ CAPA 2: Generador de QR                         │

│ Session Token → Access Token (15 min)           │└─────────────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────┘

                      ↓## 📚 Documentación                        ↓

┌─────────────────────────────────────────────────┐

│ CAPA 3: Acceso al Formulario                    │┌─────────────────────────────────────────────────────────────┐

│ Access Token → Permitir solicitud de turno      │

└─────────────────────────────────────────────────┘La documentación detallada se encuentra en la carpeta `/docs`:│            CAPA 2: GENERADOR DE QR                          │

```

│  Session Token válido → Access Token (15 min)              │

### Tipos de Tokens

- **[Configuración WhatsApp API](docs/CONFIGURACION_WHATSAPP_API.md)** - Integración con Evolution API└─────────────────────────────────────────────────────────────┘

| Token | Duración | Propósito | Endpoint |

|-------|----------|-----------|----------|- **[Guía de Usuario Admin](docs/GUIA_USUARIO_ADMIN.md)** - Manual del panel de administración                        ↓

| **Session Token** | 1 hora | Sesión de administrador | `POST /api/token/admin/login` |

| **Access Token** | 15 min | Acceso al formulario | `GET /api/token/generar-acceso` |- **[Seguridad JWT](docs/SEGURIDAD_JWT.md)** - Sistema de tokens y autenticación┌─────────────────────────────────────────────────────────────┐

| **Turno Token** | 30 min | Confirmación de turno | `POST /api/token/generar-token` |

- **[Sistema de Turnos](docs/SISTEMA_TURNOS_NUMERACION.md)** - Lógica de generación de turnos│            CAPA 3: ACCESO AL FORMULARIO                     │

📖 **Ver documentación completa de seguridad en:** `docs/SEGURIDAD_JWT.md`

- **[Sistema QR](docs/SISTEMA_TURNOS_QR.md)** - Códigos QR de acceso│  Access Token válido → Formulario de turno                 │

---

└─────────────────────────────────────────────────────────────┘

## 📡 API Endpoints

## 🔐 Seguridad```

### Autenticación



```

POST   /api/token/admin/login              - Login de administrador- JWT con 3 tipos de tokens (admin, access, turno)### Tipos de Tokens JWT

POST   /api/token/admin/verificar-sesion   - Verificar sesión activa

GET    /api/token/generar-acceso           - Generar access token- Validación de entrada con Zod

GET    /api/token/verificar-acceso/:token  - Verificar access token

POST   /api/token/generar-token            - Generar turno token- Tokens de un solo uso para turnos| Token | Duración | Propósito | Almacenamiento |

GET    /api/token/verificar-token/:token   - Verificar turno token

```- Expiración automática de sesiones|-------|----------|-----------|----------------|



### Agencias- Helmet.js para headers de seguridad| **Session Token** | 1 hora | Sesión de administrador | sessionStorage |



```- CORS configurado| **Access Token** | 15 min | Acceso al formulario | URL parameter |

GET    /api/agencias                 - Listar todas las agencias

GET    /api/agencias/:id             - Obtener agencia por ID- Validación de cédula ecuatoriana| **Turno Token** | 30 min | Confirmación de turno | URL parameter |

POST   /api/agencias                 - Crear nueva agencia

PUT    /api/agencias/:id             - Actualizar agencia

DELETE /api/agencias/:id             - Eliminar agencia

```## 🚦 Scripts Disponibles### Endpoints de Autenticación



### Turnos



``````bash```

POST   /api/turnos/solicitar                      - Solicitar nuevo turno

GET    /api/turnos/:id                            - Obtener turno por IDnpm run dev          # Desarrollo con hot reload (tsx watch)POST /api/token/admin/login              - Login de administrador

GET    /api/turnos/agencia/:id                    - Obtener info de agencia

GET    /api/turnos/agencia/:id/fecha/:fecha       - Turnos por agencia y fechanpm run build        # Compilar TypeScript a JavaScriptPOST /api/token/admin/verificar-sesion   - Verificar sesión activa

```

npm start            # Producción (requiere build previo)GET  /api/token/generar-acceso           - Generar access token

### WhatsApp

npm run type-check   # Verificar tipos TypeScript sin compilarGET  /api/token/verificar-acceso/:token  - Verificar access token

```

POST   /api/whatsapp/validar         - Validar número de WhatsApp```POST /api/token/generar-token            - Generar turno token

```

GET  /api/token/verificar-token/:token   - Verificar turno token

### Utilidades

## 🌐 API Endpoints```

```

GET    /api/health                   - Health check

GET    /api/config/public            - Configuración pública

```### Público### Flujo de Usuario



---



## 🌐 Páginas Web- `GET /solicitar-turno` - Formulario de solicitud de turno#### Administrador:



### Páginas Públicas- `GET /confirmacion` - Página de confirmación de turno1. Login en `/admin-login` con credenciales de `.env`



```- `GET /generar-qr` - Generador de QR (requiere admin auth)2. Acceso a `/admin-qr-generator` (verificación de sesión)

GET    /admin-login                  - Login de administrador

```- `GET /api/config/public` - Configuración pública3. Generación de QR con access token de 15 minutos



### Páginas Protegidas (Requieren Token)- `POST /api/token/generar-token` - Generar token de turno4. Mostrar QR a clientes (tablet/pantalla)



```- `GET /api/token/acceso-qr` - Generar token de acceso temporal

GET    /admin-qr-generator?token=... - Generador de QR (requiere sesión)

GET    /solicitar-turno?access=...   - Formulario de turnos- `GET /api/token/verificar-acceso/:token` - Verificar token de acceso#### Cliente:

GET    /confirmacion?token=...       - Confirmación de turno

```- `GET /api/token/verificar-token/:token` - Verificar token de turno1. Escanear QR con celular



---2. Acceso a `/solicitar?access=[TOKEN]` (validación automática)



## 🗄️ Base de Datos### Admin (Requiere autenticación JWT)3. Completar formulario (cédula, celular)



### Esquema: `turnos_ia`4. Recibir número de turno (T001-T999)



#### Tabla `agencias`- `POST /api/admin/login` - Login de administrador



```sql- `GET /api/agencias` - Listar agencias### Protecciones Implementadas

CREATE TABLE turnos_ia.agencias (

    id SERIAL PRIMARY KEY,- `POST /api/agencias` - Crear agencia

    codigo VARCHAR(10) UNIQUE NOT NULL,

    nombre VARCHAR(255) NOT NULL,- `PUT /api/agencias/:id` - Actualizar agencia- ✅ Acceso directo bloqueado sin token válido

    direccion TEXT,

    telefono VARCHAR(50),- `DELETE /api/agencias/:id` - Eliminar agencia- ✅ Tokens firmados digitalmente (no manipulables)

    email VARCHAR(255),

    activa BOOLEAN DEFAULT true,- ✅ Expiración automática de tokens

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP## 🗄️ Base de Datos- ✅ Credenciales en variables de entorno

);

```- ✅ Validación server-side en cada request



#### Tabla `clientes`El sistema utiliza PostgreSQL con las siguientes tablas principales:- ✅ Sesiones temporales (sessionStorage)



```sql

CREATE TABLE turnos_ia.clientes (

    id SERIAL PRIMARY KEY,- `turnos` - Almacenamiento de turnos generados### 4. Esquema de Base de Datos

    nombres VARCHAR(255),

    apellidos VARCHAR(255),- `agencias` - Información de agencias de venta

    identificacion VARCHAR(20) UNIQUE NOT NULL,

    celular VARCHAR(20) NOT NULL,- (Otras tablas según necesidad del negocio)El sistema requiere las siguientes tablas en PostgreSQL:

    email VARCHAR(255),

    fecha_nacimiento DATE,

    agencia_id INTEGER REFERENCES turnos_ia.agencias(id),

    activo BOOLEAN DEFAULT true,Ver documentación en `/docs` para el esquema completo.```sql

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP-- Tabla de agencias

);

```## 🎨 FrontendCREATE TABLE agencias (



#### Tabla `turnos`    id SERIAL PRIMARY KEY,



```sql### Arquitectura    nombre VARCHAR(255) NOT NULL,

CREATE TABLE turnos_ia.turnos (

    id SERIAL PRIMARY KEY,    direccion TEXT NOT NULL,

    cliente_id INTEGER REFERENCES turnos_ia.clientes(id),

    agencia_id INTEGER REFERENCES turnos_ia.agencias(id),El frontend sigue las mejores prácticas de desarrollo web:    telefono VARCHAR(50) NOT NULL,

    numero_turno VARCHAR(10) NOT NULL,

    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    email VARCHAR(255) NOT NULL,

    estado VARCHAR(20) DEFAULT 'pendiente',

    prioridad VARCHAR(20) DEFAULT 'normal',- **HTML semántico** - Estructura clara y accesible    whatsapp VARCHAR(50) NOT NULL,

    origen VARCHAR(20) DEFAULT 'web',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,- **CSS modular** - Archivos separados por página    activa BOOLEAN DEFAULT true,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);- **JavaScript modular** - Lógica organizada en archivos independientes    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

```

- **Versionado de assets** - Cache busting con `?v=1.0.0`    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

- **Responsive design** - Compatible con móviles y tablets);

## 📚 Documentación Adicional



| Documento | Descripción |

|-----------|-------------|### Páginas Principales-- Tabla de clientes

| **`docs/SCRIPTS.md`** | ⭐ Guía completa de scripts disponibles |

| `docs/INSTRUCCIONES_ESQUEMA_TURNOS_IA.md` | Creación del esquema de base de datos |CREATE TABLE clientes (

| `docs/CONFIGURACION_WHATSAPP_API.md` | Integración con Evolution API |

| `docs/GUIA_USUARIO_ADMIN.md` | Manual para administradores |1. **solicitar-turno.html** - Formulario de solicitud    id SERIAL PRIMARY KEY,

| `docs/SEGURIDAD_JWT.md` | Sistema de autenticación JWT |

| `docs/SISTEMA_TURNOS_NUMERACION.md` | Lógica de numeración de turnos |   - Validación en tiempo real    nombre VARCHAR(255) NOT NULL,

| `docs/SISTEMA_TURNOS_QR.md` | Sistema de códigos QR |

| `docs/DISEÑO_RESPONSIVE.md` | Diseño responsive implementado |   - Integración con WhatsApp API    email VARCHAR(255) NOT NULL,



---   - Sistema de tokens JWT    telefono VARCHAR(50) NOT NULL,



## 🐛 Troubleshooting    identificacion VARCHAR(50) NOT NULL UNIQUE,



### Puerto 3000 en uso2. **confirmacion.html** - Confirmación de turno    tipo_identificacion VARCHAR(2) NOT NULL CHECK (tipo_identificacion IN ('CC', 'TI', 'CE', 'PP')),



```bash   - Muestra QR del turno    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

# Windows PowerShell

Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force   - Información del turno generado    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

```

);

### Error de conexión a PostgreSQL

3. **admin-login.html** - Login administrativo

1. Verificar que PostgreSQL esté corriendo

2. Revisar credenciales en `.env`   - Autenticación JWT-- Tabla de turnos

3. Verificar conectividad: `psql -h 68.154.24.20 -p 2483 -U tu_usuario -d agente_ia`

   - Acceso al panel de administraciónCREATE TABLE turnos (

### Token inválido o expirado

    id SERIAL PRIMARY KEY,

Los tokens tienen tiempos de expiración:

- **Access Token:** 15 minutos4. **generar-qr.html** - Generador de QR    cliente_id INTEGER REFERENCES clientes(id),

- **Turno Token:** 30 minutos

- **Session Token:** 1 hora   - Requiere autenticación admin    agencia_id INTEGER REFERENCES agencias(id),



**Solución:** Generar un nuevo token con los scripts correspondientes.   - Genera QR de acceso temporal    numero_turno VARCHAR(50) NOT NULL UNIQUE,



### WhatsApp validation no funciona    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,



1. Verificar `WHATSAPP_API_URL` y `WHATSAPP_API_TOKEN` en `.env`## 🐛 Troubleshooting    fecha_cita DATE NOT NULL,

2. Verificar conectividad con Evolution API

3. Revisar logs del servidor    hora_cita TIME NOT NULL,

4. Verificar formato del número: `+593981234567`

### El servidor no inicia    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'atendido', 'cancelado')),

---

    motivo TEXT NOT NULL,

## 🚢 Deployment

1. Verificar que PostgreSQL esté corriendo    observaciones TEXT,

### Con PM2 (Recomendado)

2. Revisar las credenciales en `.env`    codigo_qr TEXT,

```bash

# 1. Compilar proyecto3. Verificar logs en `/logs`    whatsapp_enviado BOOLEAN DEFAULT false,

npm run build

4. Comprobar que el puerto 3000 no esté en uso    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

# 2. Instalar PM2 globalmente (si no lo tienes)

npm install -g pm2    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP



# 3. Iniciar con PM2### WhatsApp validation no funciona);

pm2 start ecosystem.config.js --env production



# 4. Guardar configuración

pm2 save1. Verificar que `WHATSAPP_API_URL` y `WHATSAPP_API_TOKEN` estén configurados en `.env`-- Índices para optimización



# 5. Configurar inicio automático2. Verificar conectividad con Evolution APICREATE INDEX idx_turnos_fecha_cita ON turnos(fecha_cita);

pm2 startup

```3. Revisar logs del navegador (F12 → Console)CREATE INDEX idx_turnos_agencia_fecha ON turnos(agencia_id, fecha_cita);



### Comandos PM2 Útiles4. Verificar que el endpoint de Evolution API esté activoCREATE INDEX idx_clientes_identificacion ON clientes(identificacion);



```bash```

pm2 list              # Ver procesos

pm2 logs              # Ver logs en tiempo real### Problemas de caché en el navegador

pm2 restart all       # Reiniciar todos los procesos

pm2 stop all          # Detener todos los procesos## 🛠️ Scripts Disponibles

pm2 delete all        # Eliminar todos los procesos

pm2 monit             # Monitor interactivo1. Hard refresh: `Ctrl + Shift + R` o `Ctrl + F5`

```

2. Abrir DevTools → Network → Marcar "Disable cache"```bash

### Variables de Entorno en Producción

3. O cambiar el versionado en HTML: `?v=1.0.1`# Desarrollo con recarga automática

⚠️ **IMPORTANTE:** Cambiar estas variables en producción:

npm run dev

```env

NODE_ENV=production### Token expirado

JWT_SECRET=CLAVE_SECRETA_UNICA_MINIMO_32_CARACTERES_PRODUCCION

ADMIN_USERNAME=admin_real# Compilar TypeScript a JavaScript

ADMIN_PASSWORD=PasswordSeguro123!@#

```Los tokens tienen tiempos de expiración configurados:npm run build



---- Access token: 15 minutos (configurable en `.env`)



## 🤝 Contribución- Turno token: 1-30 minutos (configurable en `.env`)# Ejecutar servidor en producción



1. Fork del repositorio- Admin token: según configuraciónnpm start

2. Crear branch: `git checkout -b feature/nueva-funcionalidad`

3. Commit cambios: `git commit -am 'Añadir nueva funcionalidad'`

4. Push: `git push origin feature/nueva-funcionalidad`

5. Crear Pull RequestSi expiran, el usuario deberá generar uno nuevo.# Verificar tipos TypeScript



---npm run type-check



## 📝 Convenciones de Código## 📦 Deployment (Producción)



- **TypeScript** para todo el código# Linting

- **Nombres en español** para variables de negocio

- **Camel case** para variables y funciones### Con PM2npm run lint

- **Pascal case** para tipos e interfaces

- **Comentarios en español** cuando sea necesarionpm run lint:fix

- **ESLint** configurado para mantener consistencia

```bash```

---

# Compilar

## 📄 Licencia

npm run build## 🚀 Despliegue en Producción

MIT License



---

# Iniciar con PM2### Con PM2 (Recomendado)

## 📞 Soporte

pm2 start ecosystem.config.js

Para soporte técnico o consultas:

- **Issues:** [GitHub Issues]1. Instalar PM2 globalmente:

- **Email:** soporte@chevyplan.com.ec

# Ver logs```bash

---

pm2 logsnpm install -g pm2

**Versión:** 1.0.0  

**Última actualización:** Octubre 2025  ```

**Estado:** ✅ Funcional en producción  

**Desarrollado por:** Equipo ChevyPlan# Reiniciar


pm2 restart turnos-app2. Compilar el proyecto:

```bash

# Detenernpm run build

pm2 stop turnos-app```

```

3. Crear archivo `ecosystem.config.js`:

### Variables de Entorno en Producción```javascript

module.exports = {

Asegúrate de configurar todas las variables en el servidor:  apps: [{

    name: 'sistema-turnos',

- `NODE_ENV=production`    script: 'dist/index.js',

- Todas las credenciales de base de datos    env: {

- JWT_SECRET único y seguro (mínimo 32 caracteres)      NODE_ENV: 'development'

- Credenciales de Evolution API    },

- Credenciales de administrador seguras    env_production: {

      NODE_ENV: 'production',

## 🔄 Actualizaciones      PORT: 3000

    }

Para actualizar el proyecto:  }]

};

```bash```

git pull origin main

npm install4. Iniciar con PM2:

npm run build```bash

pm2 restart turnos-apppm2 start ecosystem.config.js --env production

```pm2 save

pm2 startup

## 📝 Convenciones de Código```



- **TypeScript** para todo el backend### Con Docker

- **Nombres en español** para variables de negocio

- **Camel case** para variables y funcionesCrear `Dockerfile`:

- **Pascal case** para tipos e interfaces```dockerfile

- **Comentarios en español** cuando sea necesarioFROM node:18-alpine

- **ESLint** configurado para mantener consistencia

WORKDIR /app

## 🤝 Contribuir

COPY package*.json ./

1. Crear branch desde `main`RUN npm ci --only=production

2. Hacer commits descriptivos

3. Probar localmenteCOPY dist/ ./dist/

4. Crear Pull RequestCOPY public/ ./public/

5. Esperar revisión del equipo

EXPOSE 3000

## 📧 Soporte

CMD ["npm", "start"]

Para soporte técnico, contactar a: soporte@chevyplan.com.ec```



---## 📡 API Endpoints



**Versión:** 1.0.0  ### 🔐 Autenticación (⭐ NUEVO)

**Última actualización:** Octubre 2025  - `POST /api/token/admin/login` - Login de administrador

**Desarrollado por:** Equipo ChevyPlan- `POST /api/token/admin/verificar-sesion` - Verificar sesión activa

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

**Estado del Proyecto**: ✅ Funcional y en producción