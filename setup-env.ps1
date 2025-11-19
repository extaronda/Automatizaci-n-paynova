# ═══════════════════════════════════════════════════
# PAYNOVA AUTOMATION - SETUP ENVIRONMENT FILES
# ═══════════════════════════════════════════════════
# Este script crea los archivos .env necesarios

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PAYNOVA - SETUP ENVIRONMENT FILES           ║" -ForegroundColor Cyan
Write-Host "║   Creando archivos .env                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Contenido .env.uat
$envUat = @"
# ═══════════════════════════════════════
# PAYNOVA - ENTORNO UAT
# ═══════════════════════════════════════

# URLs
BASE_URL=https://paynova-uat.interseguro.com.pe
LOGIN_URL=https://paynova-uat.interseguro.com.pe/login

# Credenciales de prueba
TEST_USERNAME=adrian
TEST_PASSWORD=123

# Configuración de Browser
BROWSER=chromium
HEADLESS=false
SLOW_MO=100
TIMEOUT=60000

# Grabación de video
RECORD_VIDEO=false
"@

# Contenido .env.dev
$envDev = @"
# ═══════════════════════════════════════
# PAYNOVA - ENTORNO DEV
# ═══════════════════════════════════════

# URLs
BASE_URL=https://paynova-dev.interseguro.com.pe
LOGIN_URL=https://paynova-dev.interseguro.com.pe/login

# Credenciales de prueba
TEST_USERNAME=adrian
TEST_PASSWORD=123

# Configuración de Browser
BROWSER=chromium
HEADLESS=false
SLOW_MO=100
TIMEOUT=60000

# Grabación de video
RECORD_VIDEO=false
"@

# Crear .env.uat
try {
    $envUat | Out-File -FilePath ".env.uat" -Encoding UTF8 -Force
    Write-Host "✓ Archivo .env.uat creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear .env.uat: $_" -ForegroundColor Red
}

# Crear .env.dev
try {
    $envDev | Out-File -FilePath ".env.dev" -Encoding UTF8 -Force
    Write-Host "✓ Archivo .env.dev creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ Error al crear .env.dev: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Archivos creados:" -ForegroundColor Yellow
Write-Host "   - .env.uat" -ForegroundColor White
Write-Host "   - .env.dev" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Revisa y actualiza las credenciales si es necesario" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Ejecuta: npm test" -ForegroundColor White
Write-Host "   2. Ejecuta: npm run open:report" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

