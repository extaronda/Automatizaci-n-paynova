/**
 * Page Object para la funcionalidad de Reportería de Solicitudes
 * Maneja la navegación, filtros y validaciones de la página de Reportería
 */

import { Page } from '@playwright/test';

export class ReporteriaPage {
  constructor(private page: Page) {}

  // ==================== SELECTORES ====================

  private selectors = {
    // Navegación
    menuSolicitudPagos: 'button:has-text("Solicitud de Pagos")',
    linkReporteria: 'a[href="/solicitudes-pago/reporte"].submenu-item',
    
    // Filtros (capturados con MCP Playwright)
    filtroCorrelativo: 'input[placeholder*="Buscar por correlativo"]',
    filtroMoneda: 'select', // Se busca por contexto del label "Moneda"
    filtroIncidente: 'input[placeholder*="Buscar por incidente"]',
    filtroEstado: 'select', // Se busca por contexto del label "Estado"
    botonConsultar: 'button:has-text("CONSULTAR"), button.btn-primary:has-text("🔍 CONSULTAR")',
    botonLimpiarFiltros: 'button:has-text("LIMPIAR"), button:has-text("🗑️ LIMPIAR")',
    botonExportarExcel: 'button:has-text("EXCEL"), button.btn-success:has-text("📊 EXCEL")',
    
    // Tabla
    tablaReporteria: 'table tbody tr',
    columnasTablaReporteria: 'table thead th',
  };

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la página de Reportería de Solicitudes
   * URL real: /solicitudes-pago/reporte
   * NOTA: La tabla puede estar vacía inicialmente, solo esperamos el título y los filtros
   */
  async navegarAReporteria(): Promise<void> {
    // Verificar si ya estamos en Reportería
    const currentUrl = this.page.url();
    if (currentUrl.includes('/solicitudes-pago/reporte')) {
      // Esperar solo el título o los filtros, no la tabla (puede estar vacía)
      await this.page.waitForSelector('text=REPORTE DE DATOS PAYNOVA', { state: 'visible', timeout: 5000 }).catch(() => {});
      return;
    }
    
    // 1. Expandir menú Solicitud de Pagos
    const menuButton = this.page.locator(this.selectors.menuSolicitudPagos);
    await menuButton.waitFor({ state: 'visible', timeout: 3000 });
    await menuButton.click();
    
    // 2. Esperar a que aparezca el submenu
    await this.page.waitForSelector(this.selectors.linkReporteria, { state: 'visible', timeout: 2000 });
    
    // 3. Hacer clic en el enlace "Reportes" (Reportería)
    const linkReporteria = this.page.locator(this.selectors.linkReporteria);
    await linkReporteria.click({ force: true });
    
    // 4. Esperar a que cargue la página de Reportería (título y filtros)
    // NO esperamos la tabla porque puede estar vacía hasta presionar CONSULTAR
    await this.page.waitForSelector('text=REPORTE DE DATOS PAYNOVA', { state: 'visible', timeout: 10000 });
    await this.page.waitForSelector(this.selectors.botonConsultar, { state: 'visible', timeout: 5000 });
    console.log('✓ Navegado a Reportería de Solicitudes');
  }

  // ==================== FILTROS ====================

  /**
   * Obtiene los filtros visibles en la página de Reportería
   */
  async obtenerFiltrosReporteria(): Promise<string[]> {
    const filtros: string[] = [];
    
    // Buscar campos de filtro comunes
    const inputs = await this.page.locator('input[type="text"], input[type="number"]').all();
    const selects = await this.page.locator('select').all();
    const buttons = await this.page.locator('button').all();
    
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      if (placeholder) filtros.push(placeholder);
      if (name && !filtros.includes(name)) filtros.push(name);
    }
    
    for (const select of selects) {
      const label = await select.locator('..').locator('label').textContent().catch(() => null);
      const name = await select.getAttribute('name');
      if (label) filtros.push(label.trim());
      if (name && !filtros.includes(name)) filtros.push(name);
    }
    
    for (const button of buttons) {
      const text = await button.textContent();
      if (text && (text.includes('Consultar') || text.includes('Limpiar') || text.includes('Exportar'))) {
        filtros.push(text.trim());
      }
    }
    
