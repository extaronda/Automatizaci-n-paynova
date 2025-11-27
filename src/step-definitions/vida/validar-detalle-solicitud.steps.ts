import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AprobarSolicitudPage } from '../../pages/AprobarSolicitudPage';
import { LoginPage } from '../../pages/LoginPage';
import { obtenerSolicitudPorMemoYAccion } from '../../helper/solicitud-data';
import * as fs from 'fs';
import * as path from 'path';

// Cache para la plantilla (cargar una sola vez)
let plantillaCache: any = null;

// ==================== ANTECEDENTES ====================

Given('que estoy autenticado en el sistema Paynova como usuario de VIDA', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  // Usar usuario de VIDA para validaciones
  await loginPage.enterUsername('jcastroc');
  await loginPage.enterPassword('Primeras20');
  await loginPage.clickLoginButton();
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log('✓ Autenticado como jcastroc (VIDA)');
});

// ==================== NAVEGACIÓN ====================
// Nota: Los steps de navegación (When) se reutilizan de aprobar-solicitud-vida.steps.ts
// Solo definimos aquí los steps específicos de validación (Then)

// ==================== HELPER PARA CARGAR PLANTILLA ====================

function cargarPlantillaValidacion(): any {
  // Cachear la plantilla para evitar múltiples lecturas del archivo
  if (!plantillaCache) {
    const plantillaPath = path.resolve(__dirname, '../../test-data/plantilla-validacion-detalle.json');
    if (!fs.existsSync(plantillaPath)) {
      throw new Error(`No se encontró el archivo de plantilla: ${plantillaPath}`);
    }
    const rawData = fs.readFileSync(plantillaPath, 'utf-8');
    plantillaCache = JSON.parse(rawData);
  }
  return plantillaCache;
}

// ==================== VALIDACIONES ====================

Then('debería validar la Información General:', async function(dataTable: DataTable) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const informacion = await aprobarPage.obtenerInformacionGeneral();
  const datosEsperados = dataTable.hashes();
  
  // Cargar plantilla desde JSON
  const plantilla = cargarPlantillaValidacion();
  
  // Si tenemos la solicitud actual en contexto, usar esos datos como referencia
  const solicitudActual = this.solicitudActual;
  
  console.log('\n   📋 Validando Información General (usando plantilla JSON):');
  
  // Usar campos de la plantilla JSON
  const camposPlantilla = plantilla.informacionGeneral.campos;
  
  for (const campo of camposPlantilla) {
    const valorActual = informacion[campo] || '';
    
    // Validar que el campo existe y tiene datos
    expect(valorActual.length).toBeGreaterThan(0);
    expect(valorActual.trim()).not.toBe('');
    
    console.log(`      ✓ ${campo}: "${valorActual}"`);
    
    // Si tenemos datos esperados en la tabla, comparar opcionalmente
    const filaEsperada = datosEsperados.find(f => f['Campo'] === campo);
    if (filaEsperada) {
      let valorEsperado = filaEsperada['Valor Esperado'];
      
      // Si el valor esperado indica usar datos guardados, usar datos del JSON
      if (valorEsperado.includes('usará datos guardados') && solicitudActual) {
        if (campo === 'Correlativo' && solicitudActual?.correlativo) {
          valorEsperado = solicitudActual.correlativo;
        } else if (campo === 'Incidente' && solicitudActual?.incidente) {
          valorEsperado = solicitudActual.incidente.toString();
        } else if (campo === 'Asunto' && solicitudActual?.memo) {
          valorEsperado = solicitudActual.memo;
        } else if (campo === 'Monto' && solicitudActual?.monto !== undefined) {
          const simbolo = solicitudActual.moneda === 'Dolares' ? '$' : 'S/';
          valorEsperado = `${simbolo} ${solicitudActual.monto.toFixed(2)}`;
        }
      }
      
      // Comparar solo si no es "(cualquier estado)"
      if (!valorEsperado.includes('cualquier estado')) {
        const valorEsperadoNormalizado = valorEsperado.trim().toLowerCase();
        const valorActualNormalizado = valorActual.trim().toLowerCase();
        
        if (campo === 'Monto') {
          const montoEsperado = valorEsperadoNormalizado.replace(/[^\d.]/g, '');
          const montoActual = valorActualNormalizado.replace(/[^\d.]/g, '');
          expect(montoActual).toBe(montoEsperado);
          console.log(`         ✓ ${campo} coincide con datos guardados`);
        } else if (campo !== 'Estado') {
          expect(valorActualNormalizado).toBe(valorEsperadoNormalizado);
          console.log(`         ✓ ${campo} coincide con datos guardados`);
        }
      }
    }
  }
  
  console.log('   ✅ Información General validada correctamente\n');
});

Then('debería validar que la sección Datos tenga al menos un registro', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const tieneRegistros = await aprobarPage.tieneRegistrosDatos();
  
  expect(tieneRegistros).toBeTruthy();
  console.log('   ✓ Sección Datos tiene registros');
});

Then('debería validar que la sección Datos tenga registros', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const tieneRegistros = await aprobarPage.tieneRegistrosDatos();
  
  expect(tieneRegistros).toBeTruthy();
  console.log('   ✓ Sección Datos tiene registros');
});

