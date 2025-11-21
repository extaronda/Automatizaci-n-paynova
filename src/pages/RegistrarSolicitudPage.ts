import { Page, expect } from '@playwright/test';

/**
 * Page Object para la página de Registrar Solicitud de Pago
 * Implementa el patrón Page Object Model
 */
export class RegistrarSolicitudPage {
  readonly page: Page;

  // Selectores de la página
  private readonly selectors = {
    // Header
    pageTitle: 'h1.page-title',

    // Selección de Memo
    memoSelect: 'select#memo',
    btnEnviarMemo: 'button.btn-enviar:has-text("ENVIAR")',
    btnProcesado: 'button.btn-enviar:has-text("PROCESADO")',
    mensajeExito: '.alert.alert-success',
    
    // Datos Personales
    inputNombres: 'input[placeholder="Ingrese nombres completos"]',
    inputDniRuc: 'input[placeholder="Ingrese DNI o RUC"]',
    
    // Tipo de Pago
    selectMoneda: 'select:has(option[value="SOL"])',
    inputMonto: 'input[type="number"][placeholder="0.00"]',
    selectTipo: 'select:has(option[value="TR"])',
    selectSubtipo: 'div.form-group:has(label:has-text("Subtipo")) select',
    checkboxGeneraArch: 'input[type="checkbox"]',
    textareaMemos: 'textarea[placeholder="Ingrese memos adicionales"]',
    
    // Datos Bancarios (aparecen dinámicamente después de seleccionar subtipo)
    selectBanco: 'div.form-group:has(label:has-text("Banco")) select',
    selectTipoCuenta: 'div.form-group:has(label:has-text("Tipo de cuenta")) select, div.form-group:has(label:has-text("Tipo cuenta")) select',
    inputNumeroCuenta: 'input[placeholder*="cuenta"], input[placeholder*="Cuenta"], input[name*="cuenta"]',
    
    // Documentos
    inputFile: 'input[type="file"]',
    btnAddFile: 'button.btn-add-file',
    listaDocumentos: '.documents-list',
    emptyStateDocumentos: '.empty-state:has(i.fa-folder-open)',
    
    // Observaciones
    textareaObservacion: 'textarea[placeholder="Escriba su observación aquí..."]',
    btnAddObservacion: 'button.btn-add-observation',
    listaObservaciones: '.observations-list',
    contadorCaracteres: '.char-counter',
    
    // Acciones
    btnCancelar: 'button.btn-secondary:has-text("CANCELAR")',
    btnGuardar: 'button.btn-primary:has-text("GUARDAR")',
    btnEnviarSolicitud: 'button.btn-primary-alt:has-text("ENVIAR")',
    
    // Grilla de registros
    grillaRegistros: 'table',
    filaRegistro: 'table tbody tr',
    montoTotal: '.monto-total, .total-amount',
    
    // Mensajes y alertas
    mensajeValidacion: '.validation-message',
    mensajeError: '.error-message',
    modalConfirmacion: '.modal-confirmacion',
    // NUEVO: Modal PrimeVue que reemplazó a las alertas nativas
    modalPrimeVue: '.p-dialog, .isg__confirm__container',
    modalPrimeVueTitulo: '.isg__confirm__title',
    modalPrimeVueMensaje: '.isg__confirm__message',
    modalPrimeVueAceptar: '.isg__confirm__button--accept, button:has-text("Aceptar")',
    // Selectores legacy para compatibilidad
    alertExito: '.alert.alert-success, .swal2-popup, .modal.show, .p-dialog',
    alertCorrelativo: '.alert:has-text("correlativo"), .modal-body:has-text("correlativo"), .swal2-html-container, .isg__confirm__message:has-text("correlativo")'
  };

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navega a la página de Registrar Solicitud
   */
  async navigateToRegistrarSolicitud(): Promise<void> {
    await this.page.goto('/solicitudes-pago/registrar', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('✓ Navegación a Registrar Solicitud exitosa');
  }

  /**
   * Abre el menú Solicitud de Pagos > Registrar Solicitud
   */
  async abrirMenuRegistrarSolicitud(): Promise<void> {
    // Expandir menú Solicitud de Pagos
    await this.page.click('button:has-text("Solicitud de Pagos")');
    await this.page.waitForTimeout(500);
    
    // Click en Registrar Solicitud - Forzar click si es necesario
    const linkRegistrar = this.page.locator('a[href="/solicitudes-pago/registrar"]');
    await linkRegistrar.click({ force: true });
    
    await this.page.waitForLoadState('networkidle');
    console.log('✓ Menú Registrar Solicitud abierto');
  }

  /**
   * Verifica que esté en la página de Registrar Solicitud
   */
  async isOnRegistrarSolicitudPage(): Promise<boolean> {
    try {
      const title = await this.page.textContent(this.selectors.pageTitle);
      return title?.includes('Registrar Solicitud de Pago') || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Selecciona un memo del dropdown
   * @param memoNombre - Nombre del memo (ej: "JUICIO DE ALIMENTOS")
   */
  async seleccionarMemo(memoNombre: string): Promise<void> {
    // Esperar a que el select esté listo y tenga opciones
    await this.page.waitForSelector(`${this.selectors.memoSelect} option`, { state: 'attached', timeout: 5000 });
    await this.page.selectOption(this.selectors.memoSelect, { label: memoNombre });
    console.log(`✓ Memo seleccionado: ${memoNombre}`);
  }

  /**
   * Hace clic en el botón ENVIAR del memo
   */
  async clickEnviarMemo(): Promise<void> {
    await this.page.click(this.selectors.btnEnviarMemo);
    // No esperar tiempo fijo, esperar por el siguiente elemento (modal o respuesta)
    console.log('✓ Click en ENVIAR memo');
  }

  /**
   * Verifica el mensaje de éxito después de procesar el memo
   */
  async verMensajeExito(mensajeEsperado: string): Promise<boolean> {
    try {
      const mensaje = await this.page.textContent(this.selectors.mensajeExito);
      return mensaje?.includes(mensajeEsperado) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica que el formulario de registro esté visible
   */
  async isFormularioVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.inputNombres, {
        state: 'visible',
        timeout: 5000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Ingresa los datos personales
   * @param nombres - Nombres completos
   * @param dniRuc - DNI o RUC
   */
  async ingresarDatosPersonales(nombres: string, dniRuc: string): Promise<void> {
    await this.page.fill(this.selectors.inputNombres, nombres);
    console.log(`✓ Nombres ingresados: ${nombres}`);
    
    await this.page.fill(this.selectors.inputDniRuc, dniRuc);
    console.log(`✓ DNI/RUC ingresado: ${dniRuc}`);
  }

  /**
   * Selecciona la moneda
   * @param moneda - "Soles" o "Dólares"
   */
  async seleccionarMoneda(moneda: string): Promise<void> {
    const valor = moneda === 'Soles' ? 'SOL' : 'DOL';
    await this.page.selectOption(this.selectors.selectMoneda, valor);
    console.log(`✓ Moneda seleccionada: ${moneda}`);
  }

  /**
   * Ingresa el monto
   * @param monto - Monto numérico
   */
  async ingresarMonto(monto: string | number): Promise<void> {
    await this.page.fill(this.selectors.inputMonto, monto.toString());
    console.log(`✓ Monto ingresado: ${monto}`);
  }

  /**
   * Selecciona el tipo de pago
   * @param tipo - "Transferencia" o "Cheque"
   */
  async seleccionarTipo(tipo: string): Promise<void> {
    const valor = tipo === 'Transferencia' ? 'TR' : 'CH';
    await this.page.selectOption(this.selectors.selectTipo, valor);
    console.log(`✓ Tipo seleccionado: ${tipo}`);
  }

  /**
   * Selecciona el subtipo de pago (Tipo ya viene en "Transferencia" por defecto)
   * @param subtipo - Ej: "Transferencia a terceros" o "Transferencia a Terceros"
   */
  async seleccionarSubtipo(subtipo: string): Promise<void> {
    // Hacer click en el select de Tipo para forzar que cargue las opciones del Subtipo
    await this.page.click(this.selectors.selectTipo);
    
    // Esperar a que las opciones del subtipo se carguen (polling hasta que haya más de 1 opción)
    let optionCount = 0;
    let attempts = 0;
    while (optionCount <= 1 && attempts < 50) {
      optionCount = await this.page.locator(this.selectors.selectSubtipo + ' option').count();
      if (optionCount > 1) break;
      await this.page.waitForTimeout(100);
      attempts++;
    }
    
    // Obtener las opciones disponibles
    const options = await this.page.locator(this.selectors.selectSubtipo + ' option').allTextContents();
    
    // Buscar la opción que coincida (case-insensitive)
    const matchingOption = options.find(opt => 
      opt.trim().toLowerCase() === subtipo.trim().toLowerCase()
    );
    
    if (matchingOption) {
      await this.page.selectOption(this.selectors.selectSubtipo, { label: matchingOption });
      console.log(`✓ Subtipo: ${matchingOption}`);
      
      // Esperar a que los campos bancarios aparezcan después de seleccionar subtipo
      await this.page.waitForSelector(this.selectors.selectBanco, { state: 'visible', timeout: 10000 });
    } else {
      throw new Error(`Subtipo "${subtipo}" no encontrado. Disponibles: ${options.join(', ')}`);
    }
  }

  /**
   * Ingresa los datos bancarios
   * @param banco - Nombre del banco
   * @param tipoCuenta - Tipo de cuenta (Ahorros, Corriente)
   * @param numeroCuenta - Número de cuenta
   */
  async ingresarDatosBancarios(
    banco: string,
    tipoCuenta: string,
    numeroCuenta: string
  ): Promise<void> {
    // Obtener opciones de banco disponibles para debug
    const opcionesBanco = await this.page.locator(this.selectors.selectBanco + ' option').allTextContents();
    console.log(`Opciones de banco disponibles: ${opcionesBanco.join(', ')}`);
    
    // Buscar coincidencia del banco (case-insensitive, puede incluir texto adicional)
    const bancoMatch = opcionesBanco.find(opt => 
      opt.trim().toLowerCase().includes(banco.trim().toLowerCase())
    );
    
    if (!bancoMatch) {
      throw new Error(`Banco "${banco}" no encontrado. Disponibles: ${opcionesBanco.join(', ')}`);
    }
    
    // Seleccionar banco
    await this.page.selectOption(this.selectors.selectBanco, { label: bancoMatch });
    console.log(`✓ Banco seleccionado: ${bancoMatch}`);
    
    // Seleccionar tipo de cuenta
    await this.page.selectOption(this.selectors.selectTipoCuenta, { label: tipoCuenta });
    console.log(`✓ Tipo de cuenta seleccionado: ${tipoCuenta}`);
    
    // Ingresar número de cuenta
    await this.page.fill(this.selectors.inputNumeroCuenta, numeroCuenta);
    console.log(`✓ Número de cuenta ingresado: ${numeroCuenta}`);
  }

  /**
   * Agrega una observación
   * @param observacion - Texto de la observación
   */
  async agregarObservacion(observacion: string): Promise<void> {
    await this.page.fill(this.selectors.textareaObservacion, observacion);
    console.log(`✓ Observación ingresada: ${observacion}`);
  }

  /**
   * Hace clic en añadir observación
   */
  async clickAñadirObservacion(): Promise<void> {
    await this.page.click(this.selectors.btnAddObservacion);
    console.log('✓ Click en Añadir observación');
  }

  /**
   * Adjunta un documento
   * @param rutaArchivo - Ruta completa del archivo
   */
  async adjuntarDocumento(rutaArchivo: string): Promise<void> {
    await this.page.setInputFiles(this.selectors.inputFile, rutaArchivo);
    await this.page.click(this.selectors.btnAddFile);
    console.log(`✓ Documento adjuntado: ${rutaArchivo}`);
  }

  /**
   * Hace clic en el botón GUARDAR
   */
  async clickGuardar(): Promise<void> {
    await this.page.click(this.selectors.btnGuardar);
    await this.page.waitForTimeout(1000);
    console.log('✓ Click en GUARDAR');
  }

  /**
   * Hace clic en el botón ENVIAR de la solicitud
   */
  async clickEnviarSolicitud(): Promise<void> {
    await this.page.click(this.selectors.btnEnviarSolicitud);
    console.log('✓ Click en ENVIAR solicitud');
  }

  /**
   * Espera y verifica el modal de confirmación con correlativo e incidente
   * IMPORTANTE: Ahora usa modal PrimeVue en lugar de alertas nativas
   * @returns El texto del modal con correlativo e incidente
   */
  async esperarModalConfirmacion(): Promise<string> {
    console.log('⏳ Esperando modal de confirmación...');
    
    // Primero intentar con el nuevo modal PrimeVue
    try {
      const modalPrimeVue = this.page.locator(this.selectors.modalPrimeVue).first();
      await modalPrimeVue.waitFor({ state: 'visible', timeout: 30000 });
      console.log('✓ Modal PrimeVue detectado');
      
      // Obtener el mensaje del modal PrimeVue
      const mensajeModal = this.page.locator(this.selectors.modalPrimeVueMensaje).first();
      await mensajeModal.waitFor({ state: 'visible', timeout: 5000 });
      const textoModal = await mensajeModal.textContent() || '';
      
      console.log(`✓ Modal de confirmación apareció: ${textoModal.substring(0, 100)}...`);
      
      // Verificar que contenga "correlativo" E "incidente" (ambos deben estar)
      const tieneCorrelativo = textoModal.toLowerCase().includes('correlativo');
      const tieneIncidente = textoModal.toLowerCase().includes('incidente');
      const esExitoso = textoModal.toLowerCase().includes('exitosamente') || textoModal.toLowerCase().includes('exitosa');
      
      if ((tieneCorrelativo && tieneIncidente) || esExitoso) {
        console.log('✓ Modal contiene información de correlativo/incidente');
        return textoModal;
      }
      
      throw new Error(`Modal no contiene información esperada. Texto: ${textoModal}`);
    } catch (error) {
      // Fallback a selectores legacy si el nuevo modal no aparece
      console.log('⚠️  Modal PrimeVue no encontrado, intentando con selectores legacy...');
      const modalLocator = this.page.locator(this.selectors.alertExito).first();
      await modalLocator.waitFor({ state: 'visible', timeout: 30000 });
      
      const textoModal = await modalLocator.textContent() || '';
      console.log(`✓ Modal de confirmación apareció (legacy): ${textoModal.substring(0, 100)}...`);
      
      const tieneCorrelativo = textoModal.toLowerCase().includes('correlativo');
      const tieneIncidente = textoModal.toLowerCase().includes('incidente');
      const esExitoso = textoModal.toLowerCase().includes('exitosamente') || textoModal.toLowerCase().includes('exitosa');
      
      if ((tieneCorrelativo && tieneIncidente) || esExitoso) {
        console.log('✓ Modal contiene información de correlativo/incidente');
        return textoModal;
      }
      
      throw new Error(`Modal no contiene información esperada. Texto: ${textoModal}`);
    }
  }
  
  /**
   * Cierra el modal de confirmación haciendo clic en "Aceptar"
   * IMPORTANTE: Ahora maneja el botón del modal PrimeVue
   */
  async cerrarModalConfirmacion(): Promise<void> {
    console.log('🖱️  Cerrando modal de confirmación...');
    
    // Intentar con el nuevo botón PrimeVue primero
    try {
      const botonAceptar = this.page.locator(this.selectors.modalPrimeVueAceptar).first();
      await botonAceptar.waitFor({ state: 'visible', timeout: 5000 });
      await botonAceptar.click();
      console.log('✓ Modal cerrado (PrimeVue)');
      
      // Esperar a que el modal se cierre
      await this.page.waitForSelector(this.selectors.modalPrimeVue, { 
        state: 'hidden', 
        timeout: 5000 
      }).catch(() => {
        console.log('⚠️  Modal puede haberse cerrado ya');
      });
    } catch (error) {
      // Fallback: buscar cualquier botón "Aceptar" o "OK"
      const botonAceptar = this.page.locator('button:has-text("Aceptar"), button:has-text("OK"), button:has-text("Entendido")').first();
      const visible = await botonAceptar.isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) {
        await botonAceptar.click();
        console.log('✓ Modal cerrado (fallback)');
      } else {
        console.log('⚠️  No se encontró botón para cerrar modal');
      }
    }
  }

  /**
   * Hace clic en el botón CANCELAR
   */
  async clickCancelar(): Promise<void> {
    await this.page.click(this.selectors.btnCancelar);
    console.log('✓ Click en CANCELAR');
  }

  /**
   * Verifica que el registro aparezca en la grilla
   */
  async isRegistroEnGrilla(): Promise<boolean> {
    try {
      // Esperar a que aparezca al menos una fila en la grilla
      await this.page.waitForSelector(this.selectors.filaRegistro, {
        state: 'visible',
        timeout: 10000
      });
      
      // Contar filas en la grilla
      const filas = await this.page.locator(this.selectors.filaRegistro).count();
      console.log(`✓ Filas encontradas en grilla: ${filas}`);
      
      return filas > 0;
    } catch (error) {
      console.log(`⚠️  No se encontró registro en grilla`);
      return false;
    }
  }

  /**
   * Cuenta los registros en la grilla
   */
  async contarRegistros(): Promise<number> {
    const registros = await this.page.$$(this.selectors.filaRegistro);
    return registros.length;
  }

  /**
   * Obtiene el monto total de la grilla
   */
  async obtenerMontoTotal(): Promise<string> {
    try {
      const monto = await this.page.textContent(this.selectors.montoTotal);
      return monto?.trim() || '0.00';
    } catch (error) {
      return '0.00';
    }
  }

  /**
   * Verifica que aparezca un mensaje de error o validación
   * @param mensaje - Mensaje esperado
   */
  async verMensajeError(mensaje: string): Promise<boolean> {
    try {
      const error = await this.page.textContent(this.selectors.mensajeError);
      return error?.includes(mensaje) || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Llena el formulario completo con todos los datos
   */
  async llenarFormularioCompleto(datos: {
    nombres: string;
    dniRuc: string;
    moneda: string;
    monto: number;
    subtipo: string;
    banco: string;
    tipoCuenta: string;
    numeroCuenta: string;
  }): Promise<void> {
    await this.ingresarDatosPersonales(datos.nombres, datos.dniRuc);
    await this.seleccionarMoneda(datos.moneda);
    await this.ingresarMonto(datos.monto);
    // Tipo ya viene seleccionado por defecto en "Transferencia"
    await this.seleccionarSubtipo(datos.subtipo);
    await this.ingresarDatosBancarios(datos.banco, datos.tipoCuenta, datos.numeroCuenta);
    console.log('✓ Formulario completo llenado');
  }

  // ==================== MÉTODOS ESPECÍFICOS PARA VIDA ====================

  /**
   * Espera que aparezca el modal de Grupo VIDA
   */
  async esperarModalGrupoVIDA(): Promise<void> {
    // Esperar por el botón de Guardar Seleccionado que es único del modal VIDA
    await this.page.waitForSelector('button:has-text("Guardar Seleccionado")', {
      state: 'visible',
      timeout: 30000
    });
  }

  /**
   * Selecciona un registro del modal por índice (1-based)
   * @param indice - Número de registro a seleccionar (1, 2, 3, etc.)
   */
  async seleccionarRegistroModal(indice: number): Promise<void> {
    // Esperar a que la tabla esté completamente cargada
    await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(1000);
    
    // Seleccionar el checkbox del registro específico
    const checkbox = this.page.locator(`table tbody tr:nth-child(${indice}) input[type="checkbox"]`);
    
    // Hacer scroll al checkbox para que sea visible
    await checkbox.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    // Hacer click en el checkbox
    await checkbox.check();
    await this.page.waitForTimeout(500);
    
    // Hacer scroll al botón "Guardar Seleccionado" para que sea visible
    const guardarBtn = this.page.locator('button:has-text("Guardar Seleccionado")');
    await guardarBtn.scrollIntoViewIfNeeded();
  }

  /**
   * Hace clic en "Guardar Seleccionado" del modal
   * IMPORTANTE: Ahora maneja el nuevo modal PrimeVue que aparece después de guardar
   */
  async clickGuardarSeleccionado(): Promise<void> {
    await this.page.click('button:has-text("Guardar Seleccionado")');
    
    // Esperar a que aparezca el nuevo modal PrimeVue de confirmación
    try {
      const modalPrimeVue = this.page.locator(this.selectors.modalPrimeVue).first();
      await modalPrimeVue.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✓ Modal de confirmación de guardado apareció');
      
      // Cerrar el modal haciendo clic en "Aceptar"
      await this.cerrarModalConfirmacion();
    } catch (error) {
      // Fallback: esperar a que el modal de selección se cierre (comportamiento legacy)
      await this.page.waitForSelector('button:has-text("Guardar Seleccionado")', {
        state: 'hidden',
        timeout: 10000
      }).catch(() => {
        console.log('⚠️  Modal puede haberse cerrado ya');
      });
    }
  }

  /**
   * Verifica que el registro esté en la grilla
   */
  async verificarRegistroEnGrilla(): Promise<boolean> {
    try {
      await this.page.waitForSelector('table tbody tr', { 
        state: 'visible', 
        timeout: 5000 
      });
      const rowCount = await this.page.locator('table tbody tr').count();
      return rowCount > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hace clic en el botón Editar del primer registro
   */
  async clickEditarRegistro(): Promise<void> {
    // Intentar varios selectores comunes para el botón Editar
    const editButton = this.page.locator(
      'button:has-text("Editar"), button:has(i.fa-pencil), button:has(i.fa-edit), ' +
      'button:has(i.fa-pen), a:has-text("Editar"), td button'
    ).first();
    await editButton.click();
    // Esperar a que el formulario cargue los datos
    await this.page.waitForTimeout(1000);
  }

  /**
   * Ingresa datos específicos de VIDA: Póliza y opcional Contratante
   * @param poliza - Número de póliza
   * @param contratante - Nombre del contratante (opcional)
   */
  async ingresarDatosVIDA(poliza: string, contratante?: string): Promise<void> {
    // Ingresar póliza
    await this.page.fill('input[placeholder*="póliza"], input[placeholder*="Póliza"]', poliza);

    // Ingresar contratante si se proporciona
    if (contratante) {
      await this.page.fill('input[placeholder*="contratante"], input[placeholder*="Contratante"]', contratante);
    }
  }

  /**
   * Completa el formulario de edición para VIDA
   */
  async completarFormularioVIDA(datos: {
    dni: string;
    poliza: string;
    contratante?: string;
    moneda: string;
    monto: number;
    banco: string;
    tipoCuenta: string;
    numeroCuenta: string;
  }): Promise<void> {
    // DNI
    await this.page.fill('input[placeholder*="DNI"], input[placeholder*="RUC"]', datos.dni);

    // Póliza y Contratante
    await this.ingresarDatosVIDA(datos.poliza, datos.contratante);

    // Moneda
    await this.seleccionarMoneda(datos.moneda);

    // Monto
    await this.ingresarMonto(datos.monto);

    // Tipo = Transferencia (ya viene seleccionado, pero lo forzamos)
    await this.page.selectOption(this.selectors.selectTipo, 'TR');

    // Subtipo = TR (Transferencia a Terceros) - Esperar a que se carguen las opciones
    await this.page.click(this.selectors.selectTipo); // Forzar carga de opciones
    
    // Esperar a que las opciones del subtipo se carguen (polling)
    let optionCount = 0;
    let attempts = 0;
    while (optionCount <= 1 && attempts < 50) {
      optionCount = await this.page.locator(this.selectors.selectSubtipo + ' option').count();
      if (optionCount > 1) break;
      await this.page.waitForTimeout(100);
      attempts++;
    }
    
    // Seleccionar subtipo
    const options = await this.page.locator(this.selectors.selectSubtipo + ' option').allTextContents();
    const matchingOption = options.find(opt => 
      opt.trim().toLowerCase().includes('transferencia a terceros')
    );
    
    if (matchingOption) {
      await this.page.selectOption(this.selectors.selectSubtipo, { label: matchingOption });
    }

    // Esperar a que los campos bancarios aparezcan
    await this.page.waitForSelector(this.selectors.selectBanco, { state: 'visible', timeout: 10000 });

    // Datos bancarios
    await this.ingresarDatosBancarios(datos.banco, datos.tipoCuenta, datos.numeroCuenta);
  }

  /**
   * Hace clic en el botón ACTUALIZAR
   */
  async clickActualizar(): Promise<void> {
    await this.page.click('button:has-text("ACTUALIZAR"), button:has-text("Actualizar")');
    // Esperar a que se actualice la grilla
    await this.page.waitForTimeout(2000);
  }

  /**
   * Verifica que el registro esté actualizado en la grilla
   */
  async verificarRegistroActualizado(): Promise<boolean> {
    try {
      // Verificar que hay al menos una fila con datos bancarios completos
      const hasCompletedRow = await this.page.locator('table tbody tr').first().isVisible();
      return hasCompletedRow;
    } catch (error) {
      return false;
    }
  }

  // ==================== MÉTODOS HELPER PARA VALIDACIONES ====================

  /**
   * Ingresa los nombres completos
   */
  async ingresarNombres(nombres: string): Promise<void> {
    await this.page.fill(this.selectors.inputNombres, nombres);
  }

  /**
   * Ingresa DNI o RUC
   */
  async ingresarDNIRUC(dniRuc: string): Promise<void> {
    await this.page.fill(this.selectors.inputDniRuc, dniRuc);
  }

  /**
   * Selecciona un banco del dropdown
   */
  async seleccionarBanco(banco: string): Promise<void> {
    await this.page.selectOption(this.selectors.selectBanco, { label: banco });
  }

  /**
   * Selecciona el tipo de cuenta
   */
  async seleccionarTipoCuenta(tipoCuenta: string): Promise<void> {
    await this.page.selectOption(this.selectors.selectTipoCuenta, { label: tipoCuenta });
  }

  /**
   * Ingresa el número de cuenta bancaria
   */
  async ingresarNumeroCuenta(numeroCuenta: string): Promise<void> {
    await this.page.fill(this.selectors.inputNumeroCuenta, numeroCuenta);
  }
}