    return filtros;
  }

  /**
   * Filtra por correlativo en Reportería
   * NOTA: Este filtro es reactivo, se aplica automáticamente al escribir (no requiere CONSULTAR)
   */
  async filtrarPorCorrelativo(correlativo: string): Promise<void> {
    await this.page.fill(this.selectors.filtroCorrelativo, correlativo);
    // Esperar a que se aplique el filtro automáticamente
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector(this.selectors.tablaReporteria, { state: 'visible', timeout: 5000 });
    console.log(`   ✓ Filtro por correlativo aplicado automáticamente: ${correlativo}`);
  }

  /**
   * Selecciona moneda en el filtro de Reportería
   * Valores posibles: SOL, DOL, EUR
   * NOTA: Este filtro es reactivo, se aplica automáticamente al seleccionar (no requiere CONSULTAR)
   */
  async seleccionarMoneda(moneda: string): Promise<void> {
    // Buscar el select de Moneda por contexto (label que contiene "Moneda")
    const monedaSelect = this.page.locator('label:has-text("Moneda")').locator('..').locator('select.form-select').first();
    await monedaSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    // Mapear valores comunes
    let valorMoneda = moneda;
    if (moneda === 'PEN' || moneda === 'Soles') valorMoneda = 'SOL';
    if (moneda === 'USD' || moneda === 'Dólares') valorMoneda = 'DOL';
    if (moneda === 'EUR' || moneda === 'Euros') valorMoneda = 'EUR';
    
    await monedaSelect.selectOption({ value: valorMoneda });
    // Esperar a que se aplique el filtro automáticamente (sin esperar tabla porque puede estar vacía)
    await this.page.waitForTimeout(1000);
    console.log(`   ✓ Moneda seleccionada y filtro aplicado automáticamente: ${moneda} (valor: ${valorMoneda})`);
  }

  /**
   * Ingresa incidente en el filtro de Reportería
   * NOTA: Este filtro es reactivo, se aplica automáticamente al escribir (no requiere CONSULTAR)
   */
  async filtrarPorIncidente(incidente: string): Promise<void> {
    await this.page.fill(this.selectors.filtroIncidente, incidente);
    // Esperar a que se aplique el filtro automáticamente
    await this.page.waitForTimeout(1000);
    await this.page.waitForSelector(this.selectors.tablaReporteria, { state: 'visible', timeout: 5000 });
    console.log(`   ✓ Filtro por incidente aplicado automáticamente: ${incidente}`);
  }

  /**
   * Selecciona estado en el filtro de Reportería
   * Valores posibles: PENDIENTE_APROBACION, APROBADO, RECHAZADO, OBSERVADO
   */
  async seleccionarEstado(estado: string): Promise<void> {
    // Buscar el select de Estado por contexto (label que contiene "Estado")
    const estadoSelect = this.page.locator('label:has-text("Estado")').locator('..').locator('select').first();
    await estadoSelect.waitFor({ state: 'visible', timeout: 5000 });
    
    // Mapear valores comunes
    let valorEstado = estado;
    if (estado === 'PENDIENTE') valorEstado = 'PENDIENTE_APROBACION';
    
    await estadoSelect.selectOption({ value: valorEstado });
    console.log(`   ✓ Estado seleccionado: ${estado} (valor: ${valorEstado})`);
  }

  /**
   * Presiona el botón Consultar en Reportería
   */
  async presionarBotonConsultar(): Promise<void> {
    await this.page.click(this.selectors.botonConsultar);
    // Esperar a que carguen los resultados
    await this.page.waitForTimeout(2000);
    await this.page.waitForSelector(this.selectors.tablaReporteria, { state: 'visible', timeout: 10000 });
    console.log('   ✓ Botón Consultar presionado');
  }

  /**
   * Selecciona Memo en el filtro de Reportería
   */
  async seleccionarMemo(memo: string): Promise<void> {
    // Buscar el select de Memo por contexto (label que contiene "Memo")
    const memoSelect = this.page.locator('label:has-text("Memo")').locator('..').locator('select').first();
    await memoSelect.waitFor({ state: 'visible', timeout: 5000 });
    await memoSelect.selectOption({ label: memo });
    console.log(`   ✓ Memo seleccionado: ${memo}`);
  }

  /**
   * Selecciona Área en el filtro de Reportería
   */
  async seleccionarArea(area: string): Promise<void> {
    // Buscar el select de Área por contexto (label que contiene "Área")
    const areaSelect = this.page.locator('label:has-text("Área")').locator('..').locator('select').first();
    await areaSelect.waitFor({ state: 'visible', timeout: 5000 });
    await areaSelect.selectOption({ label: area });
    console.log(`   ✓ Área seleccionada: ${area}`);
  }

  /**
   * Ingresa monto mínimo en el filtro
   */
  async ingresarMontoMinimo(monto: string): Promise<void> {
    const montoMinInput = this.page.locator('input[placeholder*="Monto Mínimo"], input[name*="montoMin"]').first();
    await montoMinInput.waitFor({ state: 'visible', timeout: 5000 });
    await montoMinInput.fill(monto);
    console.log(`   ✓ Monto mínimo ingresado: ${monto}`);
  }

  /**
   * Ingresa monto máximo en el filtro
   */
  async ingresarMontoMaximo(monto: string): Promise<void> {
    const montoMaxInput = this.page.locator('input[placeholder*="Monto Máximo"], input[name*="montoMax"]').first();
    await montoMaxInput.waitFor({ state: 'visible', timeout: 5000 });
    await montoMaxInput.fill(monto);
    console.log(`   ✓ Monto máximo ingresado: ${monto}`);
  }

  /**
   * Selecciona fecha inicio en el filtro
   * Formato esperado: YYYY-MM-DD (los inputs type="date" requieren este formato)
   */
  async seleccionarFechaInicio(fechaISO: string): Promise<void> {
    // Buscar el input de fecha inicio - los inputs type="date" están en el mismo div que el label
    const fechaInicioInput = this.page.locator('label:has-text("Fecha Inicio")').locator('..').locator('input[type="date"]').first();
    await fechaInicioInput.waitFor({ state: 'visible', timeout: 5000 });
    await fechaInicioInput.click(); // Hacer clic para abrir el date picker
    await fechaInicioInput.fill(fechaISO); // Los inputs type="date" requieren formato YYYY-MM-DD
    await fechaInicioInput.press('Enter'); // Presionar Enter para confirmar
    console.log(`   ✓ Fecha inicio seleccionada: ${fechaISO}`);
  }

  /**
   * Selecciona fecha fin en el filtro
   * Formato esperado: YYYY-MM-DD (los inputs type="date" requieren este formato)
   */
  async seleccionarFechaFin(fechaISO: string): Promise<void> {
    // Buscar el input de fecha fin - los inputs type="date" están en el mismo div que el label
    const fechaFinInput = this.page.locator('label:has-text("Fecha Fin")').locator('..').locator('input[type="date"]').first();
    await fechaFinInput.waitFor({ state: 'visible', timeout: 5000 });
    await fechaFinInput.click(); // Hacer clic para abrir el date picker
    await fechaFinInput.fill(fechaISO); // Los inputs type="date" requieren formato YYYY-MM-DD
    await fechaFinInput.press('Enter'); // Presionar Enter para confirmar
    console.log(`   ✓ Fecha fin seleccionada: ${fechaISO}`);
  }

  /**
   * Presiona el botón Limpiar Filtros
   */
  async presionarBotonLimpiar(): Promise<void> {
    const botonLimpiar = this.page.locator(this.selectors.botonLimpiarFiltros).first();
    await botonLimpiar.waitFor({ state: 'visible', timeout: 5000 });
    await botonLimpiar.click();
    await this.page.waitForTimeout(1000);
    console.log('   ✓ Botón Limpiar Filtros presionado');
  }

  /**
   * Verifica que los filtros están vacíos
   */
  async verificarFiltrosVacios(): Promise<boolean> {
    const correlativoValue = await this.page.locator(this.selectors.filtroCorrelativo).inputValue();
    const incidenteValue = await this.page.locator(this.selectors.filtroIncidente).inputValue();
    
    const filtrosVacios = !correlativoValue && !incidenteValue;
    
    if (filtrosVacios) {
      console.log('   ✓ Filtros están vacíos');
    } else {
      console.log(`   ⚠️  Filtros no están completamente vacíos. Correlativo: "${correlativoValue}", Incidente: "${incidenteValue}"`);
    }
    
    return filtrosVacios;
  }

  /**
   * Verifica que todos los registros tienen el memo especificado
   */
  async verificarMemoEnResultados(memoEsperado: string): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const memo = registro['Memo'] || '';
      if (!memo.toLowerCase().includes(memoEsperado.toLowerCase())) {
        console.log(`   ⚠️  Registro con memo diferente encontrado: ${memo}`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros tienen memo "${memoEsperado}"`);
    return true;
  }

  /**
   * Verifica que todos los registros pertenecen al área especificada
   */
  async verificarAreaEnResultados(areaEsperada: string): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const area = registro['Área'] || '';
      if (!area.toLowerCase().includes(areaEsperada.toLowerCase())) {
        console.log(`   ⚠️  Registro con área diferente encontrado: ${area}`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros pertenecen al área "${areaEsperada}"`);
    return true;
  }

  /**
   * Verifica que todos los registros tienen montos dentro del rango especificado
   */
  async verificarRangoMontosEnResultados(montoMin: number, montoMax: number): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const montoTexto = registro['Monto'] || '';
      // Extraer número del texto (ej: "S/ 400.00" -> 400)
      const montoMatch = montoTexto.match(/[\d,]+\.?\d*/);
      if (montoMatch) {
        const monto = parseFloat(montoMatch[0].replace(/,/g, ''));
        if (monto < montoMin || monto > montoMax) {
          console.log(`   ⚠️  Registro con monto fuera de rango: ${montoTexto} (esperado: ${montoMin}-${montoMax})`);
          return false;
        }
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros tienen montos entre ${montoMin} y ${montoMax}`);
    return true;
  }

  // ==================== TABLA ====================

  /**
   * Obtiene las columnas de la tabla de Reportería
   * NOTA: Asegura que haya datos cargados antes de obtener columnas (presiona CONSULTAR si es necesario)
   */
  async obtenerColumnasTabla(): Promise<string[]> {
    const columnas: string[] = [];
    
    try {
      // Verificar si hay columnas visibles
      const headers = await this.page.locator(this.selectors.columnasTablaReporteria).all();
      
      // Si no hay columnas visibles, presionar CONSULTAR primero
      if (headers.length === 0) {
        console.log('   ⚠️  No hay columnas visibles, presionando CONSULTAR primero...');
        await this.presionarBotonConsultar();
        await this.page.waitForTimeout(2000);
        // Reintentar obtener columnas
        const headersAfter = await this.page.locator(this.selectors.columnasTablaReporteria).all();
        for (const header of headersAfter) {
          const texto = await header.textContent();
          if (texto && texto.trim()) {
            columnas.push(texto.trim());
          }
        }
      } else {
        for (const header of headers) {
          const texto = await header.textContent();
          if (texto && texto.trim()) {
            columnas.push(texto.trim());
          }
        }
      }
    } catch (error) {
      console.log('   ⚠️  Error al obtener columnas de Reportería:', error);
    }
    
    return columnas;
  }

  /**
   * Obtiene los registros de la tabla de Reportería
   */
  async obtenerRegistrosTabla(): Promise<any[]> {
    const registros: any[] = [];
    
    try {
      const columnas = await this.obtenerColumnasTabla();
      
      if (columnas.length === 0) {
        console.log('   ⚠️  No se encontraron columnas en la tabla de Reportería');
        return registros;
      }
      
      const filas = await this.page.locator(this.selectors.tablaReporteria).all();
      
      for (const fila of filas) {
        const registro: any = {};
        const celdas = await fila.locator('td').all();
        
        for (let i = 0; i < Math.min(celdas.length, columnas.length); i++) {
          const valor = await celdas[i].textContent();
          registro[columnas[i]] = valor ? valor.trim() : '';
        }
        
        if (Object.keys(registro).length > 0) {
          registros.push(registro);
        }
      }
    } catch (error) {
      console.log('   ⚠️  Error al obtener registros de Reportería:', error);
    }
    
    return registros;
  }

  // ==================== VALIDACIONES ====================

  /**
   * Verifica que todos los registros tienen el estado especificado
   */
  async verificarEstadoEnResultados(estadoEsperado: string): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const estado = registro['Estado'] || '';
      if (!estado.toLowerCase().includes(estadoEsperado.toLowerCase())) {
        console.log(`   ⚠️  Registro con estado diferente encontrado: ${estado}`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros tienen estado "${estadoEsperado}"`);
    return true;
  }

  /**
   * Verifica que los registros APROBADO tienen Asiento con valor válido
   */
  async verificarAsientoAprobado(): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const asiento = registro['Asiento'] || '';
      if (!asiento || asiento.trim() === '' || asiento.trim() === '-') {
        console.log(`   ⚠️  Registro APROBADO sin Asiento válido: "${asiento}"`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros APROBADO tienen Asiento válido`);
    return true;
  }

  /**
   * Verifica que los registros PENDIENTE_APROBACION tienen Asiento igual a "-"
   */
  async verificarAsientoPendiente(): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const asiento = registro['Asiento'] || '';
      if (asiento.trim() !== '-') {
        console.log(`   ⚠️  Registro PENDIENTE_APROBACION con Asiento diferente a "-": "${asiento}"`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros PENDIENTE_APROBACION tienen Asiento = "-"`);
    return true;
  }

  /**
   * Verifica que un registro existe en Reportería por correlativo
   */
  async verificarRegistroPorCorrelativo(correlativo: string): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    for (const registro of registros) {
      const correlativoRegistro = registro['Correlativo'] || '';
      if (correlativoRegistro.includes(correlativo)) {
        console.log(`   ✓ Registro encontrado: ${correlativo}`);
        return true;
      }
    }
    
    console.log(`   ⚠️  Registro no encontrado: ${correlativo}`);
    return false;
  }

  /**
   * Verifica que todos los registros tienen la moneda especificada
   */
  async verificarMonedaEnResultados(monedaEsperada: string): Promise<boolean> {
    const registros = await this.obtenerRegistrosTabla();
    
    if (registros.length === 0) {
      console.log('   ⚠️  No hay registros para validar');
      return false;
    }
    
    for (const registro of registros) {
      const moneda = registro['Moneda'] || '';
      if (!moneda.toLowerCase().includes(monedaEsperada.toLowerCase())) {
        console.log(`   ⚠️  Registro con moneda diferente encontrado: ${moneda}`);
        return false;
      }
    }
    
    console.log(`   ✓ Todos los ${registros.length} registros tienen moneda "${monedaEsperada}"`);
    return true;
  }

  // ==================== EXPORTACIÓN ====================

  /**
   * Exporta Reportería a Excel
   * Similar al método de Histórico
   * NOTA: Asegura que haya datos cargados antes de exportar (presiona CONSULTAR si es necesario)
   */
  async exportarAExcel(): Promise<string> {
    // Verificar si hay datos en la tabla antes de exportar
    const tabla = this.page.locator(this.selectors.tablaReporteria);
    const tieneDatos = await tabla.count().catch(() => 0);
    
    // Si no hay datos, presionar CONSULTAR primero
    if (tieneDatos === 0) {
      console.log('   ⚠️  No hay datos en la tabla, presionando CONSULTAR primero...');
      await this.presionarBotonConsultar();
      // Esperar a que carguen los datos
      await this.page.waitForTimeout(2000);
    }
    
    // Configurar listener para la descarga ANTES de hacer clic
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 });
    
    // Hacer clic en el botón Exportar Excel
    const botonExportar = this.page.locator(this.selectors.botonExportarExcel);
    await botonExportar.waitFor({ state: 'visible', timeout: 5000 });
    await botonExportar.click();
    
    console.log('   ✓ Botón Exportar Excel presionado, esperando descarga...');
    
    // Esperar la descarga
    const download = await downloadPromise;
    const nombreArchivo = download.suggestedFilename();
    
    console.log(`   ✓ Archivo descargado: ${nombreArchivo}`);
    
    return nombreArchivo;
  }
}

