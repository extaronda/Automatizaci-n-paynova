import { After, AfterAll, AfterStep, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { invokeBrowser } from '../helper/browsers/browserManager';
import { getEnv } from '../helper/env/env';
import * as fs from 'fs';
import * as path from 'path';

// Establecer timeout global
setDefaultTimeout(60000);

/**
 * Professional Hooks
 * Gestiona el ciclo de vida completo de los tests
 */

BeforeAll(async function () {
  try {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🎭 INICIANDO SUITE DE PRUEBAS - PAYNOVA AUTOMATION');
    console.log('═══════════════════════════════════════════════════\n');
    
    // 🗑️ LIMPIAR DATOS DE EJECUCIONES ANTERIORES
    console.log('🧹 Limpiando datos de ejecuciones anteriores...');
    
    // Limpiar carpeta de screenshots
    const screenshotsDir = './screenshots';
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      for (const file of files) {
        const filePath = path.join(screenshotsDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          // Eliminar directorio y su contenido
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          // Eliminar archivo
          fs.unlinkSync(filePath);
        }
      }
      console.log('🗑️  Screenshots anteriores eliminados');
    }
    
    // NO limpiar solicitudes-creadas.json automáticamente
    // Este archivo es necesario para los tests de aprobación que dependen
    // de las solicitudes creadas en tests anteriores
    // Se puede limpiar manualmente si es necesario
    
    console.log('✓ Limpieza completada\n');
    
    // Cargar variables de entorno
    console.log('🔧 Cargando configuración...');
    getEnv();
    console.log('✓ Configuración cargada\n');
    
    // Crear directorios necesarios
    const directories = ['./test-results', './test-results/reports', './test-results/json', './screenshots'];
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Directorio creado: ${dir}`);
      }
    });
    
    // Lanzar navegador (singleton compartido entre escenarios)
    console.log('🚀 Inicializando navegador...');
    global.browser = await invokeBrowser();
    console.log('✅ Navegador inicializado correctamente\n');
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN BeforeAll:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
    }
    throw error; // Re-lanzar para que Cucumber muestre el error
  }
});

Before(async function ({ pickle }) {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log(`📋 ${pickle.name}`);
    console.log('═'.repeat(80));
    
    // Verificar que el navegador esté inicializado
    if (!global.browser) {
      throw new Error('❌ global.browser no está inicializado. El BeforeAll debe haber fallado.');
    }
    
    // IMPORTANTE: Guardar información del escenario en el contexto para uso en steps
    this.scenarioTitle = pickle.name || '';
    this.scenarioTags = pickle.tags || [];
    
    // Capturar valores del esquema parametrizado desde el nombre del escenario
    // Cuando Cucumber procesa un Scenario Outline, reemplaza los placeholders en el nombre
    // Ejemplo: "Aprobador 1 - APROBAR Solicitud RESCATE POLIZA CON PRESTAMO con monto 20000 Dolares"
    const scenarioName = pickle.name || '';
    if (scenarioName.includes('con monto')) {
      const montoMatch = scenarioName.match(/monto (\d+)/);
      const monedaMatch = scenarioName.match(/(Soles|Dolares)/);
      
      if (montoMatch && monedaMatch) {
        (this as any).monto = parseInt(montoMatch[1]);
        (this as any).moneda = monedaMatch[1];
        console.log(`   📋 Valores del esquema detectados: monto ${(this as any).monto} ${(this as any).moneda}`);
      }
    }
    
    // Resetear contador de pasos para este escenario
    this.stepCounter = 0;
    
    // Crear nuevo contexto y página para cada escenario
    console.log('📄 Creando nuevo contexto y página...');
    global.context = await global.browser.newContext({
      viewport: null, // 📺 Usar tamaño completo de la ventana maximizada (pantalla completa normal)
      recordVideo: process.env.RECORD_VIDEO === 'true' ? {
        dir: './test-results/videos/',
        size: { width: 1920, height: 1080 }
      } : undefined
    });
    
    global.page = await global.context.newPage();
    console.log('✅ Contexto y página creados correctamente (pantalla completa)');
  } catch (error) {
    console.error('\n❌ ERROR EN Before hook:');
    console.error(error);
    throw error; // Re-lanzar para que Cucumber muestre el error
  }
});

After(async function ({ pickle, result }) {
  const status = result?.status || 'UNKNOWN';
  
  // Tomar screenshot SIEMPRE (exitoso o fallido) para evidencia
  try {
    const prefix = status === 'PASSED' ? 'SUCCESS' : 'FAILED';
    const screenshotName = `${prefix}-${pickle.name.replace(/\s+/g, '-')}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    await global.page.screenshot({ 
      path: `./screenshots/${screenshotName}-${timestamp}.png`,
      fullPage: true 
    });
    
    if (status === 'PASSED') {
      console.log('\n✅ ESCENARIO EXITOSO ✅');
      console.log(`📸 Screenshot guardado: ${screenshotName}`);
    } else if (status === 'FAILED') {
      console.log('\n❌ ESCENARIO FALLIDO ❌');
      console.log(`📸 Screenshot del error: ${screenshotName}`);
    }
  } catch (error) {
    console.error('⚠️  Error al tomar screenshot:', error);
  }
  
  console.log('═'.repeat(80) + '\n');
  
  // Cerrar página y contexto
  await global.page.close();
  await global.context.close();
});

AfterAll(async function () {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎭 SUITE DE PRUEBAS FINALIZADA');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Cerrar navegador
  await global.browser.close();
});

/**
 * AfterStep - Captura screenshot de cada paso
 * Organiza capturas por escenario para mejor evidencia
 */
AfterStep(async function ({ pickle, pickleStep, result }) {
  try {
    // Crear nombre de carpeta del escenario (sanitizado)
    const scenarioName = pickle.name.replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
    const scenarioDir = `./screenshots/${scenarioName}`;
    
    // Crear directorio si no existe
    if (!fs.existsSync(scenarioDir)) {
      fs.mkdirSync(scenarioDir, { recursive: true });
    }
    
    // Obtener número de paso (si no existe en el contexto, inicializarlo)
    if (!this.stepCounter) {
      this.stepCounter = 0;
    }
    this.stepCounter++;
    
    // Crear nombre del archivo con número y texto del paso
    const stepNumber = String(this.stepCounter).padStart(2, '0');
    const stepText = pickleStep.text.substring(0, 60).replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const screenshotPath = `${scenarioDir}/${stepNumber}-${stepText}.png`;
    
    // Tomar screenshot
    await global.page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    
    // También adjuntar al reporte de Cucumber
    const img = await global.page.screenshot({ 
      type: 'png',
      fullPage: false // Solo viewport para el reporte
    });
    this.attach(img, 'image/png');
    
  } catch (error) {
    console.log(`⚠️  No se pudo capturar screenshot del paso: ${pickleStep.text}`);
  }
});

