# Sistema de Turnos con IA y WhatsApp - Node.js

## Descripción del Proyecto
Sistema de gestión de turnos con Node.js + Express + TypeScript + PostgreSQL para servidor propio.

## Características Principales
- API REST completa para gestión de turnos y agencias
- Interfaz web responsive para solicitud de turnos
- Integración con WhatsApp para notificaciones
- Generación de códigos QR para acceso rápido
- Base de datos PostgreSQL real (sin simulaciones)
- Validación de números de WhatsApp
- Panel de administración de agencias
- Arquitectura modular con TypeScript

## Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL
- **Frontend**: HTML + CSS + JavaScript (servidor estático)
- **Validaciones**: Zod
- **QR Codes**: QRious
- **HTTP Client**: Fetch API
- **Process Manager**: PM2 (recomendado para producción)

## Estructura del Proyecto
```
src/
├── routes/          # Rutas del API y páginas web
├── services/        # Lógica de negocio
├── db/             # Conexión y queries de base de datos
├── types/          # Definiciones TypeScript
├── middleware/     # Middleware Express
├── public/         # Archivos estáticos
└── utils/          # Utilidades compartidas
```

## Funcionalidades Principales
- ✅ API de solicitud de turnos
- ✅ Validación de WhatsApp via Evolution API
- ✅ Generación de QR codes
- ✅ Interfaz web responsive para solicitud de turnos
- ✅ Panel de administración
- ✅ Autenticación JWT de tres capas
- ✅ Conexión PostgreSQL
- ✅ Middleware CORS y body parsing
- ✅ Manejo de errores centralizado
- ✅ Logging de operaciones

## Configuración de Base de Datos
El sistema requiere una base de datos PostgreSQL con el esquema completo de turnos, agencias, clientes, etc.

## Desarrollo
- `npm run dev`: Servidor de desarrollo con recarga automática
- `npm run build`: Compilar TypeScript a JavaScript
- `npm start`: Ejecutar servidor en producción
- `npm run type-check`: Verificar tipos TypeScript

## Arquitectura
Sistema desarrollado en Node.js tradicional con control total del servidor, base de datos PostgreSQL y arquitectura modular separando rutas, servicios y lógica de negocio.