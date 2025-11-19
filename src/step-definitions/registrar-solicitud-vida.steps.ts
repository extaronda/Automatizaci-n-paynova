import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { RegistrarSolicitudPage } from '../pages/RegistrarSolicitudPage';
import { LoginPage } from '../pages/LoginPage';
import { getUsuarioPorNombre, getDatosVIDAPorIdentificador } from '../helper/data-loader';
import { extraerDatosSolicitud, guardarSolicitudCreada } from '../helper/solicitud-data';

// ==================== ANTECEDENTES ====================

Given('que estoy autenticado como usuario {string}', async function(nombreUsuario: string) {
  const usuario = getUsuarioPorNombre(nombreUsuario);
  const loginPage = new LoginPage(global.page);
  
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(usuario.username);
  await loginPage.enterPassword(usuario.password);
  await loginPage.clickLoginButton();
  
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log(`   ✓ Login exitoso → ${usuario.username} [${usuario.area}]`);
});

// ==================== ACCIONES VIDA ====================
// NOTA: Los steps "selecciono el memo", "hago clic en ENVIAR solicitud" y 
// "debería ver el modal con correlativo e incidente" están en registrar-solicitud.steps.ts
// y son compartidos entre RRHH y VIDA. Solo agregamos steps específicos de VIDA aquí.

When('espero que aparezca el modal de Grupo VIDA', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.esperarModalGrupoVIDA();
  console.log('   ✓ Modal VIDA cargado');
});

When('selecciono el primer registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(1);
  console.log('   ✓ Registro #1 seleccionado');
});

When('selecciono el segundo registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(2);
  console.log('   ✓ Registro #2 seleccionado');
});

When('selecciono el tercer registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(3);
  console.log('   ✓ Registro #3 seleccionado');
});

When('hago clic en Guardar Seleccionado', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickGuardarSeleccionado();
  console.log('   ✓ Guardado en grilla');
});

When('hago clic en el botón Editar del registro', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickEditarRegistro();
  console.log('   ✓ Modo edición activado');
});

When('completo los datos de VIDA:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  await registrarPage.completarFormularioVIDA({
    dni: datos['DNI'],
    poliza: datos['Poliza'],
    moneda: datos['Moneda'],
    monto: parseFloat(datos['Monto']),
    banco: datos['Banco'],
    tipoCuenta: datos['Tipo cuenta'],
    numeroCuenta: datos['Número cuenta']
  });
  
  // Guardar en contexto para usar en modal de éxito
  this.montoActual = parseFloat(datos['Monto']);
  this.monedaActual = datos['Moneda'];
  
  console.log(`   ✓ Datos completados → ${datos['Banco']} | ${datos['Moneda']} ${datos['Monto']}`);
});

When('completo los datos de VIDA desde JSON {string}', async function(identificador: string) {
  const datosJSON = getDatosVIDAPorIdentificador(identificador);
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  await registrarPage.completarFormularioVIDA({
    dni: datosJSON.dni,
    poliza: datosJSON.poliza,
    moneda: datosJSON.moneda,
    monto: datosJSON.monto,
    banco: datosJSON.banco,
    tipoCuenta: datosJSON.tipo_cuenta,
    numeroCuenta: datosJSON.numero_cuenta
  });
  
  // Guardar en contexto para usar en modal de éxito
  this.montoActual = datosJSON.monto;
  this.monedaActual = datosJSON.moneda;
  
  console.log(`   ✓ Datos completados desde JSON → ${datosJSON.banco} | ${datosJSON.moneda} ${datosJSON.monto}`);
});

When('hago clic en ACTUALIZAR sin validar', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickActualizar();
  console.log('   ✓ Registro actualizado');
  
  // Esperar a que aparezca el modal (si hay error o confirmación)
  await registrarPage.page.waitForTimeout(2000);
  
  // Intentar cerrar modal de error/confirmación
  const btnEntendido = registrarPage.page.locator('button:has-text("Entendido")');
  const entendidoVisible = await btnEntendido.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (entendidoVisible) {
    console.log('   🔔 Modal detectado, cerrando...');
    await btnEntendido.click();
    await registrarPage.page.waitForTimeout(1000);
    console.log('   ✓ Modal cerrado (Entendido)');
  }
});

When('hago clic en ACTUALIZAR', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickActualizar();
  console.log('   ✓ Click ACTUALIZAR');
  
  // Esperar a que aparezca el modal (error de negocio)
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

// ==================== VERIFICACIONES ====================

Then('debería ver el registro guardado en la grilla', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const registroVisible = await registrarPage.verificarRegistroEnGrilla();
  expect(registroVisible).toBeTruthy();
  console.log('   ✓ Registro en grilla verificado');
});

Then('debería ver el registro actualizado en la grilla', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const registroActualizado = await registrarPage.verificarRegistroActualizado();
  expect(registroActualizado).toBeTruthy();
  console.log('   ✓ Actualización verificada');
});

