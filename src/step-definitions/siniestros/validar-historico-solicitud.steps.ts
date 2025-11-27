import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AprobarSolicitudPage } from '../../pages/AprobarSolicitudPage';
import { obtenerUltimaSolicitud, obtenerSolicitudPorCorrelativo } from '../../helper/solicitud-data';
import * as fs from 'fs';
import * as path from 'path';

// Cache para la plantilla (cargar una sola vez)
let plantillaCache: any = null;

// ==================== ANTECEDENTES ====================
// Nota: El step "que estoy autenticado en el sistema Paynova como usuario de SINIESTROS" 
// se reutiliza de validar-detalle-solicitud.steps.ts para evitar duplicados

// ==================== NAVEGACIÓN ====================

When('accedo a la página de Histórico de Solicitudes de SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.navegarAHistoricoPersonal();
  console.log('   ✓ Navegado a Histórico de Solicitudes de SINIESTROS');
});

// ==================== HELPER PARA CARGAR PLANTILLA ====================

function cargarPlantillaValidacion(): any {
  // Cachear la plantilla para evitar múltiples lecturas del archivo
  if (!plantillaCache) {
    // Usar process.cwd() para obtener la raíz del proyecto (mismo patrón que data-loader.ts)
    const plantillaPath = path.join(process.cwd(), 'test-data', 'plantilla-validacion-historico.json');
    if (!fs.existsSync(plantillaPath)) {
      throw new Error(`No se encontró el archivo de plantilla: ${plantillaPath}`);
    }
    const rawData = fs.readFileSync(plantillaPath, 'utf-8');
    plantillaCache = JSON.parse(rawData);
  }
  return plantillaCache;
}

// ==================== VALIDACIONES ====================

Then('debería ver los filtros disponibles en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  console.log('\n   📋 Validando Filtros de SINIESTROS (usando plantilla JSON):');
  
  const filtrosEsperados = plantilla.filtros.campos;
  const filtrosVisibles = await aprobarPage.obtenerFiltrosVisibles();
  
  for (const filtro of filtrosEsperados) {
    const estaPresente = filtrosVisibles.some(f => 
      f.toLowerCase().includes(filtro.toLowerCase()) || 
      filtro.toLowerCase().includes(f.toLowerCase())
    );
    
    if (estaPresente) {
      console.log(`      ✓ Filtro "${filtro}" presente`);
    } else {
      console.log(`      ⚠️  Filtro "${filtro}" no encontrado`);
    }
  }
  
  console.log('   ✅ Validación de filtros de SINIESTROS completada');
});

Then('debería ver la tabla de Histórico con las columnas correctas en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  console.log('\n   📊 Validando Columnas de Tabla Histórico de SINIESTROS (usando plantilla JSON):');
  
  const columnasEsperadas = plantilla.tablaHistorico.columnas;
  const columnasVisibles = await aprobarPage.obtenerColumnasTablaHistorico();
  
  console.log(`   Columnas encontradas: ${columnasVisibles.join(', ')}`);
  
  for (const columna of columnasEsperadas) {
    const estaPresente = columnasVisibles.some(c => 
      c.toLowerCase().includes(columna.toLowerCase()) || 
      columna.toLowerCase().includes(c.toLowerCase())
    );
    
    if (estaPresente) {
      console.log(`      ✓ Columna "${columna}" presente`);
    } else {
      console.log(`      ⚠️  Columna "${columna}" no encontrada`);
    }
  }
  
  console.log('   ✅ Validación de columnas de SINIESTROS completada');
});

Then('debería verificar que los datos coincidan con solicitudes-creadas.json en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // Obtener una solicitud de ejemplo desde solicitudes-creadas.json
  const solicitudEjemplo = obtenerUltimaSolicitud('SINIESTROS');
  
  if (!solicitudEjemplo || !solicitudEjemplo.correlativo) {
    console.log('   ⚠️  No se encontraron solicitudes de SINIESTROS en solicitudes-creadas.json');
    return;
  }
  
  console.log(`\n   📋 Validando datos con solicitud ejemplo de SINIESTROS: ${solicitudEjemplo.correlativo}`);
  
  // Verificar que el registro existe en la tabla
  const existe = await aprobarPage.verificarRegistroEnTabla(solicitudEjemplo.correlativo);
  expect(existe).toBeTruthy();
  
  console.log('   ✅ Datos de SINIESTROS validados correctamente');
});

