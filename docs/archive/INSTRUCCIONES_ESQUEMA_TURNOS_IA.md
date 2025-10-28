# Instrucciones para Crear el Esquema turnos_ia

## 📋 Paso 1: Ejecutar el Script SQL

Tienes dos opciones para ejecutar el script `init-db-turnos-ia.sql`:

### Opción A: Usando DBeaver u otro cliente SQL

1. Abre DBeaver
2. Conéctate a la base de datos:
   - Host: `68.154.24.20`
   - Puerto: `2483`
   - Base de datos: `agente_ia`
   - Usuario: `scpchevy`
   - Contraseña: `Slmx.89*`

3. Abre el archivo `init-db-turnos-ia.sql`
4. Ejecuta todo el script (Ctrl+Enter o botón Execute)
5. Verifica que se crearon las tablas:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'turnos_ia' 
   ORDER BY table_name;
   ```

### Opción B: Usando psql (si lo tienes instalado)

```bash
# En PowerShell
$env:PGPASSWORD='Slmx.89*'
psql -h 68.154.24.20 -p 2483 -U scpchevy -d agente_ia -f init-db-turnos-ia.sql
```

## ✅ Verificar que se creó correctamente

Ejecuta esta consulta para verificar:

```sql
-- Ver todas las tablas en el esquema turnos_ia
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'turnos_ia' 
ORDER BY table_name;
```

Deberías ver:
- `agencias`
- `clientes`
- `turnos`

## 📊 Verificar datos iniciales

```sql
-- Ver las agencias creadas
SELECT * FROM turnos_ia.agencias;
```

Deberías ver 3 agencias de ejemplo.

## 🚀 Paso 2: Reiniciar la aplicación

Una vez creado el esquema y las tablas, reinicia el servidor Node.js:

```bash
node start-with-url.js
```

El servidor ahora usará el esquema `turnos_ia` automáticamente gracias a la configuración:
```typescript
options: '-c search_path=turnos_ia,public'
```

## 📝 Notas Importantes

1. **El esquema `turnos_ia` es independiente** del esquema `public`, así que no afectará las tablas existentes
2. **Todas las queries** están configuradas para usar `turnos_ia` explícitamente
3. **Las foreign keys** están configuradas correctamente entre las tablas del nuevo esquema
4. **Los triggers** de `updated_at` están configurados automáticamente

## 🔍 Consultas Útiles

```sql
-- Ver estructura de la tabla clientes
\d turnos_ia.clientes

-- Ver estructura de la tabla turnos
\d turnos_ia.turnos

-- Ver estructura de la tabla agencias
\d turnos_ia.agencias

-- Contar registros
SELECT 
    'clientes' as tabla, COUNT(*) as total FROM turnos_ia.clientes
UNION ALL
SELECT 
    'turnos' as tabla, COUNT(*) as total FROM turnos_ia.turnos
UNION ALL
SELECT 
    'agencias' as tabla, COUNT(*) as total FROM turnos_ia.agencias;
```
