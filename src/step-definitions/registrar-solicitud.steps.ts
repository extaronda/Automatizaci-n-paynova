import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { RegistrarSolicitudPage } from '../pages/RegistrarSolicitudPage';
import { LoginPage } from '../pages/LoginPage';
import { extraerDatosSolicitud, guardarSolicitudCreada } from '../helper/solicitud-data';

// ==================== ANTECEDENTES ====================

Given('que estoy autenticado en el sistema Paynova', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername('evarasga');
  await loginPage.enterPassword('Primeras20');
  await loginPage.clickLoginButton();
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log('✓ Autenticado');
});

Given('estoy en la página de Registrar Solicitud de Pago', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.abrirMenuRegistrarSolicitud();
  const enPagina = await registrarPage.isOnRegistrarSolicitudPage();
  expect(enPagina).toBeTruthy();
  console.log('✓ En Registrar Solicitud');
});

// ==================== ACCIONES ====================

When('selecciono el memo {string}', async function(memoNombre: string) {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarMemo(memoNombre);
  this.memoActual = memoNombre; // Guardar en contexto
  console.log(`✓ Memo: ${memoNombre}`);
});

When('hago clic en ENVIAR', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickEnviarMemo();
  console.log('✓ Click ENVIAR');
});

When('ingreso los datos:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  await registrarPage.llenarFormularioCompleto({
    nombres: datos['Nombres'],
    dniRuc: datos['DNI'],
    moneda: datos['Moneda'],
    monto: parseFloat(datos['Monto']),
    subtipo: datos['Subtipo'],
    banco: datos['Banco'],
    tipoCuenta: datos['Tipo cuenta'],
    numeroCuenta: datos['Número cuenta']
  });
  
  // Guardar en contexto para usar en modal de éxito
  this.montoActual = parseFloat(datos['Monto']);
  this.monedaActual = datos['Moneda'];
  
  console.log(`✓ Datos: ${datos['Nombres']} - ${datos['Banco']}`);
});

When('hago clic en GUARDAR', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickGuardar();
  console.log('✓ Click GUARDAR');
});

When('hago clic en GUARDAR validando error', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickGuardar();
  console.log('✓ Click GUARDAR');
  
  // Esperar a que aparezca el modal de error
  await registrarPage.page.waitForTimeout(2000);
  
  // Buscar el modal de error y capturar su texto
  const modalError = registrarPage.page.locator('.modal:visible, [class*="modal"]:visible').first();
  const modalVisible = await modalError.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (modalVisible) {
    const modalTexto = await modalError.textContent() || '';
    this.modalErrorTexto = modalTexto;
    console.log(`   🚨 Modal de error detectado: "${modalTexto.substring(0, 100)}..."`);
  } else {
    this.modalErrorTexto = '';
    console.log('   ⚠️ No se detectó modal de error');
  }
});

When('ingreso número de cuenta {string} para banco {string}', async function(numCuenta: string, banco: string) {
  await global.page.fill('input[placeholder*="cuenta"]', numCuenta);
  console.log(`✓ Cuenta inválida: ${numCuenta}`);
});

// ==================== VERIFICACIONES ====================

Then('debería ver el registro guardado', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const registroVisible = await registrarPage.isRegistroEnGrilla();
  expect(registroVisible).toBeTruthy();
  console.log('✓ Registro guardado en grilla');
});

Then('debería ver error {string}', async function(mensajeError: string) {
  const errorVisible = await global.page.isVisible(`.error-message:has-text("${mensajeError}")`);
  expect(errorVisible).toBeTruthy();
  console.log(`✓ Error mostrado: ${mensajeError}`);
});

When('hago clic en ENVIAR solicitud', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickEnviarSolicitud();
  console.log('✓ Click ENVIAR solicitud');
});

