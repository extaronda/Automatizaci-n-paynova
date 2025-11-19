Write-Host ""
Write-Host "Limpiando estructura antigua..." -ForegroundColor Yellow
Write-Host ""

$deleted = 0

if (Test-Path "support") {
    Remove-Item "support" -Recurse -Force
    Write-Host "Eliminado: support/ (ahora en src/hooks/ y src/helper/)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "steps") {
    Remove-Item "steps" -Recurse -Force
    Write-Host "Eliminado: steps/ (ahora en src/step-definitions/)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "features") {
    Remove-Item "features" -Recurse -Force
    Write-Host "Eliminado: features/ (ahora en src/features/)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "pages") {
    Remove-Item "pages" -Recurse -Force
    Write-Host "Eliminado: pages/ (ahora en src/pages/)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "config\playwright.config.ts") {
    Remove-Item "config\playwright.config.ts" -Force
    Write-Host "Eliminado: config/playwright.config.ts (ahora en src/helper/env/)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "cucumber.js") {
    Remove-Item "cucumber.js" -Force
    Write-Host "Eliminado: cucumber.js raiz (ahora en config/cucumber.js)" -ForegroundColor Green
    $deleted++
}

if (Test-Path "reports") {
    Remove-Item "reports" -Recurse -Force
    Write-Host "Eliminado: reports/ (ahora en test-results/reports/)" -ForegroundColor Green
    $deleted++
}

Write-Host ""
Write-Host "Limpieza completada: $deleted archivos/carpetas eliminados" -ForegroundColor Green
Write-Host ""
Write-Host "Estructura actual:" -ForegroundColor Yellow
Write-Host "  src/ - Todo el codigo" -ForegroundColor White
Write-Host "  config/ - Configuraciones" -ForegroundColor White
Write-Host "  test-results/ - Reportes" -ForegroundColor White
Write-Host ""

