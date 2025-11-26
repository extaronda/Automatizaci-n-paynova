import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { RegistrarSolicitudPage } from '../pages/RegistrarSolicitudPage';
import { LoginPage } from '../pages/LoginPage';
import { getUsuarioPorNombre, getDatosSINIESTROSPorIdentificador } from '../helper/data-loader';
import { extraerDatosSolicitud, guardarSolicitudCreada } from '../helper/solicitud-data';

// ==================== ANTECEDENTES ====================
// El step "que estoy autenticado como usuario {string}" está en registrar-solicitud-vida.steps.ts
// y es compartido entre VIDA y SINIESTROS

// ==================== ACCIONES SINIESTROS ====================
// NOTA: Los steps "selecciono el memo", "hago clic en ENVIAR solicitud" y 
// "debería ver el modal con correlativo e incidente" están en registrar-solicitud.steps.ts
// y son compartidos entre RRHH, VIDA y SINIESTROS. Solo agregamos steps específicos de SINIESTROS aquí.

When('espero que aparezca el modal de Grupo SINIESTROS', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.esperarModalGrupoVIDA(); // Reutilizamos el mismo método (mismo modal)
  console.log('   ✓ Modal de Grupo SINIESTROS apareció');
});

When('selecciono el primer registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(1);
  console.log('   ✓ Primer registro seleccionado');
});

When('selecciono el segundo registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(2);
  console.log('   ✓ Segundo registro seleccionado');
});

When('selecciono el tercer registro del modal', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.seleccionarRegistroModal(3);
  console.log('   ✓ Tercer registro seleccionado');
});

When('hago clic en Guardar Seleccionado', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickGuardarSeleccionado();
  console.log('   ✓ Click en Guardar Seleccionado');
});

Then('debería ver el registro guardado en la grilla', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const tieneRegistro = await registrarPage.verificarRegistroEnGrilla();
  expect(tieneRegistro).toBeTruthy();
  console.log('   ✓ Registro guardado en la grilla');
});

When('hago clic en el botón Editar del registro', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickEditarRegistro();
  console.log('   ✓ Modo edición activado');
});

When('completo los datos de SINIESTROS:', async function(dataTable: DataTable) {
  const datos = dataTable.hashes()[0];
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Detectar si estamos en modo edición (después de modal) o modo directo (sin modal)
  // Si hay nombres requeridos, es modo directo
  const requiereNombres = datos['Nombres'] && datos['Nombres'].trim() !== '';
  
  if (requiereNombres) {
    // Modo directo (sin modal) - usar llenarFormularioCompletoSINIESTROS
    await registrarPage.llenarFormularioCompletoSINIESTROS({
      nombres: datos['Nombres'],
      dni: datos['DNI'],
      poliza: datos['Poliza'], // Opcional
      siniestros: datos['Siniestros'],
      cobertura: datos['Cobertura'],
      moneda: datos['Moneda'],
      monto: parseFloat(datos['Monto']),
      banco: datos['Banco'],
      tipoCuenta: datos['Tipo cuenta'],
      numeroCuenta: datos['Número cuenta']
    });
  } else {
    // Modo edición (después de modal) - usar completarFormularioSINIESTROS
    await registrarPage.completarFormularioSINIESTROS({
      nombres: datos['Nombres'], // Opcional
      dni: datos['DNI'],
      poliza: datos['Poliza'], // Opcional
      siniestros: datos['Siniestros'],
      cobertura: datos['Cobertura'],
      moneda: datos['Moneda'],
      monto: parseFloat(datos['Monto']),
      banco: datos['Banco'],
      tipoCuenta: datos['Tipo cuenta'],
      numeroCuenta: datos['Número cuenta']
    });
  }
  
  // Guardar en contexto para usar en modal de éxito
  this.montoActual = parseFloat(datos['Monto']);
  this.monedaActual = datos['Moneda'];
  
  console.log(`   ✓ Datos completados → ${datos['Banco']} | ${datos['Moneda']} ${datos['Monto']}`);
});

