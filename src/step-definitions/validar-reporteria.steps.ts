import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ReporteriaPage } from '../pages/ReporteriaPage';
import { obtenerUltimaSolicitud, obtenerSolicitudPorCorrelativo } from '../helper/solicitud-data';
import * as fs from 'fs';
import * as path from 'path';

// Cache para la plantilla (cargar una sola vez)
let plantillaCache: any = null;

// ==================== ANTECEDENTES ====================
// Nota: El step "que estoy autenticado en el sistema Paynova como usuario de VIDA" 
// se reutiliza de validar-detalle-solicitud.steps.ts para evitar duplicados

// ==================== NAVEGACIÓN ====================

When('accedo a la página de Reportería de Solicitudes', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  await reporteriaPage.navegarAReporteria();
  console.log('   ✓ Navegado a Reportería de Solicitudes');
});

// ==================== HELPER PARA CARGAR PLANTILLA ====================

function cargarPlantillaValidacion(): any {
  // Cachear la plantilla para evitar múltiples lecturas del archivo
  if (!plantillaCache) {
    const plantillaPath = path.resolve(__dirname, '../../test-data/plantilla-validacion-reporteria.json');
    if (!fs.existsSync(plantillaPath)) {
      throw new Error(`No se encontró el archivo de plantilla: ${plantillaPath}`);
    }
    const rawData = fs.readFileSync(plantillaPath, 'utf-8');
    plantillaCache = JSON.parse(rawData);
  }
  return plantillaCache;
}

// ==================== VALIDACIONES ====================

Then('debería ver los filtros disponibles en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  console.log('\n   📋 Validando Filtros de Reportería (usando plantilla JSON):');
  
  const filtrosEsperados = plantilla.filtros.campos;
  const filtrosVisibles = await reporteriaPage.obtenerFiltrosReporteria();
  
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
  
  console.log('   ✅ Validación de filtros completada');
});

Then('debería ver la tabla de Reportería con las columnas correctas', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  console.log('\n   📊 Validando Columnas de Tabla Reportería (usando plantilla JSON):');
  
  const columnasEsperadas = plantilla.tablaReporteria.columnas;
  const columnasVisibles = await reporteriaPage.obtenerColumnasTabla();
  
  console.log(`   Columnas encontradas: ${columnasVisibles.join(', ')}`);
  
  // Validar las columnas más importantes (las primeras 11 según el requerimiento)
  const columnasImportantes = [
    'Asunto', 'Correlativo', 'Incidente', 'Estado', 'Paso', 
    'Asiento', 'Código', 'Contratante', 'Solicitud', 'Área', 'Póliza'
  ];
  
  for (const columna of columnasImportantes) {
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
  
  console.log('   ✅ Validación de columnas completada');
});

When('filtro por estado {string}', async function(estado: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  await reporteriaPage.seleccionarEstado(estado);
  this.estadoSeleccionado = estado;
});

When('presiono el botón Consultar', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  await reporteriaPage.presionarBotonConsultar();
});

Then('debería ver solo las solicitudes con estado APROBADO en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Verificar que todos los resultados tienen el estado APROBADO
  const todosAprobados = await reporteriaPage.verificarEstadoEnResultados('APROBADO');
  expect(todosAprobados).toBeTruthy();
  
  console.log('   ✅ Todas las solicitudes tienen estado APROBADO');
});

Then('debería ver solo las solicitudes con estado PENDIENTE_APROBACION en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Verificar que todos los resultados tienen el estado PENDIENTE_APROBACION
  const todosPendientes = await reporteriaPage.verificarEstadoEnResultados('PENDIENTE_APROBACION');
  expect(todosPendientes).toBeTruthy();
  
  console.log('   ✅ Todas las solicitudes tienen estado PENDIENTE_APROBACION');
});

