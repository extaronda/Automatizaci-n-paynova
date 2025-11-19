#!/bin/bash

# ====================================
# PAYNOVA AUTOMATION - SETUP SCRIPT
# ====================================
# Este script configura el entorno de pruebas automatizadas
# Autor: Adrian Rondan
# Fecha: Noviembre 2025

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   PAYNOVA AUTOMATION - SETUP SCRIPT           ║"
echo "║   Configuración automática del entorno        ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar comandos
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 está instalado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NO está instalado"
        return 1
    fi
}

# Función para mostrar versión
show_version() {
    VERSION=$($1 --version 2>&1 | head -n 1)
    echo "  └─ Versión: $VERSION"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PASO 1: Verificando pre-requisitos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar Node.js
if check_command node; then
    show_version node
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${YELLOW}⚠${NC}  Node.js versión 16+ es requerida"
        exit 1
    fi
else
    echo -e "${RED}Error: Node.js no está instalado${NC}"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

echo ""

# Verificar npm
if check_command npm; then
    show_version npm
else
    echo -e "${RED}Error: npm no está instalado${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PASO 2: Instalando dependencias"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Dependencias instaladas correctamente"
else
    echo -e "${RED}✗${NC} Error al instalar dependencias"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 PASO 3: Instalando navegadores de Playwright"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx playwright install chromium

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Navegadores instalados correctamente"
else
    echo -e "${RED}✗${NC} Error al instalar navegadores"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 PASO 4: Creando directorios necesarios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Crear directorios
DIRECTORIES=("screenshots" "reports" "videos")

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✓${NC} Directorio creado: $dir/"
    else
        echo -e "${GREEN}✓${NC} Directorio ya existe: $dir/"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  PASO 5: Configurando variables de entorno"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${GREEN}✓${NC} Archivo .env creado desde env.example"
    else
        echo -e "${YELLOW}⚠${NC}  Archivo env.example no encontrado"
    fi
else
    echo -e "${GREEN}✓${NC} Archivo .env ya existe"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PASO 6: Verificando instalación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar Playwright
if npx playwright --version &> /dev/null; then
    PLAYWRIGHT_VERSION=$(npx playwright --version)
    echo -e "${GREEN}✓${NC} Playwright: $PLAYWRIGHT_VERSION"
else
    echo -e "${RED}✗${NC} Playwright no está configurado correctamente"
fi

# Verificar Cucumber
if npx cucumber-js --version &> /dev/null; then
    CUCUMBER_VERSION=$(npx cucumber-js --version)
    echo -e "${GREEN}✓${NC} Cucumber: $CUCUMBER_VERSION"
else
    echo -e "${RED}✗${NC} Cucumber no está configurado correctamente"
fi

# Verificar TypeScript
if npx tsc --version &> /dev/null; then
    TSC_VERSION=$(npx tsc --version)
    echo -e "${GREEN}✓${NC} TypeScript: $TSC_VERSION"
else
    echo -e "${RED}✗${NC} TypeScript no está configurado correctamente"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 PASO 7: ¿Ejecutar prueba de verificación?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "¿Deseas ejecutar las pruebas ahora? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo ""
    echo "Ejecutando pruebas..."
    echo ""
    npm test
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓${NC} ¡Pruebas ejecutadas exitosamente!"
    else
        echo ""
        echo -e "${YELLOW}⚠${NC}  Algunas pruebas fallaron. Revisa los logs arriba."
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║          ✅ SETUP COMPLETADO                   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📚 Próximos pasos:"
echo ""
echo "  1. Lee el README.md para guía completa"
echo "  2. Ejecuta 'npm test' para correr todas las pruebas"
echo "  3. Ejecuta 'npm run test:login' para solo pruebas de login"
echo "  4. Revisa COMMANDS.md para todos los comandos disponibles"
echo ""
echo "🎉 ¡Listo para automatizar! Happy testing!"
echo ""

