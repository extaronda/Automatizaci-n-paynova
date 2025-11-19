# 🎯 Suites de Tests Organizadas

Este documento explica cómo ejecutar las suites de tests organizadas para sustentar las pruebas de manera ordenada.

## 📋 Suites Disponibles

### 1. **Suite Completa** (`@suite-completa`)
Ejecuta todos los tests principales en orden:
- ✅ Login
- ✅ Registro RRHH
- ✅ Registro VIDA (3 memos)
- ✅ Aprobación VIDA (3 memos)

**Comando:**
```bash
npm run test:suite:completa:orden
```

### 2. **Suite Smoke** (`@suite-smoke`)
Tests básicos de humo:
- ✅ Login exitoso

**Comando:**
```bash
npm run test:suite:smoke
```

### 3. **Suite RRHH** (`@suite-rrhh`)
Tests de registro para área RRHH:
- ✅ Validación de dígitos de todos los bancos

**Comando:**
```bash
npm run test:suite:rrhh
```

### 4. **Suite VIDA - Registro** (`@suite-vida-registro`)
Tests de registro para área VIDA (3 escenarios):
- ✅ PAGO DE SOBREVIVENCIA
- ✅ RESCATE POLIZA CON PRESTAMO
- ✅ PAGO DE MULTAS, COSTAS y CARGOS

**Comando:**
```bash
npm run test:suite:vida:registro
```

### 5. **Suite VIDA - Aprobación** (`@suite-vida-aprobacion`)
Tests de aprobación para área VIDA (3 escenarios):
- ✅ APROBAR PAGO DE SOBREVIVENCIA
- ✅ APROBAR RESCATE POLIZA CON PRESTAMO
- ✅ APROBAR PAGO DE MULTAS, COSTAS y CARGOS

**Comando:**
```bash
npm run test:suite:vida:aprobacion
```

### 6. **Suite VIDA Completa** (`@suite-vida`)
Todos los tests de VIDA (registro + aprobación):
- ✅ Registro VIDA (3 escenarios)
- ✅ Aprobación VIDA (3 escenarios)

**Comando:**
```bash
npm run test:suite:vida
```

## 🚀 Flujo Recomendado para Sustentación

### Opción 1: Ejecutar Todo en Orden (Recomendado)
```bash
npm run test:suite:completa:orden
```

Este comando ejecuta automáticamente:
1. Login
2. Registro RRHH
3. Registro VIDA (3 memos)
4. Aprobación VIDA (3 memos)
5. Genera reporte final

### Opción 2: Ejecutar por Módulos
```bash
# 1. Login
npm run test:suite:smoke

# 2. Registro RRHH
npm run test:suite:rrhh

# 3. Registro VIDA (crea las 3 solicitudes)
npm run test:suite:vida:registro

# 4. Aprobación VIDA (aprueba las 3 solicitudes)
npm run test:suite:vida:aprobacion

# 5. Generar reporte
npm run posttest:uat
```

## 📊 Estructura de Tags

Los tags están organizados de la siguiente manera:

| Tag | Descripción | Escenarios |
|-----|-------------|------------|
| `@suite-completa` | Todos los tests principales | 8 |
| `@suite-smoke` | Tests básicos | 1 |
| `@suite-rrhh` | Tests RRHH | 1 |
| `@suite-vida` | Todos los tests VIDA | 6 |
| `@suite-vida-registro` | Registro VIDA | 3 |
| `@suite-vida-aprobacion` | Aprobación VIDA | 3 |

## 🎯 Orden de Ejecución para Sustentación

Para una sustentación completa, ejecuta en este orden:

1. **Login** → Verifica autenticación
2. **Registro RRHH** → Valida registro de solicitudes RRHH
3. **Registro VIDA** → Crea 3 solicitudes (una por cada memo)
4. **Aprobación VIDA** → Aprueba las 3 solicitudes creadas

## 📝 Notas Importantes

- ⚠️ **El archivo `solicitudes-creadas.json` NO se limpia automáticamente** para que los tests de aprobación puedan usar las solicitudes creadas en los tests de registro.
- ✅ Los screenshots se limpian automáticamente al inicio de cada ejecución.
- 📊 El reporte HTML se genera automáticamente después de cada suite.
- 🔄 Para limpiar manualmente: borra `test-data/solicitudes-creadas.json` si necesitas empezar desde cero.

## 🛠️ Comandos Adicionales

```bash
# Ver reporte generado
npm run open:report

# Limpiar screenshots y solicitudes-creadas.json
npm run clean:data

# Ejecutar en modo headless (sin navegador visible)
HEADLESS=true npm run test:suite:completa

# Limpiar resultados anteriores (incluye node_modules)
npm run clean
```