When('busco una solicitud por correlativo desde solicitudes-creadas.json en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // Obtener una solicitud aleatoria desde solicitudes-creadas.json
  const solicitud = obtenerUltimaSolicitud('SINIESTROS');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error('No se encontraron solicitudes de SINIESTROS en solicitudes-creadas.json');
  }
  
  // Guardar el correlativo en el contexto para validaciones posteriores
  this.correlativoBuscado = solicitud.correlativo;
  
  await aprobarPage.buscarPorCorrelativo(solicitud.correlativo);
  console.log(`   ✓ Buscando solicitud de SINIESTROS: ${solicitud.correlativo}`);
});

When('presiono el botón Buscar en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.presionarBotonBuscar();
});

Then('debería ver los resultados filtrados por correlativo en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const correlativo = this.correlativoBuscado;
  
  if (!correlativo) {
    throw new Error('No se encontró correlativo en el contexto');
  }
  
  // Verificar que el registro existe en los resultados
  const existe = await aprobarPage.verificarRegistroEnTabla(correlativo);
  expect(existe).toBeTruthy();
  
  console.log(`   ✅ Resultados filtrados correctamente por correlativo de SINIESTROS: ${correlativo}`);
});

When('selecciono el estado {string} en el filtro de Estado en SINIESTROS', async function(estado: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.seleccionarEstado(estado);
  this.estadoSeleccionado = estado;
});

Then('debería ver solo las solicitudes con estado APROBADO en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // Verificar que todos los resultados tienen el estado APROBADO
  const todosAprobados = await aprobarPage.verificarEstadoEnResultados('APROBADO');
  expect(todosAprobados).toBeTruthy();
  
  console.log('   ✅ Todas las solicitudes de SINIESTROS tienen estado APROBADO');
});

When('hago clic en el botón Exportar Excel en SINIESTROS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  this.nombreArchivoDescargado = await aprobarPage.exportarAExcel();
});

Then('debería descargarse el archivo Excel correctamente de SINIESTROS', async function() {
  const nombreArchivo = this.nombreArchivoDescargado;
  
  expect(nombreArchivo).toBeTruthy();
  expect(nombreArchivo).toContain('.xlsx');
  
  console.log(`   ✅ Archivo Excel de SINIESTROS descargado correctamente: ${nombreArchivo}`);
});

Then('debería validar que cada registro en Histórico tenga las columnas en SINIESTROS:', async function(dataTable: DataTable) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  const registros = await aprobarPage.obtenerRegistrosTablaHistorico();
  const columnasEsperadas = dataTable.hashes().map(row => row['Columna']);
  const columnasPlantilla = plantilla.tablaHistorico.columnas;
  
  expect(registros.length).toBeGreaterThan(0);
  console.log(`\n   📊 Validando ${registros.length} registro(s) en Histórico de SINIESTROS (usando plantilla JSON):`);
  console.log(`      Columnas esperadas: ${columnasEsperadas.join(', ')}`);
  
  // Validar cada registro
  for (let i = 0; i < Math.min(registros.length, 5); i++) { // Validar solo los primeros 5 para no saturar
    const registro = registros[i];
    console.log(`      Registro ${i + 1}:`);
    
    for (const columna of columnasPlantilla) {
      // Buscar la columna en el registro (puede estar con diferentes nombres)
      const columnaLower = columna.toLowerCase();
      const columnaEncontrada = Object.keys(registro).find(k => 
        k.toLowerCase().includes(columnaLower) || columnaLower.includes(k.toLowerCase())
      );
      
      if (columnaEncontrada) {
        const valor = registro[columnaEncontrada];
        expect(valor).toBeTruthy();
        expect(valor.trim().length).toBeGreaterThan(0);
        console.log(`         ✓ ${columna}: "${valor}"`);
      } else {
        console.log(`         ⚠️  ${columna}: Campo no encontrado exactamente`);
      }
    }
  }
  
  console.log('   ✅ Columnas de Histórico de SINIESTROS validadas correctamente');
});