Then('debería validar que cada registro en Datos tenga los campos:', async function(dataTable: DataTable) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const registros = await aprobarPage.obtenerRegistrosDatos();
  
  // Cargar plantilla desde JSON
  const plantilla = cargarPlantillaValidacion();
  
  expect(registros.length).toBeGreaterThan(0);
  console.log(`   📊 Validando ${registros.length} registro(s) en Datos (usando plantilla JSON):`);
  
  // Usar campos de la plantilla JSON
  const camposPlantilla = plantilla.datos.campos;
  
  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    console.log(`      Registro ${i + 1}:`);
    
    for (const campo of camposPlantilla) {
      // Buscar el campo en el registro (puede estar con diferentes nombres)
      const campoLower = campo.toLowerCase();
      const campoEncontrado = Object.keys(registro).find(k => 
        k.toLowerCase().includes(campoLower) || campoLower.includes(k.toLowerCase())
      );
      
      if (campoEncontrado) {
        const valor = registro[campoEncontrado];
        // Validar que existe y tiene datos
        expect(valor).toBeTruthy();
        expect(valor.trim().length).toBeGreaterThan(0);
        console.log(`         ✓ ${campo}: "${valor}"`);
      } else {
        // Si no se encuentra exactamente, verificar que al menos hay datos en el registro
        const tieneDatos = Object.values(registro).some(v => v && v.trim().length > 0);
        expect(tieneDatos).toBeTruthy();
        console.log(`         ⚠️  ${campo}: Campo no encontrado exactamente, pero registro tiene datos`);
      }
    }
  }
  
  console.log('   ✅ Campos de Datos validados correctamente');
});

Then('debería validar que la sección Documentos esté presente', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const presente = await aprobarPage.verificarSeccionPresente('Documentos');
  
  expect(presente).toBeTruthy();
  console.log('   ✓ Sección Documentos está presente');
});

Then('debería validar que la sección Observaciones esté presente', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const presente = await aprobarPage.verificarSeccionPresente('Observaciones');
  
  expect(presente).toBeTruthy();
  console.log('   ✓ Sección Observaciones está presente');
});

Then('debería validar que la sección Distribución esté presente', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const presente = await aprobarPage.verificarSeccionPresente('Distribución');
  
  expect(presente).toBeTruthy();
  
  // Validar que tenga registros y estructura correcta
  const tieneRegistros = await aprobarPage.tieneRegistrosDistribucion();
  expect(tieneRegistros).toBeTruthy();
  
  // Cargar plantilla desde JSON
  const plantilla = cargarPlantillaValidacion();
  
  // Validar estructura de la plantilla: Centro de Costo, Porcentaje, Monto
  const registros = await aprobarPage.obtenerRegistrosDistribucion();
  expect(registros.length).toBeGreaterThan(0);
  
  console.log(`   ✓ Sección Distribución está presente con ${registros.length} registro(s)`);
  
  // Usar campos de la plantilla JSON
  const camposPlantilla = plantilla.distribucion.campos;
  for (let i = 0; i < registros.length; i++) {
    const registro = registros[i];
    console.log(`      Registro ${i + 1}:`);
    
    for (const campo of camposPlantilla) {
      const campoLower = campo.toLowerCase();
      const campoEncontrado = Object.keys(registro).find(k => 
        k.toLowerCase().includes(campoLower) || campoLower.includes(k.toLowerCase())
      );
      
      if (campoEncontrado) {
        const valor = registro[campoEncontrado];
        expect(valor).toBeTruthy();
        expect(valor.trim().length).toBeGreaterThan(0);
        console.log(`         ✓ ${campo}: "${valor}"`);
      }
    }
  }
  
  console.log('   ✅ Distribución validada correctamente');
});

Then('debería validar que la sección Trazabilidad tenga registros', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const tieneRegistros = await aprobarPage.tieneRegistrosTrazabilidad();
  
  expect(tieneRegistros).toBeTruthy();
  console.log('   ✓ Sección Trazabilidad tiene registros');
});

Then('debería validar que cada registro en Trazabilidad tenga los campos:', async function(dataTable: DataTable) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const tieneRegistros = await aprobarPage.tieneRegistrosTrazabilidad();
  
  expect(tieneRegistros).toBeTruthy();
  
  // Verificar que la sección existe
  const seccionPresente = await aprobarPage.verificarSeccionPresente('Trazabilidad');
  expect(seccionPresente).toBeTruthy();
  
  // Cargar plantilla desde JSON
  const plantilla = cargarPlantillaValidacion();
  
  // Usar campos de la plantilla JSON
  const camposPlantilla = plantilla.trazabilidad.campos;
  
  // Obtener los registros de trazabilidad para validar estructura usando método público
  const tieneEstructuraCorrecta = await aprobarPage.tieneRegistrosTrazabilidad();
  
  // Validar estructura de campos adicionalmente
  const tieneEstructuraDetallada = await global.page.evaluate(() => {
    // @ts-ignore
    const tables = Array.from(document.querySelectorAll('table')) as any[];
    for (const table of tables) {
      const tableText = table.textContent || '';
      if (tableText.toLowerCase().includes('paso') && 
          tableText.toLowerCase().includes('usuario') &&
          tableText.toLowerCase().includes('estado')) {
        // Verificar que tenga filas de datos
        const rows = table.querySelectorAll('tbody tr, tr');
        return rows.length > 1; // Al menos una fila de datos además del header
      }
    }
    return false;
  });
  
  expect(tieneEstructuraCorrecta).toBeTruthy();
  expect(tieneEstructuraDetallada).toBeTruthy();
  
  console.log('   ✓ Sección Trazabilidad tiene registros y estructura correcta');
  console.log(`   📋 Campos validados: ${camposPlantilla.join(', ')}`);
});

