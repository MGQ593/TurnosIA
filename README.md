# Sistema de Gestión de Turnos

Sistema completo de gestión de turnos con validación de identidad, generación de códigos QR e integración con WhatsApp.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Iniciar base de datos PostgreSQL
# Ver database/schema/init-db.sql para el schema

# 4. Modo desarrollo
npm run dev

# 5. Compilar para producción
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
turnos-app/
├── src/
│   ├── frontend/          # TypeScript frontend (navegador)
│   ├── routes/            # API endpoints Express
│   ├── services/          # Lógica de negocio
│   ├── db/                # Queries PostgreSQL
│   └── utils/             # Utilidades compartidas
├── public/                # Assets estáticos + HTML
├── database/              # Esquemas y migraciones SQL
│   ├── schema/            # init-db.sql, turnos-ia.sql
│   └── migrations/        # Migraciones de BD
├── scripts/               # Scripts de utilidad
├── docs/                  # Documentación organizada
│   ├── setup/             # Guías de instalación
│   ├── guides/            # Guías de usuario
│   ├── architecture/      # Documentación técnica
│   └── archive/           # Históricos
└── dist/                  # Código compilado (TypeScript)
```

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: TypeScript puro (sin frameworks)
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (3 capas)
- **Build**: esbuild (ultra-rápido)
- **Validaciones**: Zod

## 📝 Scripts Disponibles

```bash
npm run dev              # Desarrollo (backend + frontend watch)
npm run dev:backend      # Solo backend con hot-reload
npm run dev:frontend     # Solo frontend con watch mode
npm run build            # Compilar todo (backend + frontend)
npm run start            # Iniciar servidor producción
npm run type-check       # Verificar tipos TypeScript
npm run lint             # Linter
```

## 🔐 Variables de Entorno Requeridas

Ver [.env.example](.env.example) para todas las variables. Las principales son:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=turnos_db
DB_USER=turnos_user
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=clave-segura-minimo-32-caracteres

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password_seguro

# WhatsApp API
WHATSAPP_API_URL=https://tu-api.com
WHATSAPP_API_TOKEN=tu_token
```

## 📚 Documentación

### Guías de Configuración
- [Docker Deployment](docs/setup/docker.md)
- [WhatsApp API](docs/setup/whatsapp-api.md)

### Guías de Usuario
- [Panel Administrativo](docs/guides/admin.md)
- [Testing del Sistema](docs/guides/testing.md)
- [Testing de Autenticación](docs/guides/auth-testing.md)

### Arquitectura
- [Seguridad JWT](docs/architecture/jwt-security.md)
- [Sistema de Autenticación](docs/architecture/auth-system.md)
- [Sistema de QR](docs/architecture/qr-system.md)

## 🎯 Características Principales

### Sistema de Turnos
- ✅ Solicitud de turnos con validación de identidad
- ✅ Generación automática de códigos QR únicos
- ✅ Integración con WhatsApp (Evolution API)
- ✅ Tokens JWT con expiración configurable

### Validaciones
- ✅ Cédula ecuatoriana (algoritmo módulo 10)
- ✅ RUC empresarial (13 dígitos)
- ✅ Pasaporte (formato internacional)

### Panel Administrativo
- ✅ Login con JWT
- ✅ Generación de QR codes
- ✅ Gestión de turnos

## 🔧 Scripts de Utilidad

```bash
# Generar URL de acceso con token
node scripts/generar-url.js

# Generar URL para agencia específica
node scripts/generar-url-agencia.js

# Ejecutar migraciones
node scripts/ejecutar-migracion-*.js
```

## 🗄️ Base de Datos

El esquema de la base de datos se encuentra en:
- Schema principal: [database/schema/init-db.sql](database/schema/init-db.sql)
- Schema turnos IA: [database/schema/turnos-ia.sql](database/schema/turnos-ia.sql)
- Migraciones: [database/migrations/](database/migrations/)

## 🐳 Docker (Opcional)

Si deseas usar Docker:

```bash
# Iniciar con docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

Ver [docs/setup/docker.md](docs/setup/docker.md) para más detalles.

## 📄 Licencia

MIT

## 👤 Autor

Sistema de Turnos ChevyPlan

---

**Última actualización**: Octubre 2024
**Versión**: 1.0.0