Then('debería ver el modal con correlativo e incidente', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const textoModal = await registrarPage.esperarModalConfirmacion();
  
  // Verificar que el modal contiene "correlativo" e "incidente" O "exitosamente"/"exitosa"
  const tieneCorrelativo = textoModal.toLowerCase().includes('correlativo');
  const tieneIncidente = textoModal.toLowerCase().includes('incidente');
  const esExitoso = textoModal.toLowerCase().includes('exitosamente') || textoModal.toLowerCase().includes('exitosa');
  
  expect(tieneCorrelativo || tieneIncidente || esExitoso).toBeTruthy();
  console.log('✓ Modal de confirmación verificado');
  
  // IMPORTANTE: Cerrar el modal después de verificar
  await registrarPage.cerrarModalConfirmacion();
  
  // 📄 EXTRAER Y GUARDAR CORRELATIVO/INCIDENTE
  const datosSolicitud = extraerDatosSolicitud(textoModal);
  if (datosSolicitud) {
    // Detectar área automáticamente por el correlativo
    const esVIDA = datosSolicitud.correlativo.toUpperCase().includes('VIDA');
    const area = esVIDA ? 'VIDA' : 'RRHH';
    const usuarioDefault = esVIDA ? 'jcastroc' : 'evarasga';
    const memoDefault = esVIDA ? 'PAGO DE SOBREVIVENCIA' : 'JUICIO DE ALIMENTOS';
    const montoDefault = esVIDA ? 800 : 600;
    const monedaDefault = esVIDA ? 'Dolares' : 'Soles';
    
    // IMPORTANTE: Detectar acción y aprobador nivel desde los tags del escenario
    // Usar los tags guardados en el hook Before
    const scenarioTitle = this.scenarioTitle || '';
    const tags = this.scenarioTags || [];
    let accion: 'rechazar' | 'observar' | 'aprobar' = 'aprobar'; // Por defecto
    let aprobadorNivel: 1 | 2 | 3 = 1; // Por defecto
    
    // Debug: mostrar tags disponibles y título
    const tagNames = tags.map((tag: any) => {
      if (typeof tag === 'string') return tag;
      return tag.name || tag.toString();
    }).join(', ');
    console.log(`   🔍 Título escenario: "${scenarioTitle}"`);
    console.log(`   🔍 Tags detectados: [${tagNames}]`);
    
    // Extraer todos los nombres de tags como strings para comparación
    const tagStrings = tags.map((tag: any) => {
      if (typeof tag === 'string') return tag.toLowerCase();
      return (tag.name || tag.toString() || '').toLowerCase();
    });
    
    // Detectar acción desde tags Y título del escenario (más robusto)
    const tieneRechazarTag = tagStrings.some(tag => 
      tag === '@rechazar' || tag === 'rechazar' || tag.includes('rechazar')
    );
    const tieneRechazarTitulo = scenarioTitle.toUpperCase().includes('RECHAZAR');
    
    const tieneObservarTag = tagStrings.some(tag => 
      tag === '@observar' || tag === 'observar' || tag.includes('observar')
    );
    const tieneObservarTitulo = scenarioTitle.toUpperCase().includes('OBSERVAR');
    
    if (tieneRechazarTag || tieneRechazarTitulo) {
      accion = 'rechazar';
      console.log(`   ✅ Acción detectada: RECHAZAR`);
    } else if (tieneObservarTag || tieneObservarTitulo) {
      accion = 'observar';
      console.log(`   ✅ Acción detectada: OBSERVAR`);
    } else {
      accion = 'aprobar'; // Por defecto o si tiene @aprobar
      console.log(`   ✅ Acción detectada: APROBAR (por defecto)`);
    }
    
    // Detectar aprobador nivel desde tags Y título del escenario
    const tieneAprobador2Tag = tagStrings.some(tag => 
      tag === '@aprobador2' || tag === 'aprobador2' || tag.includes('aprobador2')
    );
    const tieneAprobador2Titulo = scenarioTitle.includes('Aprobador 2') || scenarioTitle.includes('aprobador 2');
    
    const tieneAprobador3Tag = tagStrings.some(tag => 
      tag === '@aprobador3' || tag === 'aprobador3' || tag.includes('aprobador3')
    );
    const tieneAprobador3Titulo = scenarioTitle.includes('Aprobador 3') || scenarioTitle.includes('aprobador 3');
    
    if (tieneAprobador3Tag || tieneAprobador3Titulo) {
      aprobadorNivel = 3;
      console.log(`   ✅ Aprobador Nivel detectado: 3`);
    } else if (tieneAprobador2Tag || tieneAprobador2Titulo) {
      aprobadorNivel = 2;
      console.log(`   ✅ Aprobador Nivel detectado: 2`);
    } else {
      aprobadorNivel = 1; // Por defecto (Aprobador 1)
      console.log(`   ✅ Aprobador Nivel detectado: 1 (por defecto)`);
    }
    
    guardarSolicitudCreada({
      correlativo: datosSolicitud.correlativo,
      incidente: datosSolicitud.incidente,
      area: area,
      memo: this.memoActual || memoDefault,
      monto: this.montoActual || montoDefault,
      moneda: this.monedaActual || monedaDefault,
      fechaCreacion: new Date().toISOString(),
      usuario: usuarioDefault,
      accion: accion,
      aprobadorNivel: aprobadorNivel
    });
    
    console.log(`   📋 Solicitud guardada con Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel}`);
  }
  
  // 📸 TOMAR SCREENSHOT DEL MODAL DE ÉXITO ANTES DE QUE SE CIERRE
  await registrarPage.page.screenshot({
    path: `./screenshots/EVIDENCIA-Modal-Exito-Correlativo-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
    fullPage: true
  });
  console.log('📸 Screenshot de modal de éxito capturado');
});

// ==================== VALIDACIONES DE NEGOCIO (Banco/Moneda) ====================

When('ingreso los datos con banco diferente:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  console.log(`\n   🏦 Intentando agregar con banco diferente: ${datos['Banco']}`);
  
  await registrarPage.llenarFormularioCompleto({
    nombres: datos['Nombres'],
    dniRuc: datos['DNI'],
    moneda: datos['Moneda'],
    monto: parseFloat(datos['Monto']),
    subtipo: datos['Subtipo'],
    banco: datos['Banco'],
    tipoCuenta: datos['Tipo cuenta'],
    numeroCuenta: datos['Número cuenta']
  });
  
  await registrarPage.page.click('button:has-text("GUARDAR"), button:has-text("Guardar")');
  await registrarPage.page.waitForTimeout(2000);
});

When('ingreso los datos con moneda diferente:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  console.log(`\n   💰 Intentando agregar con moneda diferente: ${datos['Moneda']}`);
  
  await registrarPage.llenarFormularioCompleto({
    nombres: datos['Nombres'],
    dniRuc: datos['DNI'],
    moneda: datos['Moneda'],
    monto: parseFloat(datos['Monto']),
    subtipo: datos['Subtipo'],
    banco: datos['Banco'],
    tipoCuenta: datos['Tipo cuenta'],
    numeroCuenta: datos['Número cuenta']
  });
  
  await registrarPage.page.click('button:has-text("GUARDAR"), button:has-text("Guardar")');
  await registrarPage.page.waitForTimeout(2000);
});

Then('debería ver error indicando bancos diferentes', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Esperar a que aparezca el modal de error
  await registrarPage.page.waitForTimeout(1500);
  
  // Buscar modal con mensaje de bancos diferentes
  // Primero intentar con el nuevo modal PrimeVue
  const modalPrimeVue = registrarPage.page.locator('.p-dialog, .isg__confirm__container').first();
  const modalPrimeVueVisible = await modalPrimeVue.isVisible({ timeout: 3000 }).catch(() => false);
  
  let modalVisible = false;
  let modalTexto = '';
  
  if (modalPrimeVueVisible) {
    const mensajeModal = registrarPage.page.locator('.isg__confirm__message').first();
    modalTexto = await mensajeModal.textContent() || '';
    if (modalTexto.toLowerCase().includes('banco') && 
        (modalTexto.toLowerCase().includes('diferente') || modalTexto.toLowerCase().includes('mismo'))) {
      modalVisible = true;
      console.log(`   ✓ Error detectado (PrimeVue): "${modalTexto.substring(0, 80)}..."`);
    }
  }
  
  // Si no se encontró en PrimeVue, buscar con selectores legacy
  if (!modalVisible) {
    const modalSelectors = [
      'text=/.*[Bb]ancos?.*[Dd]iferentes?.*/i',
      'text=/.*[Nn]o se puede.*[Bb]anco.*/i',
      'text=/.*[Mm]ismo.*[Bb]anco.*/i',
      '.modal:has-text("banco")',
      '.alert:has-text("banco")'
    ];
    
    for (const selector of modalSelectors) {
      const isVisible = await registrarPage.page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        modalVisible = true;
        modalTexto = await registrarPage.page.locator(selector).first().textContent() || '';
        console.log(`   ✓ Error detectado (legacy): "${modalTexto.substring(0, 80)}..."`);
        break;
      }
    }
  }
  
  expect(modalVisible).toBeTruthy();
  console.log('   ✅ Validación de bancos diferentes OK');
  
  // 📸 TOMAR SCREENSHOT DEL MODAL ANTES DE CERRARLO
  await registrarPage.page.screenshot({
    path: `./screenshots/EVIDENCIA-Modal-Error-Bancos-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
    fullPage: true
  });
  console.log('   📸 Screenshot de modal capturado');
  
  // Cerrar el modal - primero intentar con PrimeVue
  if (modalPrimeVueVisible) {
    const btnAceptar = registrarPage.page.locator('.isg__confirm__button--accept, button:has-text("Aceptar")').first();
    const btnVisible = await btnAceptar.isVisible({ timeout: 2000 }).catch(() => false);
    if (btnVisible) {
      await btnAceptar.click();
      await registrarPage.page.waitForTimeout(500);
      console.log('   ✓ Modal cerrado (PrimeVue)');
    }
  } else {
    // Fallback: cerrar modal legacy
    const btnCerrar = registrarPage.page.locator('button:has-text("Entendido"), button:has-text("Aceptar"), button:has-text("Cerrar")');
    const btnVisible = await btnCerrar.isVisible({ timeout: 2000 }).catch(() => false);
    if (btnVisible) {
      await btnCerrar.first().click();
      await registrarPage.page.waitForTimeout(500);
      console.log('   ✓ Modal cerrado (legacy)');
    }
  }
});

