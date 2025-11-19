# ====================================
# PAYNOVA AUTOMATION - SETUP SCRIPT (PowerShell)
# ====================================
# Este script configura el entorno de pruebas automatizadas en Windows
# Autor: Adrian Rondan
# Fecha: Noviembre 2025

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PAYNOVA AUTOMATION - SETUP SCRIPT           ║" -ForegroundColor Cyan
Write-Host "║   Configuración automática del entorno        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Función para verificar comandos
function Test-Command {
    param($Command)
    
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            Write-Host "✓ $Command está instalado" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "✗ $Command NO está instalado" -ForegroundColor Red
        return $false
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📋 PASO 1: Verificando pre-requisitos" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Verificar Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "  └─ Versión: $nodeVersion" -ForegroundColor Gray
    
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 16) {
        Write-Host "⚠ Node.js versión 16+ es requerida" -ForegroundColor Yellow
        exit 1
    }
}
else {
    Write-Host "Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verificar npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "  └─ Versión: $npmVersion" -ForegroundColor Gray
}
else {
    Write-Host "Error: npm no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📦 PASO 2: Instalando dependencias" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Dependencias instaladas correctamente" -ForegroundColor Green
}
else {
    Write-Host "✗ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🌐 PASO 3: Instalando navegadores de Playwright" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

npx playwright install chromium

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Navegadores instalados correctamente" -ForegroundColor Green
}
else {
    Write-Host "✗ Error al instalar navegadores" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📁 PASO 4: Creando directorios necesarios" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$directories = @("screenshots", "reports", "videos")

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Directorio creado: $dir/" -ForegroundColor Green
    }
    else {
        Write-Host "✓ Directorio ya existe: $dir/" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "⚙️  PASO 5: Configurando variables de entorno" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✓ Archivo .env creado desde env.example" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ Archivo env.example no encontrado" -ForegroundColor Yellow
    }
}
else {
    Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ PASO 6: Verificando instalación" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Verificar Playwright
try {
    $playwrightVersion = npx playwright --version 2>&1
    Write-Host "✓ Playwright: $playwrightVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Playwright no está configurado correctamente" -ForegroundColor Red
}

# Verificar Cucumber
try {
    $cucumberVersion = npx cucumber-js --version 2>&1
    Write-Host "✓ Cucumber: $cucumberVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ Cucumber no está configurado correctamente" -ForegroundColor Red
}

# Verificar TypeScript
try {
    $tscVersion = npx tsc --version 2>&1
    Write-Host "✓ TypeScript: $tscVersion" -ForegroundColor Green
}
catch {
    Write-Host "✗ TypeScript no está configurado correctamente" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🧪 PASO 7: ¿Ejecutar prueba de verificación?" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "¿Deseas ejecutar las pruebas ahora? (s/n)"

if ($response -match '^[SsYy]$') {
    Write-Host ""
    Write-Host "Ejecutando pruebas..." -ForegroundColor Cyan
    Write-Host ""
    npm test
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ ¡Pruebas ejecutadas exitosamente!" -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "⚠ Algunas pruebas fallaron. Revisa los logs arriba." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          ✅ SETUP COMPLETADO                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Lee el README.md para guía completa"
Write-Host "  2. Ejecuta 'npm test' para correr todas las pruebas"
Write-Host "  3. Ejecuta 'npm run test:login' para solo pruebas de login"
Write-Host "  4. Revisa COMMANDS.md para todos los comandos disponibles"
Write-Host ""
Write-Host "🎉 ¡Listo para automatizar! Happy testing!" -ForegroundColor Green
Write-Host ""

