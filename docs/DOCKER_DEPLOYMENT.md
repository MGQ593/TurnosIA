# 🐳 Guía de Despliegue con Docker

## Tabla de Contenidos
- [Descripción](#descripción)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Comandos Principales](#comandos-principales)
- [Arquitectura de Contenedores](#arquitectura-de-contenedores)
- [Producción](#producción)
- [Troubleshooting](#troubleshooting)

---

## Descripción

El sistema está containerizado con Docker utilizando:
- **Multi-stage build**: Compilación de TypeScript en una etapa separada
- **PostgreSQL**: Base de datos en contenedor independiente
- **Docker Compose**: Orquestación de servicios
- **Health checks**: Monitoreo automático de servicios
- **Volúmenes persistentes**: Datos de PostgreSQL y logs de aplicación

## Requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 5GB espacio en disco

## Configuración

### 1. Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
# Crear archivo .env desde la plantilla
cp .env.docker .env
```

Edita `.env` con tus credenciales:

```env
# Base de Datos
DB_PASSWORD=TuPasswordSegura123!

# JWT
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres

# Admin
ADMIN_USERNAME=tu_usuario
ADMIN_PASSWORD=TuPasswordAdmin2025!

# WhatsApp API
WHATSAPP_API_URL=https://tu-servidor/api/whatsapp
WHATSAPP_API_TOKEN=tu-token-de-api
```

### 2. Archivo SQL de Inicialización

El archivo `init-db.sql` se ejecuta automáticamente al crear el contenedor de PostgreSQL por primera vez. Incluye:
- Creación de tablas (agencias, clientes, turnos)
- Índices para rendimiento
- Triggers para actualización automática
- Datos iniciales de agencias
- Funciones auxiliares (generar número de turno)
- Vistas para estadísticas

## Comandos Principales

### Desarrollo

```bash
# Iniciar todos los servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f postgres

# Reiniciar un servicio
docker-compose restart app

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v
```

### Desarrollo con Adminer (Gestor de DB)

```bash
# Iniciar con Adminer incluido
docker-compose --profile dev up

# Acceder a Adminer
# http://localhost:8080
# Server: postgres
# Username: turnos_user
# Password: (el configurado en DB_PASSWORD)
# Database: turnos_db
```

### Construir Imagen

```bash
# Construir imagen sin caché
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up --build
```

### Acceder a Contenedores

```bash
# Shell en el contenedor de la app
docker-compose exec app sh

# Shell en PostgreSQL
docker-compose exec postgres psql -U turnos_user -d turnos_db

# Ver procesos en ejecución
docker-compose ps

# Ver uso de recursos
docker stats
```

## Arquitectura de Contenedores

### Dockerfile Multi-Stage

```
STAGE 1: Builder
├── node:18-alpine
├── Instalar todas las dependencias (dev + prod)
├── Copiar código fuente
├── npm run build (compila backend + frontend)
└── Genera /app/dist y /app/public/js

STAGE 2: Production
├── node:18-alpine (imagen limpia)
├── Copiar solo dependencies de producción
├── Copiar archivos compilados desde builder
├── Usuario no-root (seguridad)
└── Imagen final optimizada (~150MB)
```

### Servicios en docker-compose.yml

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **app** | 3000 | Aplicación Node.js (API + Frontend) |
| **postgres** | 5432 | Base de datos PostgreSQL |
| **adminer** | 8080 | Gestor web de DB (solo con --profile dev) |

### Volúmenes

- `postgres-data`: Persistencia de base de datos
- `./logs`: Logs de aplicación (bind mount)

### Red

- `turnos-network`: Red bridge interna para comunicación entre contenedores

## Producción

### 1. Variables de Entorno

En producción, **NO uses** archivo `.env`. Configura variables directamente en tu plataforma:

**Docker Swarm:**
```bash
docker secret create jwt_secret jwt_secret.txt
docker secret create db_password db_password.txt
```

**Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: turnos-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded>
  db-password: <base64-encoded>
```

**Docker Run:**
```bash
docker run -d \
  -e DB_PASSWORD=SecurePassword \
  -e JWT_SECRET=SecretKey \
  -p 3000:3000 \
  turnos-app
```

### 2. Build de Producción

```bash
# Construir imagen optimizada
NODE_ENV=production docker-compose build

# Tag para registry
docker tag turnos-app:latest registry.example.com/turnos-app:v1.0.0

# Subir a registry
docker push registry.example.com/turnos-app:v1.0.0
```

### 3. Proxy Reverso (Nginx/Traefik)

Ejemplo de configuración Nginx:

```nginx
server {
    listen 80;
    server_name turnos.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Monitoreo

El contenedor incluye health checks:

```bash
# Ver estado de salud
docker inspect --format='{{.State.Health.Status}}' turnos-app

# Health check manual
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-01-19T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Troubleshooting

### Problema: La aplicación no se conecta a PostgreSQL

**Solución:**
```bash
# Verificar que PostgreSQL esté healthy
docker-compose ps

# Ver logs de PostgreSQL
docker-compose logs postgres

# Verificar que el nombre del host sea correcto
docker-compose exec app cat /etc/hosts | grep postgres
```

### Problema: Build falla por falta de memoria

**Solución:**
```bash
# Aumentar memoria de Docker (Docker Desktop)
# Settings > Resources > Memory > 4GB+

# O usar build sin caché
docker-compose build --no-cache --memory=4g
```

### Problema: Puerto 3000 ya está en uso

**Solución:**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Cambiar puerto en docker-compose.yml
ports:
  - "8000:3000"  # Usar puerto 8000 externamente
```

### Problema: Datos de PostgreSQL no persisten

**Solución:**
```bash
# Verificar que el volumen existe
docker volume ls | findstr postgres-data

# Inspeccionar volumen
docker volume inspect turnos-app_postgres-data

# Si no existe, reiniciar servicios
docker-compose down
docker-compose up -d
```

### Problema: Frontend no carga (404 en archivos JS)

**Solución:**
```bash
# Verificar que el build se completó
docker-compose exec app ls -la /app/public/js/

# Reconstruir imagen
docker-compose build --no-cache app
docker-compose up -d app

# Ver logs del build
docker-compose logs app | grep "Build"
```

### Problema: Actualización del código no se refleja

**Solución:**
```bash
# Reconstruir imagen
docker-compose build --no-cache

# Reiniciar servicios
docker-compose up -d --force-recreate
```

### Resetear Todo (¡CUIDADO! Borra todos los datos)

```bash
# Detener y eliminar todo
docker-compose down -v

# Eliminar imágenes
docker rmi turnos-app

# Limpiar sistema Docker
docker system prune -a --volumes

# Iniciar desde cero
docker-compose up --build
```

## Checklist de Despliegue

### Pre-despliegue
- [ ] Variables de entorno configuradas en `.env`
- [ ] JWT_SECRET tiene al menos 32 caracteres
- [ ] Passwords cambiadas (no usar defaults)
- [ ] WhatsApp API configurada y funcionando
- [ ] Puerto 3000 disponible

### Build
- [ ] `docker-compose build` exitoso
- [ ] Imagen creada sin errores
- [ ] Tamaño de imagen razonable (~150MB)

### Primer Inicio
- [ ] PostgreSQL healthy: `docker-compose ps`
- [ ] Base de datos inicializada: `docker-compose logs postgres | grep "✓"`
- [ ] Aplicación healthy: `curl http://localhost:3000/api/health`
- [ ] Frontend accesible: `http://localhost:3000/solicitar-turno.html`

### Post-despliegue
- [ ] Crear primer turno de prueba
- [ ] Verificar notificación WhatsApp
- [ ] Verificar QR code generado
- [ ] Probar login admin
- [ ] Verificar logs: `docker-compose logs -f`

## Recursos Útiles

- [Documentación Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Notas Importantes:**
- En producción, usa secrets para variables sensibles
- Configura backups automáticos de PostgreSQL
- Monitorea uso de recursos con `docker stats`
- Actualiza imágenes base regularmente por seguridad