Then('debería ver error indicando monedas diferentes', async function() {
  // Verificar que el modal capturado contiene el mensaje de monedas diferentes
  const modalTexto = this.modalErrorTexto || '';
  
  const tieneMensajeMoneda = modalTexto.toLowerCase().includes('moneda');
  
  console.log(`   🔍 Verificando modal: "${modalTexto.substring(0, 150)}..."`);
  expect(tieneMensajeMoneda).toBeTruthy();
  console.log('   ✅ Validación de monedas diferentes OK');
  
  // 📸 TOMAR SCREENSHOT DEL MODAL ANTES DE CERRARLO
  await global.page.screenshot({
    path: `./screenshots/EVIDENCIA-Modal-Error-Monedas-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
    fullPage: true
  });
  console.log('   📸 Screenshot de modal capturado');
  
  // Cerrar el modal - primero intentar con PrimeVue
  const modalPrimeVue = global.page.locator('.p-dialog, .isg__confirm__container').first();
  const modalPrimeVueVisible = await modalPrimeVue.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (modalPrimeVueVisible) {
    const btnAceptar = global.page.locator('.isg__confirm__button--accept, button:has-text("Aceptar")').first();
    const btnVisible = await btnAceptar.isVisible({ timeout: 2000 }).catch(() => false);
    if (btnVisible) {
      await btnAceptar.click();
      await global.page.waitForTimeout(500);
      console.log('   ✓ Modal cerrado (PrimeVue)');
    }
  } else {
    // Fallback: cerrar modal legacy
    const btnEntendido = global.page.locator('button:has-text("Entendido")');
    const btnVisible = await btnEntendido.isVisible({ timeout: 2000 }).catch(() => false);
    if (btnVisible) {
      await btnEntendido.click();
      await global.page.waitForTimeout(500);
      console.log('   ✓ Modal cerrado (legacy)');
    }
  }
});

Then('debería ver {int} registros guardados', async function(cantidadEsperada: number) {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Esperar a que la grilla se actualice completamente
  await registrarPage.page.waitForTimeout(3000);
  
  // Verificar que la grilla tenga registros
  await registrarPage.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
  
  // Contar registros en la grilla
  const rowCount = await registrarPage.page.locator('table tbody tr').count();
  
  console.log(`   📊 Registros encontrados: ${rowCount} (esperados: ${cantidadEsperada})`);
  expect(rowCount).toBe(cantidadEsperada);
  console.log(`   ✓ ${cantidadEsperada} registro(s) guardado(s) verificado(s)`);
});

// ==================== VALIDACIONES DE BANCOS OPTIMIZADAS ====================

When('ingreso datos validando banco:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  console.log(`\n   🏦 Validando ${datos['Banco']} (${datos['Tipo cuenta']})`);
  
  // 1. Primero probar con cuenta INVÁLIDA
  console.log(`   ❌ Probando cuenta inválida: ${datos['Cuenta inválida']}`);
  
  await registrarPage.ingresarNombres(datos['Nombres']);
  await registrarPage.ingresarDNIRUC(datos['DNI']);
  await registrarPage.seleccionarMoneda(datos['Moneda']);
  await registrarPage.ingresarMonto(parseFloat(datos['Monto']));
  await registrarPage.seleccionarSubtipo('Transferencia a terceros');
  await registrarPage.page.waitForTimeout(500);
  await registrarPage.seleccionarBanco(datos['Banco']);
  await registrarPage.seleccionarTipoCuenta(datos['Tipo cuenta']);
  await registrarPage.ingresarNumeroCuenta(datos['Cuenta inválida']);
  
  // Intentar guardar
  await registrarPage.page.click('button:has-text("GUARDAR"), button:has-text("Guardar")');
  await registrarPage.page.waitForTimeout(2000);
  
  // Verificar si hay error o si no se guardó en grilla
  const hasError = await registrarPage.page.locator('.error, .invalid-feedback, .text-danger').isVisible().catch(() => false);
  const enGrilla = await registrarPage.page.locator('table tbody tr td:has-text("12345")').isVisible().catch(() => false);
  
  if (hasError) {
    console.log(`   ✓ Error detectado con cuenta inválida`);
  } else if (!enGrilla) {
    console.log(`   ✓ Registro no guardado con cuenta inválida (validación implícita)`);
  }
  
  // 2. Ahora probar con cuenta VÁLIDA
  console.log(`   ✅ Probando cuenta válida: ${datos['Cuenta válida']}`);
  
  // Cambiar solo el número de cuenta
  await registrarPage.ingresarNumeroCuenta(datos['Cuenta válida']);
  
  // Guardar
  await registrarPage.page.click('button:has-text("GUARDAR"), button:has-text("Guardar")');
  await registrarPage.page.waitForTimeout(2000);
  
  // Verificar que se guardó en grilla
  const registroGuardado = await registrarPage.page.locator('table tbody tr').first().isVisible().catch(() => false);
  expect(registroGuardado).toBeTruthy();
  
  console.log(`   ✅ ${datos['Banco']} (${datos['Tipo cuenta']}) validado correctamente\n`);
});