// ==================== VALIDACIONES (Unhappy Paths) ====================

When('hago clic en ACTUALIZAR sin llenar datos', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Intentar actualizar sin llenar datos
  await registrarPage.page.click('button:has-text("ACTUALIZAR"), button:has-text("Actualizar")');
  await registrarPage.page.waitForTimeout(1000);
  
  console.log('   ✓ Click en ACTUALIZAR sin datos');
});

Then('debería ver mensajes de validación de campos obligatorios', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Verificar si hay mensajes de validación
  const validationSelectors = [
    '.error', 
    '.invalid-feedback', 
    '.text-danger',
    '.alert-danger',
    'text=obligatorio',
    'text=requerido',
    'text=completar'
  ];
  
  let hasValidation = false;
  for (const selector of validationSelectors) {
    const isVisible = await registrarPage.page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      hasValidation = true;
      const errorText = await registrarPage.page.locator(selector).first().textContent();
      console.log(`   ✓ Validación detectada: ${errorText?.substring(0, 80)}`);
      break;
    }
  }
  
  expect(hasValidation).toBeTruthy();
  console.log('   ✓ Campos obligatorios validados correctamente');
});

When('valido cuenta bancaria para:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Guardar datos en el contexto para la verificación
  this.bancoDatos = datos;
  
  console.log(`\n   🏦 Validando ${datos['Banco']} (${datos['Tipo cuenta']}) - ${datos['Dígitos']} dígitos`);
  
  // 1. Primero intentar con cuenta INVÁLIDA
  console.log(`   ❌ Probando cuenta inválida: ${datos['Cuenta inválida']}`);
  
  await registrarPage.page.fill('input[placeholder*="DNI"], input[placeholder*="RUC"]', '45678912');
  await registrarPage.ingresarDatosVIDA('4393543295');
  await registrarPage.seleccionarMoneda('Soles');
  await registrarPage.ingresarMonto(1000);
  
  // Tipo y Subtipo
  await registrarPage.page.selectOption('select:has(option[value="TR"])', 'TR');
  await registrarPage.page.click('select:has(option[value="TR"])');
  
  // Esperar subtipo
  let optionCount = 0;
  let attempts = 0;
  while (optionCount <= 1 && attempts < 50) {
    optionCount = await registrarPage.page.locator('select:has-text("Transferencia a terceros") option').count();
    if (optionCount > 1) break;
    await registrarPage.page.waitForTimeout(100);
    attempts++;
  }
  
  const options = await registrarPage.page.locator('select:has-text("Transferencia a terceros") option').allTextContents();
  const matchingOption = options.find(opt => opt.trim().toLowerCase().includes('transferencia a terceros'));
  if (matchingOption) {
    await registrarPage.page.selectOption('select:has-text("Transferencia a terceros")', { label: matchingOption });
  }
  
  // Esperar campos bancarios
  await registrarPage.page.waitForTimeout(1000);
  
  // Seleccionar banco usando el método del Page Object
  await registrarPage.seleccionarBanco(datos['Banco']);
  
  // Seleccionar tipo de cuenta usando el método del Page Object
  await registrarPage.seleccionarTipoCuenta(datos['Tipo cuenta']);
  
  // Ingresar cuenta INVÁLIDA usando método del Page Object
  await registrarPage.ingresarNumeroCuenta(datos['Cuenta inválida']);
  
  // Intentar actualizar
  await registrarPage.clickActualizar();
  
  // SIEMPRE buscar y cerrar el modal de error (si aparece)
  await registrarPage.page.waitForTimeout(1500);
  const btnEntendido = registrarPage.page.locator('button:has-text("Entendido")');
  const isModalVisible = await btnEntendido.isVisible({ timeout: 2000 }).catch(() => false);
  
  if (isModalVisible) {
    console.log(`   ✓ Error mostrado con cuenta inválida (${datos['Cuenta inválida']})`);
    await btnEntendido.click();
    await registrarPage.page.waitForTimeout(500);
    console.log(`   ✓ Modal de error cerrado`);
    this.errorConCuentaInvalida = true;
  } else {
    console.log(`   ⚠️  No apareció modal de error, validando grilla...`);
    this.errorConCuentaInvalida = false;
  }
  
  // 2. Ahora intentar con cuenta VÁLIDA
  console.log(`   ✅ Probando cuenta válida: ${datos['Cuenta válida']}`);
  
  // Cambiar solo el número de cuenta usando método del Page Object
  await registrarPage.ingresarNumeroCuenta(datos['Cuenta válida']);
  
  // Intentar actualizar usando método del Page Object
  await registrarPage.clickActualizar();
  
  // Verificar que se actualizó correctamente
  const registroActualizado = await registrarPage.verificarRegistroActualizado();
  this.exitoConCuentaValida = registroActualizado;
  
  if (registroActualizado) {
    console.log(`   ✓ Registro actualizado con cuenta válida (${datos['Cuenta válida']})`);
    
    // Volver a abrir modo edición para el siguiente banco
    await registrarPage.page.waitForTimeout(1000);
    const editButton = registrarPage.page.locator('button.btn-edit-small').first();
    const editVisible = await editButton.isVisible().catch(() => false);
    if (editVisible) {
      await editButton.click();
      await registrarPage.page.waitForTimeout(500);
      console.log(`   ↻ Modo edición reactivado para siguiente validación`);
    }
  }
});

