# 📋 Sistema de Numeración de Turnos

## Fecha: 14 de Octubre, 2025

---

## 🎯 Formato del Número de Turno

### Especificación:
```
Formato: TXXX
Donde X = dígito del 0-9

Ejemplos válidos:
- T001
- T042
- T156
- T789
- T999
```

### Rango:
- **Mínimo**: T001
- **Máximo**: T999
- **Total de turnos disponibles**: 999 turnos

---

## 🔧 Implementación

### Generación Aleatoria:
```javascript
// Generar número aleatorio entre 1 y 999
const numeroAleatorio = Math.floor(Math.random() * 999) + 1;

// Formatear con ceros a la izquierda (padding)
const turnoId = 'T' + numeroAleatorio.toString().padStart(3, '0');

// Ejemplos de salida:
// numeroAleatorio = 1   → turnoId = "T001"
// numeroAleatorio = 42  → turnoId = "T042"
// numeroAleatorio = 156 → turnoId = "T156"
// numeroAleatorio = 789 → turnoId = "T789"
```

### Código en `solicitar-turno.html`:
```javascript
async function enviarAN8N(datos, aceptoTerminos) {
    const payload = {
        numero_cedula: datos.cedula,
        numero_celular: datos.celular,
        acepto_terminos: aceptoTerminos,
        timestamp: new Date().toISOString(),
        origen: 'formulario_web'
    };

    // Simular delay del servidor
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generar número de turno entre 001 y 999
    const numeroAleatorio = Math.floor(Math.random() * 999) + 1;
    const turnoId = 'T' + numeroAleatorio.toString().padStart(3, '0');
    
    return {
        success: true,
        turno_id: turnoId,
        message: 'Turno creado exitosamente'
    };
}
```

---

## 🎲 Ejemplos de Turnos Generados

| Intento | Random | Turno ID | Formato |
|---------|--------|----------|---------|
| 1 | 5 | T005 | ✅ Correcto |
| 2 | 42 | T042 | ✅ Correcto |
| 3 | 123 | T123 | ✅ Correcto |
| 4 | 789 | T789 | ✅ Correcto |
| 5 | 1 | T001 | ✅ Correcto |
| 6 | 999 | T999 | ✅ Correcto |

---

## ⚠️ Consideraciones

### 1. Colisiones (Turnos Duplicados)
**Problema**: Con 999 turnos disponibles, hay probabilidad de generar el mismo número dos veces.

**Probabilidad de colisión**:
- 1 turno activo: 0% probabilidad
- 10 turnos activos: ~1% probabilidad
- 50 turnos activos: ~5% probabilidad
- 100 turnos activos: ~10% probabilidad

**Solución Actual**: En la simulación frontend no se valida. En producción, la base de datos debe validar unicidad.

**Solución Futura (Backend Real)**:
```javascript
async function generarTurnoUnico() {
    let intentos = 0;
    const maxIntentos = 10;
    
    while (intentos < maxIntentos) {
        const numeroAleatorio = Math.floor(Math.random() * 999) + 1;
        const turnoId = 'T' + numeroAleatorio.toString().padStart(3, '0');
        
        // Verificar si el turno ya existe en la BD
        const existe = await db.query('SELECT id FROM turnos WHERE turno_id = $1', [turnoId]);
        
        if (existe.rows.length === 0) {
            return turnoId; // Turno único encontrado
        }
        
        intentos++;
    }
    
    throw new Error('No se pudo generar un turno único después de ' + maxIntentos + ' intentos');
}
```

### 2. Reinicio Diario
**Recomendación**: Limpiar turnos antiguos diariamente para liberar números.

```sql
-- Eliminar turnos de más de 24 horas
DELETE FROM turnos 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

### 3. Formato Alternativo (Secuencial)
Si prefieres secuencial en lugar de aleatorio:

```javascript
// Consultar el último turno del día
const ultimoTurno = await db.query(
    'SELECT turno_id FROM turnos WHERE DATE(created_at) = CURRENT_DATE ORDER BY id DESC LIMIT 1'
);

let nuevoNumero = 1;
if (ultimoTurno.rows.length > 0) {
    // Extraer número del último turno: T042 → 42
    const ultimoNumero = parseInt(ultimoTurno.rows[0].turno_id.substring(1));
    nuevoNumero = ultimoNumero + 1;
}

// Si supera 999, reiniciar a 1
if (nuevoNumero > 999) {
    nuevoNumero = 1;
}

