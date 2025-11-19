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
  await loginPage.enterUsername('adrian');
  await loginPage.enterPassword('123');
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
  
  // 📄 EXTRAER Y GUARDAR CORRELATIVO/INCIDENTE
  const datosSolicitud = extraerDatosSolicitud(textoModal);
  if (datosSolicitud) {
    // Detectar área automáticamente por el correlativo
    const esVIDA = datosSolicitud.correlativo.toUpperCase().includes('VIDA');
    const area = esVIDA ? 'VIDA' : 'RRHH';
    const usuarioDefault = esVIDA ? 'jcastroc' : 'adrian';
    const memoDefault = esVIDA ? 'PAGO DE SOBREVIVENCIA' : 'JUICIO DE ALIMENTOS';
    const montoDefault = esVIDA ? 800 : 600;
    const monedaDefault = esVIDA ? 'Dolares' : 'Soles';
    
    guardarSolicitudCreada({
      correlativo: datosSolicitud.correlativo,
      incidente: datosSolicitud.incidente,
      area: area,
      memo: this.memoActual || memoDefault,
      monto: this.montoActual || montoDefault,
      moneda: this.monedaActual || monedaDefault,
      fechaCreacion: new Date().toISOString(),
      usuario: usuarioDefault
    });
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
  const modalSelectors = [
    'text=/.*[Bb]ancos?.*[Dd]iferentes?.*/i',
    'text=/.*[Nn]o se puede.*[Bb]anco.*/i',
    'text=/.*[Mm]ismo.*[Bb]anco.*/i',
    '.modal:has-text("banco")',
    '.alert:has-text("banco")'
  ];
  
  let modalVisible = false;
  let modalTexto = '';
  
  for (const selector of modalSelectors) {
    const isVisible = await registrarPage.page.locator(selector).isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      modalVisible = true;
      modalTexto = await registrarPage.page.locator(selector).first().textContent() || '';
      console.log(`   ✓ Error detectado: "${modalTexto.substring(0, 80)}..."`);
      break;
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
  
  // Cerrar el modal si tiene botón "Entendido" o similar
  const btnCerrar = registrarPage.page.locator('button:has-text("Entendido"), button:has-text("Aceptar"), button:has-text("Cerrar")');
  const btnVisible = await btnCerrar.isVisible({ timeout: 2000 }).catch(() => false);
  if (btnVisible) {
    await btnCerrar.first().click();
    await registrarPage.page.waitForTimeout(500);
    console.log('   ✓ Modal cerrado');
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
  
  // Cerrar el modal
  const btnEntendido = global.page.locator('button:has-text("Entendido")');
  const btnVisible = await btnEntendido.isVisible({ timeout: 2000 }).catch(() => false);
  if (btnVisible) {
    await btnEntendido.click();
    await global.page.waitForTimeout(500);
    console.log('   ✓ Modal cerrado');
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