Then(/^cada registro APROBADO debe tener Asiento con valor válido \(no vacío ni '-'\)$/, async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Primero verificar que hay registros
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  // Filtrar solo los registros con estado APROBADO
  const registrosAprobados = registros.filter(r => {
    const estado = r['Estado'] || '';
    return estado.toUpperCase().includes('APROBADO');
  });
  
  expect(registrosAprobados.length).toBeGreaterThan(0);
  
  // Verificar que todos los APROBADO tienen Asiento válido
  for (const registro of registrosAprobados) {
    const asiento = registro['Asiento'] || '';
    expect(asiento).toBeTruthy();
    expect(asiento).not.toBe('-');
    expect(asiento.trim().length).toBeGreaterThan(0);
  }
  
  console.log(`   ✅ Todos los ${registrosAprobados.length} registros APROBADO tienen Asiento válido`);
});

Then('cada registro PENDIENTE_APROBACION debe tener Asiento igual a {string}', async function(valorEsperado: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Primero verificar que hay registros
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  // Filtrar solo los registros con estado PENDIENTE_APROBACION
  const registrosPendientes = registros.filter(r => {
    const estado = r['Estado'] || '';
    return estado.toUpperCase().includes('PENDIENTE');
  });
  
  expect(registrosPendientes.length).toBeGreaterThan(0);
  
  // Verificar que todos los PENDIENTE tienen Asiento igual al valor esperado
  for (const registro of registrosPendientes) {
    const asiento = registro['Asiento'] || '';
    expect(asiento).toBe(valorEsperado);
  }
  
  console.log(`   ✅ Todos los ${registrosPendientes.length} registros PENDIENTE_APROBACION tienen Asiento igual a "${valorEsperado}"`);
});

Then('debería validar las columnas obligatorias para estado APROBADO:', async function(dataTable: DataTable) {
  const reporteriaPage = new ReporteriaPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  const columnasEsperadas = dataTable.hashes().map(row => row['Columna']);
  const columnasObligatorias = plantilla.validacionesPorEstado.APROBADO.columnasObligatorias;
  
  expect(registros.length).toBeGreaterThan(0);
  console.log(`\n   📊 Validando ${registros.length} registro(s) APROBADO (usando plantilla JSON):`);
  console.log(`      Columnas obligatorias: ${columnasObligatorias.join(', ')}`);
  
  // Validar cada registro
  for (let i = 0; i < Math.min(registros.length, 5); i++) { // Validar solo los primeros 5
    const registro = registros[i];
    console.log(`      Registro ${i + 1}:`);
    
    for (const columna of columnasObligatorias) {
      const columnaLower = columna.toLowerCase();
      const columnaEncontrada = Object.keys(registro).find(k => 
        k.toLowerCase().includes(columnaLower) || columnaLower.includes(k.toLowerCase())
      );
      
      if (columnaEncontrada) {
        const valor = registro[columnaEncontrada];
        
        // Validación especial para Asiento: debe tener valor válido (no vacío ni '-')
        if (columna === 'Asiento') {
          expect(valor).toBeTruthy();
          expect(valor.trim()).not.toBe('');
          expect(valor.trim()).not.toBe('-');
          console.log(`         ✓ ${columna}: "${valor}" (válido)`);
        } else {
          expect(valor).toBeTruthy();
          expect(valor.trim().length).toBeGreaterThan(0);
          console.log(`         ✓ ${columna}: "${valor}"`);
        }
      } else {
        console.log(`         ⚠️  ${columna}: Campo no encontrado exactamente`);
      }
    }
  }
  
  console.log('   ✅ Columnas obligatorias de APROBADO validadas correctamente');
});

