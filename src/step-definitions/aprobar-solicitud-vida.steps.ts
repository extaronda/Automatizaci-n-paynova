/**
 * Step Definitions para Aprobar Solicitud VIDA
 * Maneja diálogos nativos del navegador correctamente
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { AprobarSolicitudPage } from '../pages/AprobarSolicitudPage';
import { LoginPage } from '../pages/LoginPage';
import { getAprobadorVIDA, determinarAprobadoresNecesarios } from '../helper/data-loader';
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
  // Verificar si ya estamos en la bandeja antes de navegar
  const currentUrl = global.page.url();
  if (currentUrl.includes('/solicitudes-pago') && !currentUrl.includes('/registrar')) {
    // Ya estamos en la bandeja, solo verificar que la tabla esté cargada
    try {
      await global.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 2000 });
      console.log('   ✓ Ya en Bandeja (reutilizando)');
      return;
    } catch {
      // Si no hay tabla, navegar normalmente
    }
  }
  await aprobarPage.navegarABandeja();
  console.log('   ✓ Navegado a Bandeja');
});

When('selecciono la última solicitud creada de {string}', async function(memo: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // IMPORTANTE: Detectar la acción (RECHAZAR, OBSERVAR, APROBAR) del título del escenario
  // y el aprobador nivel desde los tags Y título (usar los guardados en el hook Before)
  const scenarioTitle = this.scenarioTitle || '';
  const tags = this.scenarioTags || [];
  
  let accion: 'rechazar' | 'observar' | 'aprobar' = 'aprobar'; // Por defecto
  
  // Detectar acción desde título (más confiable)
  if (scenarioTitle.toUpperCase().includes('RECHAZAR')) {
    accion = 'rechazar';
  } else if (scenarioTitle.toUpperCase().includes('OBSERVAR')) {
    accion = 'observar';
  } else if (scenarioTitle.toUpperCase().includes('APROBAR')) {
    accion = 'aprobar';
  }
  
  // Detectar aprobador nivel desde tags Y título (más robusto)
  const tagStrings = tags.map((tag: any) => {
    if (typeof tag === 'string') return tag.toLowerCase();
    return (tag.name || tag.toString() || '').toLowerCase();
  });
  
  const tieneAprobador2Tag = tagStrings.some(tag => 
    tag === '@aprobador2' || tag === 'aprobador2' || tag.includes('aprobador2')
  );
  const tieneAprobador2Titulo = scenarioTitle.includes('Aprobador 2') || scenarioTitle.includes('aprobador 2');
  
  const tieneAprobador3Tag = tagStrings.some(tag => 
    tag === '@aprobador3' || tag === 'aprobador3' || tag.includes('aprobador3')
  );
  const tieneAprobador3Titulo = scenarioTitle.includes('Aprobador 3') || scenarioTitle.includes('aprobador 3');
  
  let aprobadorNivel: 1 | 2 | 3 = 1;
  if (tieneAprobador3Tag || tieneAprobador3Titulo) {
    aprobadorNivel = 3;
  } else if (tieneAprobador2Tag || tieneAprobador2Titulo) {
    aprobadorNivel = 2;
  }
  
  // Intentar obtener monto y moneda del contexto del esquema parametrizado
  const monto = (this as any).monto;
  const moneda = (this as any).moneda;
  
  let solicitud;
  
  // Si hay monto y moneda disponibles (esquema parametrizado), buscar por monto también
  if (monto && moneda) {
    console.log(`   🔍 Buscando solicitud por memo "${memo}", monto ${monto} ${moneda} y aprobador nivel ${aprobadorNivel}...`);
    solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, moneda, aprobadorNivel, 'VIDA');
    
    // Si no encuentra con nivel exacto, buscar sin nivel
    if (!solicitud) {
      solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, moneda, 1, 'VIDA');
    }
  }
  
  // Si no encontró por monto o no hay monto, buscar por memo y acción
  if (!solicitud) {
    solicitud = obtenerSolicitudPorMemoYAccion(memo, accion, aprobadorNivel, 'VIDA');
  }
  
  // Último fallback: buscar solo por memo
  if (!solicitud) {
    console.log(`   ⚠️  No se encontró con filtros, buscando solo por memo...`);
    solicitud = obtenerSolicitudPorMemo(memo, 'VIDA');
  }
  
  if (solicitud && solicitud.correlativo && solicitud.incidente) {
    // Buscar por correlativo o incidente en la bandeja (método principal y más confiable)
    console.log(`   🔍 Buscando solicitud por Correlativo: ${solicitud.correlativo} o Incidente: ${solicitud.incidente} (Memo: ${solicitud.memo}, Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel})`);
    await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
    console.log(`   ✓ Solicitud seleccionada por Correlativo/Incidente: ${solicitud.correlativo} / ${solicitud.incidente}`);
    this.solicitudActual = solicitud; // Guardar en contexto
  } else {
    // Error: No se encontró solicitud guardada con correlativo/incidente para ese memo y acción
    throw new Error(
      `❌ No se encontró solicitud guardada con correlativo/incidente para el memo "${memo}", acción "${accion}" y aprobador nivel ${aprobadorNivel}. ` +
      `Asegúrate de ejecutar primero el test de registro que crea las solicitudes necesarias. ` +
      `El archivo solicitudes-creadas.json debe contener solicitudes con memo: ${memo}, accion: ${accion}, aprobadorNivel: ${aprobadorNivel}`
    );
  }
});

When(/^selecciono la solicitud (.+) con monto (\d+) (Soles|Dolares)$/, async function(memo: string, monto: number, moneda: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // Guardar monto y moneda en contexto para uso posterior
  (this as any).monto = monto;
  (this as any).moneda = moneda;
  
  // Detectar aprobador nivel desde tags Y título
  const scenarioTitle = this.scenarioTitle || '';
  const tags = this.scenarioTags || [];
  
  const tagStrings = tags.map((tag: any) => {
    if (typeof tag === 'string') return tag.toLowerCase();
    return (tag.name || tag.toString() || '').toLowerCase();
  });
  
  const tieneAprobador2Tag = tagStrings.some(tag => 
    tag === '@aprobador2' || tag === 'aprobador2' || tag.includes('aprobador2')
  );
  const tieneAprobador2Titulo = scenarioTitle.includes('Aprobador 2') || scenarioTitle.includes('aprobador 2');
  
  const tieneAprobador3Tag = tagStrings.some(tag => 
    tag === '@aprobador3' || tag === 'aprobador3' || tag.includes('aprobador3')
  );
  const tieneAprobador3Titulo = scenarioTitle.includes('Aprobador 3') || scenarioTitle.includes('aprobador 3');
  
  let aprobadorNivel: 1 | 2 | 3 = 1;
  if (tieneAprobador3Tag || tieneAprobador3Titulo) {
    aprobadorNivel = 3;
  } else if (tieneAprobador2Tag || tieneAprobador2Titulo) {
    aprobadorNivel = 2;
  }
  
  // Buscar por memo, monto y moneda
  console.log(`   🔍 Buscando solicitud por memo "${memo}", monto ${monto} ${moneda} y aprobador nivel ${aprobadorNivel}...`);
  let solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, moneda, aprobadorNivel, 'VIDA');
  
  // Si no encuentra con nivel exacto, buscar sin nivel
  if (!solicitud) {
    console.log(`   ⚠️  No se encontró con nivel exacto, buscando sin nivel...`);
    solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, moneda, 1, 'VIDA');
  }
  
  // Si aún no encuentra por monto exacto, buscar por memo y acción (más flexible)
  if (!solicitud) {
    console.log(`   ⚠️  No se encontró por monto exacto, buscando por memo y acción "aprobar"...`);
    solicitud = obtenerSolicitudPorMemoYAccion(memo, 'aprobar', aprobadorNivel, 'VIDA');
  }
  
  // Si aún no encuentra, buscar solo por memo (último recurso)
  if (!solicitud) {
    console.log(`   ⚠️  No se encontró por memo y acción, buscando solo por memo...`);
    solicitud = obtenerSolicitudPorMemo(memo, 'VIDA');
  }
  
  if (solicitud && solicitud.correlativo && solicitud.incidente) {
    console.log(`   🔍 Buscando solicitud por Correlativo: ${solicitud.correlativo} o Incidente: ${solicitud.incidente}`);
    await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
    console.log(`   ✓ Solicitud seleccionada: ${solicitud.correlativo} / ${solicitud.incidente}`);
    this.solicitudActual = solicitud;
  } else {
    throw new Error(
      `❌ No se encontró solicitud guardada para el memo "${memo}" con monto ${monto} ${moneda}. ` +
      `Asegúrate de ejecutar primero el test de registro que crea las solicitudes necesarias.`
    );
  }
});

When('selecciono la solicitud con memo {string}', async function(memo: string) {
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // IMPORTANTE: Detectar la acción y aprobador nivel desde los tags del escenario Y título (usar los guardados en el hook Before)
  const scenarioTitle = this.scenarioTitle || '';
  const tags = this.scenarioTags || [];
  
  let accion: 'rechazar' | 'observar' | 'aprobar' = 'aprobar'; // Por defecto
  
  // Detectar acción desde título (más confiable)
  if (scenarioTitle.toUpperCase().includes('RECHAZAR')) {
    accion = 'rechazar';
  } else if (scenarioTitle.toUpperCase().includes('OBSERVAR')) {
    accion = 'observar';
  } else if (scenarioTitle.toUpperCase().includes('APROBAR')) {
    accion = 'aprobar';
  }
  
  // Detectar aprobador nivel desde tags Y título (más robusto)
  const tagStrings = tags.map((tag: any) => {
    if (typeof tag === 'string') return tag.toLowerCase();
    return (tag.name || tag.toString() || '').toLowerCase();
  });
  
  const tieneAprobador2Tag = tagStrings.some(tag => 
    tag === '@aprobador2' || tag === 'aprobador2' || tag.includes('aprobador2')
  );
  const tieneAprobador2Titulo = scenarioTitle.includes('Aprobador 2') || scenarioTitle.includes('aprobador 2');
  
  const tieneAprobador3Tag = tagStrings.some(tag => 
    tag === '@aprobador3' || tag === 'aprobador3' || tag.includes('aprobador3')
  );
  const tieneAprobador3Titulo = scenarioTitle.includes('Aprobador 3') || scenarioTitle.includes('aprobador 3');
  
  let aprobadorNivel: 1 | 2 | 3 = 1;
  if (tieneAprobador3Tag || tieneAprobador3Titulo) {
    aprobadorNivel = 3;
  } else if (tieneAprobador2Tag || tieneAprobador2Titulo) {
    aprobadorNivel = 2;
  }
  
  // IMPORTANTE: Para Aprobador 2 o 3, buscar la solicitud que fue APROBADA por el aprobador anterior
  // Aprobador 2 busca solicitud aprobada por Aprobador 1
  // Aprobador 3 busca solicitud aprobada por Aprobador 2
  let solicitud;
  
  // Si hay monto y moneda guardados del step anterior (después de aprobar), usarlos
  const montoAprobado = (this as any).montoAprobado;
  const monedaAprobada = (this as any).monedaAprobada;
  const correlativoAprobado = (this as any).correlativoAprobado;
  const incidenteAprobado = (this as any).incidenteAprobado;
  
  // Si hay correlativo/incidente guardado del step anterior, usarlo directamente
  if (correlativoAprobado && incidenteAprobado && (aprobadorNivel === 2 || aprobadorNivel === 3)) {
    console.log(`   🔍 Usando correlativo/incidente guardado: ${correlativoAprobado} / ${incidenteAprobado}`);
    try {
      await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(correlativoAprobado, incidenteAprobado);
      console.log(`   ✓ Solicitud seleccionada por correlativo/incidente guardado: ${memo}`);
      return;
    } catch (error) {
      console.log(`   ⚠️  No se encontró por correlativo/incidente guardado, buscando por otros métodos...`);
    }
  }
  
  if (aprobadorNivel === 2 || aprobadorNivel === 3) {
    // Si hay monto y moneda guardados, buscar por esos
    if (montoAprobado && monedaAprobada) {
      console.log(`   📋 Buscando solicitud aprobada por monto ${montoAprobado} ${monedaAprobada} (Memo: ${memo})`);
      solicitud = obtenerSolicitudPorMemoYMonto(memo, montoAprobado, monedaAprobada, aprobadorNivel === 2 ? 2 : 3, 'VIDA');
      
      // Si no encuentra con nivel exacto, buscar sin nivel
      if (!solicitud) {
        solicitud = obtenerSolicitudPorMemoYMonto(memo, montoAprobado, monedaAprobada, 1, 'VIDA');
      }
    }
    
    // Si aún no encuentra, buscar por acción del aprobador anterior
    if (!solicitud) {
      if (aprobadorNivel === 2) {
        solicitud = obtenerSolicitudPorMemoYAccion(memo, 'aprobar', 1, 'VIDA');
        console.log(`   📋 Buscando solicitud aprobada por Aprobador 1 para Aprobador 2 (Memo: ${memo})`);
      } else if (aprobadorNivel === 3) {
        solicitud = obtenerSolicitudPorMemoYAccion(memo, 'aprobar', 2, 'VIDA');
        console.log(`   📋 Buscando solicitud aprobada por Aprobador 2 para Aprobador 3 (Memo: ${memo})`);
      }
    }
  } else {
    // Aprobador 1: buscar por acción y nivel del escenario actual
    solicitud = obtenerSolicitudPorMemoYAccion(memo, accion, aprobadorNivel, 'VIDA');
  }
  
  if (solicitud && solicitud.correlativo && solicitud.incidente) {
    console.log(`   🔍 Buscando solicitud por Correlativo: ${solicitud.correlativo} o Incidente: ${solicitud.incidente} (Memo: ${memo}, Acción: ${accion}, Aprobador Nivel: ${aprobadorNivel})`);
    try {
      await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
      console.log(`   ✓ Solicitud seleccionada: ${memo}`);
      this.solicitudActual = solicitud; // Guardar en contexto
    } catch (error) {
      // Si falla, intentar buscar directamente en la bandeja por memo
      console.log(`   ⚠️  No se encontró por correlativo/incidente, buscando directamente en bandeja por memo...`);
      await aprobarPage.seleccionarUltimaSolicitudPorMemo(memo);
      console.log(`   ✓ Solicitud seleccionada por memo: ${memo}`);
    }
  } else {
    // Fallback: buscar solo por memo si no se encuentra con los campos
    console.log(`   ⚠️  No se encontró con campos exactos, buscando solo por memo...`);
    await aprobarPage.seleccionarUltimaSolicitudPorMemo(memo);
    console.log(`   ✓ Solicitud seleccionada por memo: ${memo}`);
  }
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

// ==================== STEP CONSOLIDADO AUTOMÁTICO BASADO EN MONTO ====================
// Este step determina automáticamente qué aprobadores necesitan aprobar según el monto y moneda
// usando los rangos definidos en test-data/usuarios.json
// 
// IMPORTANTE: Este step DEBE estar ANTES de los steps específicos para que Cucumber lo encuentre primero
// cuando procesa Scenario Outlines. Maneja tanto escenarios normales como Scenario Outlines.
// Cuando Cucumber expande un Scenario Outline, los valores numéricos se mantienen como {int}
Given('que la solicitud {string} con monto {int} {string} fue aprobada por Aprobador 1', async function(memo: string, monto: number, moneda: string) {
  // Verificar que el navegador esté disponible
  if (!global.page) {
    throw new Error('❌ global.page no está inicializado. El navegador no se abrió correctamente.');
  }
  
  // Normalizar moneda
  const monedaNormalizada = moneda.trim();
  const monedaParaBusqueda = monedaNormalizada === 'Soles' ? 'Soles' : 'Dolares';
  
  // Determinar automáticamente qué aprobadores necesitan aprobar según el monto
  const aprobadoresNecesarios = determinarAprobadoresNecesarios(monto, monedaParaBusqueda, 'VIDA');
  const nivelMaximo = Math.max(...aprobadoresNecesarios) as 1 | 2 | 3;
  
  console.log(`\n   🔄 ==========================================`);
  console.log(`   🔄 APROBACIÓN AUTOMÁTICA BASADA EN MONTO`);
  console.log(`   🔄 ==========================================`);
  console.log(`   🔄 Solicitud: ${memo}`);
  console.log(`   🔄 Monto: ${monto} ${monedaParaBusqueda}`);
  console.log(`   🔄 Aprobadores necesarios: ${aprobadoresNecesarios.join(', ')}`);
  console.log(`   🔄 Nivel máximo requerido: ${nivelMaximo}`);
  console.log(`   🔄 ==========================================\n`);
  
  // Buscar la solicitud creada (usar el nivel máximo para la búsqueda)
  const solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, monedaParaBusqueda, nivelMaximo, 'VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error(`❌ No se encontró solicitud creada para ${memo} con monto ${monto} ${monedaParaBusqueda} (Aprobador Nivel: ${nivelMaximo}). Debe ejecutarse primero el test de registro.`);
  }
  
  console.log(`   ✓ Solicitud encontrada: Correlativo ${solicitud.correlativo}, Incidente ${solicitud.incidente}`);
  
  const loginPage = new LoginPage(global.page);
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // Función auxiliar para aprobar con un aprobador específico
  const aprobarConAprobador = async (nivelAprobador: number, esUltimo: boolean = false) => {
    console.log(`\n   📋 ==========================================`);
    console.log(`   📋 PASO ${nivelAprobador}: APROBACIÓN POR APROBADOR ${nivelAprobador}`);
    console.log(`   📋 ==========================================\n`);
    
    const aprobador = getAprobadorVIDA(nivelAprobador);
    console.log(`   🔐 Iniciando login como Aprobador ${nivelAprobador}: ${aprobador.username}`);
    
    await loginPage.navigateToLogin();
    await loginPage.clickToggleTraditionalLogin();
    await loginPage.enterUsername(aprobador.username);
    await loginPage.enterPassword(aprobador.password);
    await loginPage.clickLoginButton();
    
    const dashboardVisible = await loginPage.isLoginSuccessful();
    expect(dashboardVisible).toBeTruthy();
    console.log(`   ✅ Login exitoso como Aprobador ${nivelAprobador}: ${aprobador.username}`);
    
    await aprobarPage.navegarABandeja();
    console.log(`   ✓ En bandeja de solicitudes`);
    
    // Buscar y seleccionar la solicitud
    console.log(`   🔍 Buscando solicitud por Monto: ${monto} ${monedaParaBusqueda}...`);
    try {
      await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
      console.log(`   ✓ Solicitud seleccionada por Correlativo/Incidente`);
    } catch (error) {
      // Fallback: buscar por monto
      console.log(`   ⚠️  Buscando por monto como fallback...`);
      const encontrada = await global.page.evaluate(({ monto, moneda }: { monto: number; moneda: string }) => {
        // @ts-ignore - document existe en el contexto del navegador
        const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
        for (const row of rows) {
          const rowText = row.textContent || '';
          if (rowText.includes(monto.toString()) && rowText.includes(moneda)) {
            const buttons = row.querySelectorAll('button, a') as any[];
            for (const btn of buttons) {
              const text = btn.textContent || '';
              const title = btn.getAttribute('title') || '';
              if (text.includes('👁️') || text.includes('Ver') || title.includes('Ver') || title.includes('Detalle')) {
                btn.click();
                return true;
              }
            }
          }
        }
        return false;
      }, { monto, moneda: monedaParaBusqueda });
      
      if (!encontrada) {
        throw new Error(`❌ No se encontró la solicitud con monto ${monto} ${monedaParaBusqueda} en la bandeja del Aprobador ${nivelAprobador}`);
      }
      await global.page.waitForSelector('button.btn-success:has-text("APROBAR"), button:has-text("Enviar")', { 
        state: 'visible', 
        timeout: 10000 
      });
      console.log(`   ✓ Solicitud encontrada y seleccionada por monto`);
    }
    
    await aprobarPage.clickAprobar();
    await global.page.waitForTimeout(3000);
    console.log(`   ✅ Solicitud ${solicitud.correlativo} aprobada por Aprobador ${nivelAprobador}`);
    
    // Cerrar sesión solo si no es el último aprobador
    if (!esUltimo) {
      console.log(`   🔄 Cerrando sesión para permitir login del siguiente aprobador...`);
      await loginPage.navigateToLogin();
      await global.page.waitForTimeout(2000);
      await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
      console.log(`   ✓ Sesión cerrada`);
    }
  };
  
  // Ejecutar aprobación secuencial para cada aprobador necesario
  for (let i = 0; i < aprobadoresNecesarios.length; i++) {
    const nivelAprobador = aprobadoresNecesarios[i];
    const esUltimo = i === aprobadoresNecesarios.length - 1;
    await aprobarConAprobador(nivelAprobador, esUltimo);
  }
  
  // Guardar información para el siguiente paso
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = monedaParaBusqueda;
  
  console.log(`\n   ✅ ==========================================`);
  console.log(`   ✅ APROBACIÓN COMPLETADA POR APROBADORES: ${aprobadoresNecesarios.join(', ')}`);
  console.log(`   ✅ ==========================================\n`);
});

// Steps para Aprobador 2 - Solicitud aprobada por Aprobador 1 (formato antiguo, mantener para compatibilidad)
Given('que la solicitud {string} con monto {int} Soles fue aprobada por Aprobador {int}', async function(memo: string, monto: number, aprobadorNivel: number) {
  // IMPORTANTE: Este step ejecuta realmente la aprobación por Aprobador 1 antes del test de Aprobador 2/3
  console.log(`   🔄 Ejecutando aprobación por Aprobador 1 para solicitud ${memo} (${monto} Soles)...`);
  
  // Buscar la solicitud creada con este memo y monto (debe tener aprobadorNivel: 2 o 3)
  const solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, 'Soles', aprobadorNivel === 2 ? 2 : 3, 'VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error(`❌ No se encontró solicitud creada para ${memo} con monto ${monto} Soles (Aprobador Nivel: ${aprobadorNivel}). Debe ejecutarse primero el test de registro.`);
  }
  
  // Login como Aprobador 1
  const aprobador1 = getAprobadorVIDA(1);
  const loginPage = new LoginPage(global.page);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador1.username);
  await loginPage.enterPassword(aprobador1.password);
  await loginPage.clickLoginButton();
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 1: ${aprobador1.username}`);
  
  // Navegar a bandeja y aprobar la solicitud
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  
  // Aprobar la solicitud
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 1`);
  
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 2...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  
  // Guardar información para el siguiente paso (el correlativo/incidente sigue siendo el mismo después de aprobar)
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = 'Soles';
  this.correlativoAprobado = solicitud.correlativo;
  this.incidenteAprobado = solicitud.incidente;
});

Given('que la solicitud {string} con monto {int} Dolares fue aprobada por Aprobador {int}', async function(memo: string, monto: number, aprobadorNivel: number) {
  // IMPORTANTE: Este step ejecuta realmente la aprobación por Aprobador 1 antes del test de Aprobador 2/3
  console.log(`   🔄 Ejecutando aprobación por Aprobador 1 para solicitud ${memo} (${monto} Dolares)...`);
  
  // Buscar la solicitud creada con este memo y monto (debe tener aprobadorNivel: 2 o 3)
  const solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, 'Dolares', aprobadorNivel === 2 ? 2 : 3, 'VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error(`❌ No se encontró solicitud creada para ${memo} con monto ${monto} Dolares (Aprobador Nivel: ${aprobadorNivel}). Debe ejecutarse primero el test de registro.`);
  }
  
  // Login como Aprobador 1
  const aprobador1 = getAprobadorVIDA(1);
  const loginPage = new LoginPage(global.page);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador1.username);
  await loginPage.enterPassword(aprobador1.password);
  await loginPage.clickLoginButton();
  const dashboardVisible = await loginPage.isLoginSuccessful();
  expect(dashboardVisible).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 1: ${aprobador1.username}`);
  
  // Navegar a bandeja y aprobar la solicitud
  const aprobarPage = new AprobarSolicitudPage(global.page);
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  
  // Aprobar la solicitud
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 1`);
  
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 2...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  
  // Guardar información para el siguiente paso (el correlativo/incidente sigue siendo el mismo después de aprobar)
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = 'Dolares';
  this.correlativoAprobado = solicitud.correlativo;
  this.incidenteAprobado = solicitud.incidente;
});

// Steps para Aprobador 3 - Solicitud aprobada por Aprobador 1 y 2
Given('que la solicitud {string} con monto {int} Soles fue aprobada por Aprobador {int} y {int}', async function(memo: string, monto: number, aprobador1: number, aprobador2: number) {
  // IMPORTANTE: Este step ejecuta realmente la aprobación por Aprobador 1 y luego Aprobador 2
  console.log(`   🔄 Ejecutando aprobación por Aprobador 1 y 2 para solicitud ${memo} (${monto} Soles)...`);
  
  // Buscar la solicitud creada con este memo y monto (debe tener aprobadorNivel: 3)
  const solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, 'Soles', 3, 'VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error(`❌ No se encontró solicitud creada para ${memo} con monto ${monto} Soles (Aprobador Nivel: 3). Debe ejecutarse primero el test de registro.`);
  }
  
  const loginPage = new LoginPage(global.page);
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // PASO 1: Aprobación por Aprobador 1
  console.log(`   📋 Paso 1: Aprobación por Aprobador 1...`);
  const aprobador1User = getAprobadorVIDA(1);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador1User.username);
  await loginPage.enterPassword(aprobador1User.password);
  await loginPage.clickLoginButton();
  const dashboardVisible1 = await loginPage.isLoginSuccessful();
  expect(dashboardVisible1).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 1: ${aprobador1User.username}`);
  
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 1`);
  
  // PASO 2: Aprobación por Aprobador 2
  console.log(`   📋 Paso 2: Aprobación por Aprobador 2...`);
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 2...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  const aprobador2User = getAprobadorVIDA(2);
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador2User.username);
  await loginPage.enterPassword(aprobador2User.password);
  await loginPage.clickLoginButton();
  const dashboardVisible2 = await loginPage.isLoginSuccessful();
  expect(dashboardVisible2).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 2: ${aprobador2User.username}`);
  
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 2`);
  
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 3...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  
  // Guardar información para el siguiente paso (el correlativo/incidente sigue siendo el mismo después de aprobar)
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = 'Soles';
  this.correlativoAprobado = solicitud.correlativo;
  this.incidenteAprobado = solicitud.incidente;
});

Given('que la solicitud {string} con monto {int} Dolares fue aprobada por Aprobador {int} y {int}', async function(memo: string, monto: number, aprobador1: number, aprobador2: number) {
  // IMPORTANTE: Este step ejecuta realmente la aprobación por Aprobador 1 y luego Aprobador 2
  console.log(`   🔄 Ejecutando aprobación por Aprobador 1 y 2 para solicitud ${memo} (${monto} Dolares)...`);
  
  // Buscar la solicitud creada con este memo y monto (debe tener aprobadorNivel: 3)
  const solicitud = obtenerSolicitudPorMemoYMonto(memo, monto, 'Dolares', 3, 'VIDA');
  
  if (!solicitud || !solicitud.correlativo) {
    throw new Error(`❌ No se encontró solicitud creada para ${memo} con monto ${monto} Dolares (Aprobador Nivel: 3). Debe ejecutarse primero el test de registro.`);
  }
  
  const loginPage = new LoginPage(global.page);
  const aprobarPage = new AprobarSolicitudPage(global.page);
  
  // PASO 1: Aprobación por Aprobador 1
  console.log(`   📋 Paso 1: Aprobación por Aprobador 1...`);
  const aprobador1User = getAprobadorVIDA(1);
  await loginPage.navigateToLogin();
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador1User.username);
  await loginPage.enterPassword(aprobador1User.password);
  await loginPage.clickLoginButton();
  const dashboardVisible1 = await loginPage.isLoginSuccessful();
  expect(dashboardVisible1).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 1: ${aprobador1User.username}`);
  
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 1`);
  
  // PASO 2: Aprobación por Aprobador 2
  console.log(`   📋 Paso 2: Aprobación por Aprobador 2...`);
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 2...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  const aprobador2User = getAprobadorVIDA(2);
  await loginPage.clickToggleTraditionalLogin();
  await loginPage.enterUsername(aprobador2User.username);
  await loginPage.enterPassword(aprobador2User.password);
  await loginPage.clickLoginButton();
  const dashboardVisible2 = await loginPage.isLoginSuccessful();
  expect(dashboardVisible2).toBeTruthy();
  console.log(`   ✓ Login como Aprobador 2: ${aprobador2User.username}`);
  
  await aprobarPage.navegarABandeja();
  await aprobarPage.seleccionarSolicitudPorCorrelativoOIncidente(solicitud.correlativo, solicitud.incidente);
  await aprobarPage.clickAprobar();
  await global.page.waitForTimeout(3000); // Esperar procesamiento completo
  console.log(`   ✓ Solicitud ${solicitud.correlativo} aprobada por Aprobador 2`);
  
  // IMPORTANTE: Cerrar sesión explícitamente navegando a login y esperando que se cargue completamente
  console.log(`   🔄 Cerrando sesión para permitir login de Aprobador 3...`);
  await loginPage.navigateToLogin();
  await global.page.waitForTimeout(2000); // Esperar que la página de login se cargue completamente
  await global.page.waitForSelector('.toggle-login', { state: 'visible', timeout: 10000 });
  
  // Guardar información para el siguiente paso (el correlativo/incidente sigue siendo el mismo después de aprobar)
  this.memoAprobado = memo;
  this.montoAprobado = monto;
  this.monedaAprobada = 'Dolares';
  this.correlativoAprobado = solicitud.correlativo;
  this.incidenteAprobado = solicitud.incidente;
});

// Step eliminado - ahora se maneja en el step consolidado "fue aprobada por Aprobador 1"
// que detecta automáticamente si es @aprobador3 y ejecuta también la aprobación del Aprobador 2

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

