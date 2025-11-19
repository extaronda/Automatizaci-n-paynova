# Script para limpiar datos de ejecuciones anteriores
# Elimina: screenshots y solicitudes-creadas.json

Write-Host "Limpiando datos de ejecuciones anteriores..." -ForegroundColor Cyan
Write-Host ""

# Limpiar screenshots
if (Test-Path "screenshots") {
    Remove-Item -Path "screenshots\*" -Recurse -Force
    Write-Host "[OK] Screenshots eliminados" -ForegroundColor Green
} else {
    Write-Host "[INFO] No existe carpeta screenshots" -ForegroundColor Yellow
}

# Limpiar solicitudes-creadas.json
if (Test-Path "test-data/solicitudes-creadas.json") {
    Remove-Item -Path "test-data/solicitudes-creadas.json" -Force
    Write-Host "[OK] solicitudes-creadas.json eliminado" -ForegroundColor Green
} else {
    Write-Host "[INFO] No existe solicitudes-creadas.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Limpieza completada" -ForegroundColor Green