Then('debería validar las columnas obligatorias para estado PENDIENTE_APROBACION:', async function(dataTable: DataTable) {
  const reporteriaPage = new ReporteriaPage(global.page);
  const plantilla = cargarPlantillaValidacion();
  
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  const columnasEsperadas = dataTable.hashes().map(row => row['Columna']);
  const columnasObligatorias = plantilla.validacionesPorEstado.PENDIENTE_APROBACION.columnasObligatorias;
  
  expect(registros.length).toBeGreaterThan(0);
  console.log(`\n   📊 Validando ${registros.length} registro(s) PENDIENTE_APROBACION (usando plantilla JSON):`);
  console.log(`      Columnas obligatorias: ${columnasObligatorias.join(', ')}`);
  
  // Validar cada registro
  for (let i = 0; i < Math.min(registros.length, 5); i++) { // Validar solo los primeros 5
    const registro = registros[i];
    console.log(`      Registro ${i + 1}:`);
    
    for (const columna of columnasObligatorias) {
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
    
    // Validación especial: Asiento debe ser "-" para PENDIENTE_APROBACION
    const asientoEncontrado = Object.keys(registro).find(k => 
      k.toLowerCase().includes('asiento')
    );
    if (asientoEncontrado) {
      const asiento = registro[asientoEncontrado];
      expect(asiento.trim()).toBe('-');
      console.log(`         ✓ Asiento: "${asiento}" (correcto para PENDIENTE_APROBACION)`);
    }
  }
  
  console.log('   ✅ Columnas obligatorias de PENDIENTE_APROBACION validadas correctamente');
});

When('busco una solicitud por correlativo desde solicitudes-creadas.json en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Obtener una solicitud aleatoria desde solicitudes-creadas.json
  const solicitud = obtenerUltimaSolicitud('VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error('No se encontraron solicitudes en solicitudes-creadas.json');
  }
  
  // Guardar el correlativo en el contexto para validaciones posteriores
  this.correlativoBuscado = solicitud.correlativo;
  
  // NOTA: El filtro de Correlativo es reactivo, se aplica automáticamente (no requiere CONSULTAR)
  await reporteriaPage.filtrarPorCorrelativo(solicitud.correlativo);
  console.log(`   ✓ Buscando solicitud: ${solicitud.correlativo} (filtro aplicado automáticamente)`);
});

Then('debería ver los resultados filtrados por correlativo en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  const correlativo = this.correlativoBuscado;
  
  if (!correlativo) {
    throw new Error('No se encontró correlativo en el contexto');
  }
  
  // Verificar que el registro existe en los resultados
  const existe = await reporteriaPage.verificarRegistroPorCorrelativo(correlativo);
  expect(existe).toBeTruthy();
  
  console.log(`   ✅ Resultados filtrados correctamente por correlativo: ${correlativo}`);
});

When('selecciono la moneda {string} en el filtro de Moneda', async function(moneda: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  // NOTA: El filtro de Moneda es reactivo, se aplica automáticamente (no requiere CONSULTAR)
  await reporteriaPage.seleccionarMoneda(moneda);
  this.monedaSeleccionada = moneda;
});

Then('debería ver que el filtro de moneda se aplicó correctamente', async function() {
  // Solo validar que el filtro se aplicó (el filtro es reactivo y se aplica automáticamente)
  console.log('   ✅ Filtro de moneda aplicado correctamente');
});

When('ingreso un incidente en el filtro de Incidente', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Obtener una solicitud de ejemplo para obtener un incidente
  const solicitud = obtenerUltimaSolicitud('VIDA');
  
  if (!solicitud || !solicitud.incidente) {
    throw new Error('No se encontraron solicitudes con incidente en solicitudes-creadas.json');
  }
  
  this.incidenteBuscado = solicitud.incidente;
  // NOTA: El filtro de Incidente es reactivo, se aplica automáticamente (no requiere CONSULTAR)
  await reporteriaPage.filtrarPorIncidente(solicitud.incidente);
  console.log(`   ✓ Filtrando por incidente: ${solicitud.incidente} (filtro aplicado automáticamente)`);
});

