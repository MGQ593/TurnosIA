# ==========================================
# STAGE 1: Builder - Compilar TypeScript
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar backend + frontend
RUN npm run build

# ==========================================
# STAGE 2: Production - Imagen final
# ==========================================
FROM node:18-alpine

# Metadata
LABEL maintainer="tu-email@example.com"
LABEL description="Sistema de Turnos con Node.js + TypeScript + PostgreSQL"

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copiar package.json para instalar solo dependencias de producción
COPY package*.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar archivos compilados desde builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/public ./public

# Copiar archivo .env.example como referencia (NO copiar .env real)
COPY --chown=nodejs:nodejs .env.example ./

# Crear directorio de logs
RUN mkdir -p logs && chown nodejs:nodejs logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["node", "dist/index.js"]
