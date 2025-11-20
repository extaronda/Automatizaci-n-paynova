# Script para ejecutar la suite completa de VIDA en orden
# Ejecuta: Registro VIDA -> Aprobacion VIDA

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "[SUITE] EJECUTANDO SUITE COMPLETA DE VIDA" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Cambiar al directorio de tests
Set-Location $PSScriptRoot\..

try {
    # 1. REGISTRO VIDA (todos los escenarios: happy-path, rechazar, observar, aprobador2, aprobador3)
    Write-Host "[1/2] Ejecutando Registro VIDA..." -ForegroundColor Yellow
    npm run test:suite:vida:registro
    if ($LASTEXITCODE -ne 0) {
        throw "Registro VIDA fallo"
    }
    Write-Host "[OK] Registro VIDA completado" -ForegroundColor Green
    Write-Host ""

    # 2. APROBACION VIDA (todos los escenarios: aprobar, rechazar, observar, aprobador1, aprobador2, aprobador3)
    Write-Host "[2/2] Ejecutando Aprobacion VIDA..." -ForegroundColor Yellow
    npm run test:suite:vida:aprobacion
    if ($LASTEXITCODE -ne 0) {
        throw "Aprobacion VIDA fallo"
    }
    Write-Host "[OK] Aprobacion VIDA completada" -ForegroundColor Green
    Write-Host ""

    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] SUITE VIDA EJECUTADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Generando reporte..." -ForegroundColor Cyan
    npm run posttest:vida

} catch {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Red
    Write-Host "[ERROR] ERROR EN LA EJECUCION" -ForegroundColor Red
    Write-Host "===================================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