When('completo los datos de SINIESTROS desde JSON {string}', async function(identificador: string) {
  const datosJSON = getDatosSINIESTROSPorIdentificador(identificador);
  const registrarPage = new RegistrarSolicitudPage(global.page);
  
  // Detectar si requiere modal o no
  const requiereModal = datosJSON.requiere_modal === true;
  
  if (requiereModal) {
    // Modo edición (después de modal) - usar completarFormularioSINIESTROS
    await registrarPage.completarFormularioSINIESTROS({
      nombres: datosJSON.nombres, // Opcional - viene del modal
      dni: datosJSON.dni,
      poliza: datosJSON.poliza, // Opcional - viene del modal
      siniestros: datosJSON.siniestros,
      cobertura: datosJSON.cobertura,
      moneda: datosJSON.moneda,
      monto: datosJSON.monto,
      banco: datosJSON.banco,
      tipoCuenta: datosJSON.tipo_cuenta,
      numeroCuenta: datosJSON.numero_cuenta
    });
  } else {
    // Modo directo (sin modal) - usar llenarFormularioCompletoSINIESTROS
    await registrarPage.llenarFormularioCompletoSINIESTROS({
      nombres: datosJSON.nombres || '', // Requerido en modo directo
      dni: datosJSON.dni,
      poliza: datosJSON.poliza, // Opcional
      siniestros: datosJSON.siniestros,
      cobertura: datosJSON.cobertura,
      moneda: datosJSON.moneda,
      monto: datosJSON.monto,
      banco: datosJSON.banco,
      tipoCuenta: datosJSON.tipo_cuenta,
      numeroCuenta: datosJSON.numero_cuenta
    });
  }
  
  // Guardar en contexto para usar en modal de éxito
  this.montoActual = datosJSON.monto;
  this.monedaActual = datosJSON.moneda;
  
  console.log(`   ✓ Datos completados desde JSON → ${datosJSON.banco} | ${datosJSON.moneda} ${datosJSON.monto}`);
});

When('hago clic en ACTUALIZAR sin validar', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickActualizar();
  console.log('   ✓ Click ACTUALIZAR');
  
  // Esperar un momento para que se actualice la grilla
  await registrarPage.page.waitForTimeout(2000);
});

When('hago clic en ACTUALIZAR', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  await registrarPage.clickActualizar();
  console.log('   ✓ Click ACTUALIZAR');
  
  // Esperar a que aparezca el modal (error de negocio)
  await registrarPage.page.waitForTimeout(2000);
  
  // Buscar el modal de error y capturar su texto
  // Primero intentar con el nuevo modal PrimeVue
  const modalPrimeVue = registrarPage.page.locator('.p-dialog, .isg__confirm__container').first();
  const modalPrimeVueVisible = await modalPrimeVue.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (modalPrimeVueVisible) {
    const mensajeModal = registrarPage.page.locator('.isg__confirm__message').first();
    const modalTexto = await mensajeModal.textContent() || '';
    this.modalErrorTexto = modalTexto;
    console.log(`   🚨 Modal PrimeVue de error detectado: "${modalTexto.substring(0, 100)}..."`);
  } else {
    // Fallback: buscar modal legacy
    const modalError = registrarPage.page.locator('.modal:visible, [class*="modal"]:visible').first();
    const modalVisible = await modalError.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (modalVisible) {
      const modalTexto = await modalError.textContent() || '';
      this.modalErrorTexto = modalTexto;
      console.log(`   🚨 Modal de error detectado (legacy): "${modalTexto.substring(0, 100)}..."`);
    } else {
      this.modalErrorTexto = '';
      console.log('   ⚠️ No se detectó modal de error');
    }
  }
});

// ==================== VERIFICACIONES ====================

Then('debería ver el registro actualizado en la grilla', async function() {
  const registrarPage = new RegistrarSolicitudPage(global.page);
  const tieneRegistro = await registrarPage.verificarRegistroEnGrilla();
  expect(tieneRegistro).toBeTruthy();
  console.log('   ✓ Registro actualizado en la grilla');
});