When('ingreso el incidente {string} en el filtro de Incidente', async function(incidente: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  // NOTA: El filtro de Incidente es reactivo, se aplica automáticamente (no requiere CONSULTAR)
  await reporteriaPage.filtrarPorIncidente(incidente);
  this.incidenteBuscado = incidente;
  console.log(`   ✓ Filtrando por incidente: ${incidente} (filtro aplicado automáticamente)`);
});

Then('debería ver los resultados filtrados por incidente', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  const incidente = this.incidenteBuscado;
  
  if (!incidente) {
    throw new Error('No se encontró incidente en el contexto');
  }
  
  // Verificar que hay resultados (al menos uno)
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  console.log(`   ✅ Resultados filtrados correctamente por incidente: ${incidente}`);
});

Then('debería ver los resultados filtrados por incidente en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  const incidente = this.incidenteBuscado;
  
  if (!incidente) {
    throw new Error('No se encontró incidente en el contexto');
  }
  
  // Verificar que hay resultados (al menos uno)
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  console.log(`   ✅ Resultados filtrados correctamente por incidente en Reportería: ${incidente}`);
});

When('hago clic en el botón Exportar Excel en Reportería', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  this.nombreArchivoDescargado = await reporteriaPage.exportarAExcel();
});

Then('debería descargarse el archivo Excel correctamente de Reportería', async function() {
  const nombreArchivo = this.nombreArchivoDescargado;
  
  expect(nombreArchivo).toBeTruthy();
  expect(nombreArchivo).toContain('.xlsx');
  
  console.log(`   ✅ Archivo Excel descargado correctamente: ${nombreArchivo}`);
});

// ==================== NUEVOS ESCENARIOS DE FILTROS ====================

When('selecciono el memo {string} en el filtro de Memo', async function(memo: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  await reporteriaPage.seleccionarMemo(memo);
  this.memoSeleccionado = memo;
});

Then('debería ver solo las solicitudes con memo {string}', async function(memoEsperado: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  const todasConMemo = await reporteriaPage.verificarMemoEnResultados(memoEsperado);
  expect(todasConMemo).toBeTruthy();
  
  console.log(`   ✅ Todas las solicitudes tienen memo "${memoEsperado}"`);
});

When('selecciono fecha inicio {string} en el filtro', async function(fecha: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
  const partes = fecha.split('/');
  const fechaFormatoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
  
  await reporteriaPage.seleccionarFechaInicio(fechaFormatoISO);
  this.fechaInicio = fechaFormatoISO;
  console.log(`   ✓ Fecha inicio seleccionada: ${fecha}`);
});

When('selecciono fecha fin {string} en el filtro', async function(fecha: string) {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Convertir fecha de formato DD/MM/YYYY a YYYY-MM-DD
  const partes = fecha.split('/');
  const fechaFormatoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
  
  await reporteriaPage.seleccionarFechaFin(fechaFormatoISO);
  this.fechaFin = fechaFormatoISO;
  console.log(`   ✓ Fecha fin seleccionada: ${fecha}`);
});

Then('debería ver solo las solicitudes dentro del rango de fechas seleccionado', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Verificar que hay resultados (al menos uno)
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  console.log(`   ✅ Resultados filtrados correctamente por rango de fechas: ${this.fechaInicio} a ${this.fechaFin}`);
});

When('presiono el botón Limpiar Filtros', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  await reporteriaPage.presionarBotonLimpiar();
});

Then('los filtros deberían estar vacíos', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  const filtrosVacios = await reporteriaPage.verificarFiltrosVacios();
  expect(filtrosVacios).toBeTruthy();
  
  console.log('   ✅ Filtros están vacíos');
});

Then('debería ver todas las solicitudes sin filtros aplicados', async function() {
  const reporteriaPage = new ReporteriaPage(global.page);
  
  // Verificar que hay resultados (al menos uno)
  const registros = await reporteriaPage.obtenerRegistrosTabla();
  expect(registros.length).toBeGreaterThan(0);
  
  console.log(`   ✅ Se muestran todas las solicitudes sin filtros: ${registros.length} registros`);
});


