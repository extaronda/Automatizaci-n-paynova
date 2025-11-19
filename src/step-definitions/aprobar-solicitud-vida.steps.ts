/**
 * Step Definitions para Aprobar Solicitud VIDA
 * Maneja diálogos nativos del navegador correctamente
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AprobarSolicitudPage } from '../pages/AprobarSolicitudPage';
import { LoginPage } from '../pages/LoginPage';
import { getAprobadorVIDA } from '../helper/data-loader';
import { obtenerUltimaSolicitud, obtenerSolicitudPorCorrelativo, obtenerSolicitudPorMemo, obtenerSolicitudPorMemoYAccion, obtenerSolicitudPorMemoYMonto } from '../helper/solicitud-data';

// ==================== ANTECEDENTES ====================

Given('que estoy autenticado como {string} de VIDA', async function(aprobadorNombre: string) {
  const aprobador = getAprobadorVIDA(parseInt(aprobadorNombre.replace('aprobador', '')));
  const loginPage = new LoginPage(global.page);
  
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador.username);
  await loginPage.enterPassword(aprobador.password);
  await loginPage.clickLoginButton();
  
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log(`   ✓ Login exitoso → ${aprobador.username} [${aprobador.rol}]`);
});

Given('tengo solicitudes pendientes en mi bandeja', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.navegarABandeja();
  console.log('   ✓ En bandeja de solicitudes');
});

// ==================== NAVEGACIÓN ====================

When('accedo a Solicitudes de Pago y luego a Bandeja', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.navegarABandeja();
  console.log('   ✓ Navegado a Bandeja');
});

When('selecciono la última solicitud creada de {string}', async function(memo: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // IMPORTANTE: Buscar por memo específico, no solo la última de VIDA
  // Esto asegura que cada escenario busque su propia solicitud
  const solicitud = obtenerSolicitudPorMemo(memo, 'VIDA');
  
  if (solicitud && solicitud.correlativo && solicitud.incidente) {
    // Buscar por correlativo o incidente en la bandeja (método principal y más confiable)
    console.log(`   🔍 Buscando solicitud por Correlativo: ${solicitud.correlativo} o Incidente: ${solicitud.incidente} (Memo: ${solicitud.memo})`);
    await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
    console.log(`   ✓ Solicitud seleccionada por Correlativo/Incidente: ${solicitud.correlativo} / ${solicitud.incidente}`);
    this.solicitudActual = solicitud; // Guardar en contexto
  } else {
    // Error: No se encontró solicitud guardada con correlativo/incidente para ese memo
    throw new Error(
      `❌ No se encontró solicitud guardada con correlativo/incidente para el memo "${memo}". ` +
      `Asegúrate de ejecutar primero el test de registro que crea la solicitud con ese memo. ` +
      `El archivo solicitudes-creadas.json debe contener una solicitud con memo: ${memo}`
    );
  }
});

When('selecciono la solicitud con memo {string}', async function(memo: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.seleccionarUltimaSolicitudPorMemo(memo);
  console.log(`   ✓ Solicitud seleccionada: ${memo}`);
});

When('hago clic en Ver Solicitud', async function() {
  // Ya se hace automáticamente en seleccionarUltimaSolicitudPorMemo
  console.log('   ✓ Detalle de solicitud abierto');
});

// ==================== VERIFICACIONES ====================

Then('debería ver el detalle de la solicitud', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const detalleVisible = await aprobarPage.verificarDetalleVisible();
  expect(detalleVisible).toBeTruthy();
  console.log('   ✓ Detalle de solicitud visible');
});

Then('debería ver el detalle de la solicitud con número de incidente', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  // Solo verificar que el detalle está visible - la validación de correlativo/incidente ya se hizo al seleccionar en la bandeja
  const detalleVisible = await aprobarPage.verificarDetalleVisible();
  expect(detalleVisible).toBeTruthy();
  console.log('   ✓ Detalle de solicitud visible - listo para aprobar');
});

Then('debería verificar que los datos del documento hayan migrado correctamente', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const datosMigrados = await aprobarPage.verificarDatosMigrados();
  expect(datosMigrados).toBeTruthy();
  console.log('   ✓ Datos migrados correctamente verificados');
});

// ==================== ACCIONES DE APROBACIÓN ====================

When('hago clic en el botón {string}', async function(botonNombre: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  if (botonNombre === 'Rechazar') {
    // El comentario se ingresará en el siguiente step
    this.accionActual = 'rechazar';
  } else if (botonNombre === 'Observar') {
    this.accionActual = 'observar';
  } else if (botonNombre === 'APROBAR' || botonNombre === 'Enviar') {
    // Hacer clic en APROBAR - esto ya maneja el diálogo de confirmación y lo acepta
    await aprobarPage.clickAprobar();
    console.log('   ✓ Click en APROBAR y diálogo aceptado');
  }
});

// NOTA: El step "hago clic en {string}" está en login.steps.ts y es genérico.
// Para aprobaciones, usar el step específico "hago clic en el botón {string}"

When('ingreso el comentario {string}', async function(comentario: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  if (this.accionActual === 'rechazar') {
    await aprobarPage.clickRechazar(comentario);
    console.log(`   ✓ Comentario de rechazo ingresado: "${comentario}"`);
  } else if (this.accionActual === 'observar') {
    await aprobarPage.clickObservar(comentario);
    console.log(`   ✓ Comentario de observación ingresado: "${comentario}"`);
  }
});

When('hago clic en {string} documento', async function(accion: string) {
  // Ya se maneja automáticamente en clickRechazar/clickObservar
  console.log(`   ✓ Click en "Aceptar ${accion}"`);
});

When('confirmo el cambio de estado', async function() {
  // Ya se maneja automáticamente en clickRechazar/clickObservar
  console.log('   ✓ Cambio de estado confirmado');
});

When('confirmo el envío', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.confirmarEnvio();
  console.log('   ✓ Envío confirmado');
});

// ==================== VERIFICACIONES DE RESULTADO ====================

Then('debería ver el estado {string}', async function(estadoEsperado: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const estadoCorrecto = await aprobarPage.verificarEstado(estadoEsperado);
  expect(estadoCorrecto).toBeTruthy();
  console.log(`   ✓ Estado verificado: ${estadoEsperado}`);
});

Then('la solicitud debe terminar correctamente', async function() {
  // Verificar que estamos de vuelta en la bandeja o que el estado cambió
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const enBandeja = await aprobarPage.verificarRegresoABandeja();
  expect(enBandeja).toBeTruthy();
  console.log('   ✓ Solicitud procesada correctamente');
});

Then('la solicitud debe regresar a la bandeja del usuario Recaudador', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const enBandeja = await aprobarPage.verificarRegresoABandeja();
  expect(enBandeja).toBeTruthy();
  console.log('   ✓ Solicitud regresó a bandeja del Recaudador');
});

Then('debería ver la Bandeja de Entrada', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  const enBandeja = await aprobarPage.verificarRegresoABandeja();
  expect(enBandeja).toBeTruthy();
  console.log('   ✓ Bandeja de Entrada visible');
});

Then('la solicitud debe pasar a EXACTUS', async function() {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  // Esperar un momento para que se actualice el estado
  await global.page.waitForTimeout(2000);
  const pasoAExactus = await aprobarPage.verificarPasoAExactus();
  expect(pasoAExactus).toBeTruthy();
  console.log('   ✓ Solicitud pasó a EXACTUS');
});

// ==================== ESCENARIOS ESCALONADOS ====================

Given('que la solicitud {string} con monto {int} {string} fue aprobada por Aprobador 1', async function(memo: string, monto: number, moneda: string) {
  // Este step asume que ya existe una solicitud aprobada por Aprobador 1
  // Guardamos el memo y monto en el contexto para usarlo en la selección
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = moneda;
  console.log(`   ℹ️  Asumiendo solicitud ${memo} (${monto} ${moneda}) aprobada por Aprobador 1`);
});

Given('que la solicitud {string} con monto {int} {string} fue aprobada por Aprobador 1 y 2', async function(memo: string, monto: number, moneda: string) {
  // Este step asume que ya existe una solicitud aprobada por Aprobador 1 y 2
  // Guardamos el memo y monto en el contexto para usarlo en la selección
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = moneda;
  console.log(`   ℹ️  Asumiendo solicitud ${memo} (${monto} ${moneda}) aprobada por Aprobador 1 y 2`);
});

Given('estoy autenticado como {string} de VIDA', async function(aprobadorNombre: string) {
  const aprobador = getAprobadorVIDA(parseInt(aprobadorNombre.replace('aprobador', '')));
  const loginPage = new LoginPage(global.page);
  
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador.username);
  await loginPage.enterPassword(aprobador.password);
  await loginPage.clickLoginButton();
  
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log(`   ✓ Login exitoso → ${aprobador.username} [${aprobador.rol}]`);
});