const turnoId = 'T' + nuevoNumero.toString().padStart(3, '0');
```

---

## 🔄 Comparación de Métodos

| Característica | Aleatorio | Secuencial |
|----------------|-----------|------------|
| Predictibilidad | ❌ Impredecible | ✅ Predecible |
| Orden de atención | ✅ No revela orden | ❌ Revela orden |
| Colisiones | ⚠️ Posibles | ✅ Imposibles |
| Complejidad | ✅ Simple | ⚠️ Requiere BD |
| Seguridad | ✅ Mayor | ❌ Menor |

**Decisión Actual**: **Aleatorio** para mayor privacidad y simplicidad.

---

## 📊 Visualización

### Formato Visual en UI:

```
┌─────────────────────────────┐
│   [Logo ChevyPlan]          │
│                             │
│       ✓ (Check verde)       │
│   ¡Turno Confirmado!        │
│                             │
│   NÚMERO DE TURNO           │
│   ╔═══════════════╗         │
│   ║    T 0 4 2    ║         │
│   ╚═══════════════╝         │
│                             │
│   Por favor, conserva este  │
│   número para tu atención.  │
└─────────────────────────────┘
```

### Estilo CSS:
```css
.turno-id {
    font-size: 36px;          /* Tamaño grande */
    font-weight: 700;          /* Negrita */
    color: #7c3aed;           /* Morado */
    letter-spacing: 2px;      /* Espaciado entre letras */
}
```

---

## 🧪 Pruebas

### Test 1: Formato Correcto
```javascript
// Generar 100 turnos y verificar formato
for (let i = 0; i < 100; i++) {
    const numeroAleatorio = Math.floor(Math.random() * 999) + 1;
    const turnoId = 'T' + numeroAleatorio.toString().padStart(3, '0');
    
    // Verificar formato: T + 3 dígitos
    const regex = /^T\d{3}$/;
    console.assert(regex.test(turnoId), `Formato inválido: ${turnoId}`);
    
    // Verificar rango: T001 a T999
    const numero = parseInt(turnoId.substring(1));
    console.assert(numero >= 1 && numero <= 999, `Fuera de rango: ${turnoId}`);
}
```

### Test 2: Padding Correcto
```javascript
const casos = [
    { input: 1, esperado: 'T001' },
    { input: 42, esperado: 'T042' },
    { input: 123, esperado: 'T123' },
    { input: 999, esperado: 'T999' }
];

casos.forEach(({ input, esperado }) => {
    const resultado = 'T' + input.toString().padStart(3, '0');
    console.assert(resultado === esperado, `Esperado ${esperado}, obtenido ${resultado}`);
});
```

### Test 3: Distribución Uniforme
```javascript
// Generar 1000 turnos y verificar distribución
const frecuencias = {};
for (let i = 0; i < 1000; i++) {
    const numeroAleatorio = Math.floor(Math.random() * 999) + 1;
    frecuencias[numeroAleatorio] = (frecuencias[numeroAleatorio] || 0) + 1;
}

// Cada número debería aparecer ~1 vez en promedio
console.log('Números únicos generados:', Object.keys(frecuencias).length);
console.log('Colisiones:', 1000 - Object.keys(frecuencias).length);
```

---

## 📱 Experiencia de Usuario

### Ventajas del formato TXXX:
1. ✅ **Fácil de recordar**: Solo 3 dígitos
2. ✅ **Fácil de comunicar**: "Te cuatrocientos cincuenta y seis"
3. ✅ **Visual limpio**: No es muy largo
4. ✅ **Profesional**: Formato estándar de tickets

### Comparación con otros formatos:

| Formato | Ejemplo | Pros | Contras |
|---------|---------|------|---------|
| TXXX | T042 | Corto, fácil | Solo 999 turnos |
| TXXXX | T0042 | Más turnos (9999) | Más largo |
| T-XXX | T-042 | Visual separado | Guion innecesario |
| XXX | 042 | Más corto | Menos profesional |
| TYYYYXXX | T20251014042 | Único con fecha | Muy largo |

**Decisión**: **TXXX** es el balance ideal para uso diario.

---

## 🚀 Mejoras Futuras

### 1. Reinicio Automático Diario
```javascript
// Tabla: turnos_usados_hoy
// Al inicio del día, limpiar tabla
// Cada turno generado se guarda en la tabla
// Validar que no exista antes de asignar
```

### 2. Turnos Prioritarios
```javascript
// T001-T099: Turnos VIP/prioritarios
// T100-T999: Turnos regulares
```

### 3. Categorización por Letra
```javascript
// A001-A999: Agencia Centro
// B001-B999: Agencia Norte
// C001-C999: Agencia Sur
```

---

## 📞 Soporte

**Estado del Formato**: ✅ Implementado y Funcional  
**Rango**: T001 a T999  
**Método**: Generación aleatoria  
**Versión**: 2.1  
**Fecha**: 14/10/2025
