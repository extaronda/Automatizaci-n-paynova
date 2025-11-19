# 🎭 Paynova Test Automation

> Proyecto de automatización de pruebas E2E para **Paynova** usando Playwright + Cucumber + TypeScript

[![Playwright](https://img.shields.io/badge/Playwright-1.41.2-green.svg)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-10.0.1-brightgreen.svg)](https://cucumber.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#%EF%B8%8F-configuración)
- [Ejecución de Tests](#-ejecución-de-tests)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Escribir Nuevos Tests](#%EF%B8%8F-escribir-nuevos-tests)
- [Reportes](#-reportes)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Características

- ✅ **BDD con Cucumber**: Tests escritos en Gherkin (lenguaje natural)
- ✅ **Page Object Model**: Código mantenible y reutilizable
- ✅ **TypeScript**: Type-safe y mejor experiencia de desarrollo
- ✅ **Multi-Browser**: Chromium, Firefox, WebKit
- ✅ **Reportes Profesionales**: HTML interactivo con charts
- ✅ **Multi-Ambiente**: DEV, UAT con configuración por `.env`
- ✅ **Data-Driven**: Datos externalizados en JSON
- ✅ **Screenshots**: Capturas automáticas en fallos
- ✅ **Modular**: Features separadas por área (RRHH, VIDA, Login)

---

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.x ([Descargar](https://nodejs.org/))
- **npm** >= 9.x (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

Verificar instalación:

```bash
node --version  # v18.x o superior
npm --version   # 9.x o superior
```

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd automation/tests
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará:
- Playwright (con navegadores)
- Cucumber
- TypeScript
- Dependencias de reportes

### 3. Instalar navegadores de Playwright

```bash
npx playwright install chromium
```

O todos los navegadores:

```bash
npx playwright install
```

---

## ⚙️ Configuración

### Variables de Entorno

El proyecto usa archivos `.env` para configuración por ambiente:

**`.env`** (Base - ya existe)
```bash
BASE_URL=https://paynova-uat.interseguro.com.pe
BROWSER=chromium
HEADLESS=false
DEFAULT_TIMEOUT=60000
```

**`.env.uat`** (UAT - ya existe)
```bash
BASE_URL=https://paynova-uat.interseguro.com.pe
```

**`.env.dev`** (DEV - crear si es necesario)
```bash
BASE_URL=https://paynova-dev.interseguro.com.pe
```

### Usuarios de Prueba

Los usuarios están definidos en `test-data/usuarios.json`:

```json
{
  "registradores": {
    "rrhh": {
      "username": "adrian",
      "password": "123",
      "area": "RRHH",
      "memos": ["JUICIO DE ALIMENTOS", "ADELANTO GRATIFICACIÓN"]
    },
    "vida": {
      "username": "jcastroc",
      "password": "password123",
      "area": "VIDA",
      "memos": ["PAGO DE SOBREVIVENCIA", "RESCATE POLIZA CON PRESTAMO"]
    }
  }
}
```

---

## 🚀 Ejecución de Tests

### Scripts Disponibles

| Script | Descripción | Comando |
|--------|-------------|---------|
| **Todos los tests** | Ejecuta todas las features | `npm test` |
| **Solo Login** | Ejecuta pruebas de login | `npm run test:login` |
| **Solo RRHH** | Ejecuta solicitudes RRHH | `npm run test:solicitud` |
| **Solo VIDA** | Ejecuta solicitudes VIDA | `npm run test:vida` |
| **Ambiente DEV** | Ejecuta en DEV | `npm run test:dev` |
| **Ambiente UAT** | Ejecuta en UAT | `npm run test:uat` |
| **Modo Headless** | Sin interfaz gráfica | `npm run test:headless` |
| **Ver Reporte** | Abre el reporte HTML | `npm run open:report` |

### Ejemplos de Uso

```bash
# 1. Ejecutar solo tests de VIDA en UAT
npm run test:vida

# 2. Ejecutar en modo headless (sin navegador visible)
npm run test:headless

# 3. Ejecutar con Firefox
npm run test:firefox

# 4. Ver el último reporte generado
npm run open:report

# 5. Ejecutar con tags específicos
npm run test:tags -- "@smoke"
```

### Ejecución por Ambiente

```bash
# Desarrollo
npm run test:dev

# UAT (por defecto)
npm run test:uat

# Producción (requiere configurar .env.prod)
npm run test:prod
```

### Opciones Avanzadas

```bash
# Ejecutar con un browser específico
BROWSER=firefox npm run test:vida

# Ejecutar en modo headless
HEADLESS=true npm run test:vida

# Ejecutar con timeout personalizado
DEFAULT_TIMEOUT=90000 npm run test:vida
```

### Ejecución por Tags

El proyecto usa **tags simples y organizados** para ejecutar tests por módulo:

```bash
# ===== EJECUTAR POR MÓDULO =====

# Login (2 escenarios)
npm run test:tags -- "@login"

# Registrar Solicitud RRHH (8 escenarios)
npm run test:tags -- "@registrar-rrhh"

# Registrar Solicitud VIDA (33 escenarios)
npm run test:tags -- "@registrar-vida"


# ===== EJECUTAR POR TIPO =====

# Solo happy paths (casos exitosos)
npm run test:tags -- "@happy-path"

# Solo unhappy paths (casos de error)
npm run test:tags -- "@unhappy-path"

# Solo tests de regresión completa
npm run test:tags -- "@regresion"


# ===== COMBINACIONES =====

# Solo VIDA happy path (1 escenario)
npm run test:tags -- "@registrar-vida and @happy-path"

# Solo RRHH happy path (1 escenario)
npm run test:tags -- "@registrar-rrhh and @happy-path"

# Todo excepto regresión (tests rápidos)
npm run test:tags -- "not @regresion"

# Solo Login y RRHH (sin VIDA)
npm run test:tags -- "@login or @registrar-rrhh"
```

### Tags Disponibles (Simplificados)

| Tag | Descripción | Escenarios | Tiempo |
|-----|-------------|------------|--------|
| **Por Módulo** ||||
| `@login` | Tests de autenticación | 2 | 15s |
| `@registrar-rrhh` | Tests de registro RRHH | 8 | 3m |
| `@registrar-vida` | Tests de registro VIDA | 33 | ~16m |
| **Por Tipo** ||||
| `@happy-path` | Casos exitosos | 3 | 2m |
| `@validacion-bancos` | Validar todos los bancos en 1 sesión | 2 | 3m |
| `@validacion-campos` | Validar campos obligatorios | 1 | 30s |
| `@validacion-negocio` | **NUEVO: Validar reglas de banco/moneda** | 6 | 4m |
| `@regresion` | Regresión completa | 20 | 10m |

**⚡ Mejoras**:
- `@validacion-bancos`: Validan **5 bancos (BCP Ahorros/Corriente)** en 1 sesión, **60% más rápido**
- `@validacion-negocio`: Validan que no se puedan mezclar bancos/monedas diferentes y sí se puedan múltiples con mismo banco/moneda

---

## 📁 Estructura del Proyecto

```
tests/
├── src/
│   ├── features/                 # Archivos .feature (Gherkin)
│   │   ├── login.feature         # Pruebas de login
│   │   ├── registrar-solicitud.feature      # RRHH
│   │   └── registrar-solicitud-vida.feature # VIDA
│   │
│   ├── pages/                    # Page Objects
│   │   ├── LoginPage.ts
│   │   └── RegistrarSolicitudPage.ts
│   │
│   ├── step-definitions/         # Implementación de steps
│   │   ├── login.steps.ts
│   │   ├── registrar-solicitud.steps.ts
│   │   └── registrar-solicitud-vida.steps.ts
│   │
│   ├── hooks/                    # Setup/Teardown
│   │   └── hooks.ts
│   │
│   └── helper/                   # Utilidades
│       ├── browsers/browserManager.ts
│       ├── env/env.ts
│       ├── data-loader.ts
│       └── report.ts
│
├── test-data/                    # Datos de prueba
│   ├── usuarios.json
│   └── solicitudes.json
│
├── test-results/                 # Resultados de ejecución
│   ├── json/                     # JSON de Cucumber
│   └── reports/                  # Reportes HTML
│
├── screenshots/                  # Screenshots de fallos
│
├── config/                       # Configuraciones
│   ├── cucumber.js               # Config principal
│   ├── cucumber.vida.js          # Config VIDA
│   ├── cucumber.rrhh.js          # Config RRHH
│   └── cucumber.login.js         # Config Login
│
├── .env                          # Variables base
├── .env.uat                      # Variables UAT
├── package.json                  # Dependencias
└── tsconfig.json                 # Config TypeScript
```

---

## ✍️ Escribir Nuevos Tests

### 1. Crear Feature File

`src/features/mi-nueva-feature.feature`

```gherkin
# language: es
Característica: Mi Nueva Funcionalidad
  Como usuario del sistema
  Quiero realizar una acción
  Para lograr un objetivo

  @smoke @mi-feature
  Escenario: Escenario de ejemplo
    Dado que estoy en la página principal
    Cuando hago clic en el botón
    Entonces debería ver un mensaje de éxito
```

### 2. Crear Page Object

`src/pages/MiNuevaPage.ts`

```typescript
import { Page } from '@playwright/test';

export class MiNuevaPage {
  readonly page: Page;
  
  private readonly selectors = {
    boton: 'button.mi-boton',
    mensaje: '.mensaje-exito'
  };

  constructor(page: Page) {
    this.page = page;
  }

  async hacerClicEnBoton() {
    await this.page.click(this.selectors.boton);
  }

  async verificarMensaje(): Promise<boolean> {
    return await this.page.isVisible(this.selectors.mensaje);
  }
}
```

### 3. Crear Step Definitions

`src/step-definitions/mi-nueva-feature.steps.ts`

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { MiNuevaPage } from '../pages/MiNuevaPage';

Given('que estoy en la página principal', async function() {
  await global.page.goto('/');
});

When('hago clic en el botón', async function() {
  const page = new MiNuevaPage(global.page);
  await page.hacerClicEnBoton();
});

Then('debería ver un mensaje de éxito', async function() {
  const page = new MiNuevaPage(global.page);
  const visible = await page.verificarMensaje();
  expect(visible).toBeTruthy();
});
```

### 4. Crear Configuración Específica (Opcional)

`config/cucumber.mi-feature.js`

```javascript
module.exports = {
  default: {
    paths: ["src/features/mi-nueva-feature.feature"],
    require: ["src/step-definitions/**/*.ts", "src/hooks/**/*.ts"],
    requireModule: ["ts-node/register"],
    format: ["progress-bar", "json:./test-results/json/cucumber-report.json"],
    parallel: 1
  }
}
```

### 5. Agregar Script en package.json

```json
{
  "scripts": {
    "test:mi-feature": "cross-env ENV=uat BROWSER=chromium cucumber-js --config=config/cucumber.mi-feature.js"
  }
}
```

---

## 📊 Reportes

### Generar Reporte

Los reportes se generan **automáticamente** después de cada ejecución:

```bash
npm run test:vida
# Genera: test-results/reports/index.html
```

### Ver Reporte

```bash
npm run open:report
```

O abrir manualmente: `test-results/reports/index.html`

### Características del Reporte

- 📈 **Gráficos**: Pasados vs Fallados
- ⏱️ **Duración**: Tiempo de cada escenario
- 📸 **Screenshots**: En fallos
- 🔍 **Detalle**: Stack trace de errores
- 🏷️ **Tags**: Filtrado por tags
- 📱 **Responsive**: Diseño adaptable

### Ejemplo de Reporte

![Reporte Ejemplo](https://via.placeholder.com/800x400?text=Reporte+HTML+Profesional)

---

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Error: "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 2. Browser no abre / Timeout

```bash
# Verificar que Playwright instaló los navegadores
npx playwright install chromium

# O reinstalar todos
npx playwright install
```

#### 3. Tests Muy Lentos

```bash
# Ejecutar en headless
npm run test:headless

# O deshabilitar screenshots automáticos
# Editar src/hooks/hooks.ts y comentar AfterStep
```

#### 4. Error de Variables de Entorno

```bash
# Verificar que existen los archivos .env
ls -la .env*

# Si no existen, copiar desde ejemplo
cp .env.example .env
```

#### 5. Tests Fallan en CI/CD

```bash
# Asegurarse de ejecutar en headless
HEADLESS=true npm run test

# E instalar dependencias del sistema (Linux)
npx playwright install-deps
```

### Debug Mode

```bash
# Ver logs detallados de Playwright
DEBUG=pw:api npm run test:vida

# Ver logs de Cucumber
DEBUG=cucumber:* npm run test:vida

# Ambos
DEBUG=* npm run test:vida
```

### Limpiar Resultados Anteriores

```bash
npm run clean
```

---

## 📝 Best Practices

### 1. Nomenclatura

- **Features**: `kebab-case.feature`
- **Page Objects**: `PascalCase.ts`
- **Steps**: `kebab-case.steps.ts`
- **Variables**: `camelCase`

### 2. Selectores

Preferir selectores **estables**:

```typescript
// ✅ Bueno
'button[data-testid="submit"]'
'input[name="username"]'

// ❌ Malo
'div > div > button:nth-child(3)'
'.css-abc123'
```

### 3. Waits

Usar esperas **explícitas**:

```typescript
// ✅ Bueno
await page.waitForSelector('.modal', { state: 'visible' });

// ❌ Malo
await page.waitForTimeout(5000);
```

### 4. Assertions

Usar `expect` de Playwright:

```typescript
import { expect } from '@playwright/test';

// ✅ Bueno
await expect(page.locator('.mensaje')).toBeVisible();

// ❌ Malo
const visible = await page.isVisible('.mensaje');
assert(visible === true);
```

### 5. Data-Driven

Externalizar datos:

```typescript
// ✅ Bueno
const usuario = getUsuarioPorNombre('vida');

// ❌ Malo
const username = 'jcastroc';
const password = 'password123';
```

---

## 🤝 Contribuir

### Workflow

1. Crear rama desde `main`
2. Escribir tests siguiendo los patrones
3. Ejecutar tests localmente
4. Hacer commit con mensaje descriptivo
5. Crear Pull Request

### Commit Messages

```bash
feat: Agregar tests para módulo X
fix: Corregir selector en LoginPage
docs: Actualizar README con nuevos scripts
refactor: Mejorar Page Object de Registro
```

---

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Guía de Cucumber](https://cucumber.io/docs/guides/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Arquitectura del Proyecto](./ARCHITECTURE.md)
- [Contexto e Historial](./PROJECT_CONTEXT.md)

---

## 📄 Licencia

Proyecto interno de **Interseguro** - Uso restringido

---

## 👥 Equipo

**QA Automation Team - Interseguro**

Para soporte o preguntas, contactar al equipo de QA.

---

## 🎯 Próximos Pasos

Después de instalar y ejecutar los tests:

1. ✅ Ejecuta `npm run test:login` para verificar la instalación
2. ✅ Revisa el reporte en `test-results/reports/index.html`
3. ✅ Explora los features existentes en `src/features/`
4. ✅ Lee la [Arquitectura](./ARCHITECTURE.md) para entender la estructura
5. ✅ Crea tu primer test siguiendo la guía de [Escribir Nuevos Tests](#%EF%B8%8F-escribir-nuevos-tests)

---

**¡Happy Testing! 🚀**
