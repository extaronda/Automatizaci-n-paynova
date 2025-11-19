# Script para ejecutar la suite completa de tests en orden
# Ejecuta: Login -> RRHH -> VIDA Registro -> VIDA Aprobacion

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "[SUITE] EJECUTANDO SUITE COMPLETA DE TESTS" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Cambiar al directorio de tests
Set-Location $PSScriptRoot\..

try {
    # 1. LOGIN
    Write-Host "[1/4] Ejecutando Login..." -ForegroundColor Yellow
    npm run test:suite:smoke
    if ($LASTEXITCODE -ne 0) {
        throw "Login fallo"
    }
    Write-Host "[OK] Login completado" -ForegroundColor Green
    Write-Host ""

    # 2. REGISTRO RRHH
    Write-Host "[2/4] Ejecutando Registro RRHH..." -ForegroundColor Yellow
    npm run test:suite:rrhh
    if ($LASTEXITCODE -ne 0) {
        throw "Registro RRHH fallo"
    }
    Write-Host "[OK] Registro RRHH completado" -ForegroundColor Green
    Write-Host ""

    # 3. REGISTRO VIDA (todos los escenarios: happy-path, rechazar, observar, aprobador2, aprobador3)
    Write-Host "[3/4] Ejecutando Registro VIDA (todos los escenarios)..." -ForegroundColor Yellow
    npm run test:suite:vida:registro
    if ($LASTEXITCODE -ne 0) {
        throw "Registro VIDA fallo"
    }
    Write-Host "[OK] Registro VIDA completado" -ForegroundColor Green
    Write-Host ""

    # 4. APROBACION VIDA (todos los escenarios: aprobar, rechazar, observar, aprobador2, aprobador3)
    Write-Host "[4/4] Ejecutando Aprobacion VIDA (todos los escenarios)..." -ForegroundColor Yellow
    npm run test:suite:vida:aprobacion
    if ($LASTEXITCODE -ne 0) {
        throw "Aprobacion VIDA fallo"
    }
    Write-Host "[OK] Aprobacion VIDA completada" -ForegroundColor Green
    Write-Host ""

    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] SUITE COMPLETA EJECUTADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Generando reporte..." -ForegroundColor Cyan
    npm run posttest:uat

} catch {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Red
    Write-Host "[ERROR] ERROR EN LA EJECUCION" -ForegroundColor Red
    Write-Host "===================================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

