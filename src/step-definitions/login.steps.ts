import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * Step Definitions para el Feature de Login
 * Usa variables globales (global.page) en lugar de CustomWorld
 */

// ==================== GIVEN (Antecedentes) ====================

Given('que estoy en la página de login de Paynova', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.navigateToLogin();
  
  const isOnLoginPage = await loginPage.isOnLoginPage();
  expect(isOnLoginPage).toBeTruthy();
  
  console.log('✓ Usuario en página de login');
});

// ==================== WHEN (Acciones) ====================

When('hago clic en {string}', async function(buttonText: string) {
  const loginPage = new LoginPage(global.page);
  
  if (buttonText === 'Usar login tradicional') {
    await loginPage.clickToggleTraditionalLogin();
    console.log('✓ Clic en "Usar login tradicional"');
  } else {
    throw new Error(`Botón no reconocido: ${buttonText}`);
  }
});

When('ingreso el usuario {string}', async function(username: string) {
  const loginPage = new LoginPage(global.page);
  await loginPage.enterUsername(username);
  console.log(`✓ Usuario ingresado: ${username}`);
});

When('ingreso la contraseña {string}', async function(password: string) {
  const loginPage = new LoginPage(global.page);
  await loginPage.enterPassword(password);
  console.log('✓ Contraseña ingresada');
});

When('hago clic en el botón INGRESAR', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.clickLoginButton();
  
  // Esperar un momento para que se procese la petición
  await global.page.waitForTimeout(3000);
  
  console.log('✓ Clic en botón INGRESAR');
});

When('dejo el campo de usuario vacío', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.clearUsername();
  console.log('✓ Campo de usuario dejado vacío');
});

When('dejo el campo de contraseña vacío', async function() {
  const loginPage = new LoginPage(global.page);
  await loginPage.clearPassword();
  console.log('✓ Campo de contraseña dejado vacío');
});

// ==================== THEN (Verificaciones) ====================

Then('debería ver el dashboard del sistema', async function() {
  const loginPage = new LoginPage(global.page);
  const isLoginSuccessful = await loginPage.isLoginSuccessful();
  
  expect(isLoginSuccessful).toBeTruthy();
  console.log('✓ Dashboard visible - Login exitoso');
});

Then('debería ver mi nombre de usuario en el navbar', async function() {
  const loginPage = new LoginPage(global.page);
  const username = await loginPage.getLoggedUsername();
  
  expect(username).not.toBeNull();
  expect(username).toBeTruthy();
  console.log(`✓ Nombre de usuario visible en navbar: ${username}`);
});

Then('debería ver el menú lateral de navegación', async function() {
  const sidebarVisible = await global.page.isVisible('.my-sidebar', { timeout: 10000 });
  
  expect(sidebarVisible).toBeTruthy();
  console.log('✓ Menú lateral de navegación visible');
});

Then('no debería ver el dashboard del sistema', async function() {
  const loginPage = new LoginPage(global.page);
  const isLoginFailed = await loginPage.isLoginFailed();
  
  expect(isLoginFailed).toBeTruthy();
  console.log('✓ Dashboard no visible - Login fallido como se esperaba');
});

Then('debería permanecer en la página de login', async function() {
  const loginPage = new LoginPage(global.page);
  const isOnLoginPage = await loginPage.isOnLoginPage();
  
  expect(isOnLoginPage).toBeTruthy();
  console.log('✓ Usuario permanece en página de login');
});

Then('el botón INGRESAR debería estar deshabilitado', async function() {
  const loginPage = new LoginPage(global.page);
  const isEnabled = await loginPage.isLoginButtonEnabled();
  
  expect(isEnabled).toBeFalsy();
  console.log('✓ Botón INGRESAR está deshabilitado');
});

Then('debería ver el campo de usuario', async function() {
  const loginPage = new LoginPage(global.page);
  const isVisible = await loginPage.isTraditionalFormVisible();
  
  expect(isVisible).toBeTruthy();
  console.log('✓ Campo de usuario visible');
});

Then('debería ver el campo de contraseña', async function() {
  const passwordFieldVisible = await global.page.isVisible(
    'input[type="password"][placeholder="Contraseña"]',
    { timeout: 10000 }
  );
  
  expect(passwordFieldVisible).toBeTruthy();
  console.log('✓ Campo de contraseña visible');
});

Then('debería ver el botón INGRESAR', async function() {
  const buttonVisible = await global.page.isVisible('button[type="submit"]', { timeout: 10000 });
  
  expect(buttonVisible).toBeTruthy();
  console.log('✓ Botón INGRESAR visible');
});