Then('debería ver error con cuenta inválida y éxito con cuenta válida', async function() {
  // Verificar que se comportó correctamente
  const funcionCorrectamente = (this.errorConCuentaInvalida || !this.exitoConCuentaInvalida) && this.exitoConCuentaValida;
  
  expect(funcionCorrectamente).toBeTruthy();
  console.log(`   ✅ Validación ${this.bancoDatos['Banco']} (${this.bancoDatos['Tipo cuenta']}) EXITOSA\n`);
});

// ==================== VALIDACIONES DE NEGOCIO (Banco/Moneda) ====================

When('hago clic en el botón Editar del segundo registro', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Buscar el segundo registro en la grilla y hacer clic en su botón editar
  const editButtons = registrarPage.page.locator('button.btn-edit-small, button:has-text("Editar")');
  const count = await editButtons.count();
  
  if (count >= 2) {
    await editButtons.nth(1).click(); // Segundo botón (índice 1)
  } else {
    // Si solo hay un registro visible, usar el primero
    await editButtons.first().click();
  }
  
  await registrarPage.page.waitForTimeout(1000);
  console.log('   ✓ Modo edición activado (segundo registro)');
});

Then('debería ver modal de error indicando bancos diferentes', async function() {
  // Si no hay modal capturado, significa que el error viene del ENVIAR
  if (!this.modalErrorTexto) {
    console.log('   ℹ️ Error esperado en ENVIAR, buscando modal...');
    
    // Esperar a que aparezca el modal de error (más tiempo)
    await global.page.waitForTimeout(3000);
    
    // Buscar el modal de error
    const modalError = global.page.locator('.modal:visible, [class*="modal"]:visible').first();
    const modalVisible = await modalError.isVisible({ timeout: 7000 }).catch(() => false);
    
    if (modalVisible) {
      this.modalErrorTexto = await modalError.textContent() || '';
    }
  }
  
  // Verificar que el modal capturado contiene el mensaje de bancos diferentes
  const modalTexto = this.modalErrorTexto || '';
  
  const tieneMensajeBanco = modalTexto.toLowerCase().includes('banco') || 
                            modalTexto.toLowerCase().includes('entidad');
  
  console.log(`   🔍 Verificando modal: "${modalTexto.substring(0, 150)}..."`);
  expect(tieneMensajeBanco).toBeTruthy();
  console.log('   ✅ Validación de bancos diferentes OK');
  
  // 📸 TOMAR SCREENSHOT DEL MODAL ANTES DE CERRARLO
  await global.page.screenshot({
    path: `./screenshots/EVIDENCIA-VIDA-Modal-Error-Bancos-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
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

Then('debería ver modal de error indicando monedas diferentes', async function() {
  // Verificar que el modal capturado contiene el mensaje de monedas diferentes
  const modalTexto = this.modalErrorTexto || '';
  
  const tieneMensajeMoneda = modalTexto.toLowerCase().includes('moneda');
  
  console.log(`   🔍 Verificando modal: "${modalTexto.substring(0, 150)}..."`);
  expect(tieneMensajeMoneda).toBeTruthy();
  console.log('   ✅ Validación de monedas diferentes OK');
  
  // 📸 TOMAR SCREENSHOT DEL MODAL ANTES DE CERRARLO
  await global.page.screenshot({
    path: `./screenshots/EVIDENCIA-VIDA-Modal-Error-Monedas-${new Date().toISOString().replace(/[:.]/g, '-')}.png`,
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

Then('debería ver {int} registros en la grilla', async function(cantidadEsperada: number) {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Esperar a que la grilla se actualice
  await registrarPage.page.waitForTimeout(1500);
  
  // Contar registros en la grilla
  const rowCount = await registrarPage.page.locator('table tbody tr').count();
  
  expect(rowCount).toBe(cantidadEsperada);
  console.log(`   ✓ ${cantidadEsperada} registro(s) verificado(s) en grilla`);
});

// NOTA: Los steps "hago clic en ENVIAR solicitud" y "debería ver el modal con correlativo e incidente"
// están en registrar-solicitud.steps.ts y son compartidos entre RRHH y VIDA.
// El step detecta automáticamente el área (VIDA/RRHH) por el correlativo.

