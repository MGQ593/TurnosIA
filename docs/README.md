# Documentación del Sistema de Turnos

Esta carpeta contiene toda la documentación del proyecto organizada por categorías.

## 📋 Índice

### 🔧 Setup / Configuración
Guías para configurar e instalar el sistema.

- [Docker Deployment](setup/docker.md) - Despliegue con Docker y docker-compose
- [WhatsApp API](setup/whatsapp-api.md) - Configuración de la API de WhatsApp

### 📖 Guides / Guías de Usuario
Manuales de uso del sistema.

- [Panel Administrativo](guides/admin.md) - Guía completa del panel de administración
- [Testing del Sistema](guides/testing.md) - Cómo probar el sistema manualmente
- [Testing de Autenticación](guides/auth-testing.md) - Pruebas de autenticación admin

### 🏗️ Architecture / Arquitectura Técnica
Documentación técnica del sistema.

- [Seguridad JWT](architecture/jwt-security.md) - Implementación de tokens JWT
- [Sistema de Autenticación](architecture/auth-system.md) - Sistema de auth administrativo
- [Sistema de QR](architecture/qr-system.md) - Generación y validación de códigos QR

### 📦 Archive / Histórico
Documentación histórica de migraciones y cambios anteriores.

- Ver carpeta [archive/](archive/) para documentos históricos

---

## 🚀 Primeros Pasos

Si es tu primera vez con el proyecto, lee estos documentos en orden:

1. **README principal** - [../README.md](../README.md)
2. **Configuración inicial** - Dependiendo de tu método:
   - Con Docker: [setup/docker.md](setup/docker.md)
   - Sin Docker: Ver README principal
3. **WhatsApp API** - [setup/whatsapp-api.md](setup/whatsapp-api.md)
4. **Panel Admin** - [guides/admin.md](guides/admin.md)

## 🔍 Buscar Documentación

- **¿Cómo instalar?** → [setup/](setup/)
- **¿Cómo usar el sistema?** → [guides/](guides/)
- **¿Cómo funciona internamente?** → [architecture/](architecture/)
- **¿Cambios históricos?** → [archive/](archive/)

---

**Última actualización**: Octubre 2024
