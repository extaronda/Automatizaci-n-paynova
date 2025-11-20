import { Page } from 'playwright';
import { getEnv } from '../helper/env/env';

// Cargar configuración de entorno
const env = getEnv();

const timeouts = {
  short: 5000,      // Reducido de 10000 a 5000
  medium: 10000,    // Reducido de 20000 a 10000
  long: 30000,      // Reducido de 60000 a 30000
  navigation: 30000 // Reducido de 60000 a 30000
};

/**
 * Page Object Model para la página de Login de Paynova
 * Implementa el patrón de diseño Page Object Model (POM)
 * Encapsula los elementos y acciones de la página de login
 */
export class LoginPage {
  private page: Page;

  // Selectores de elementos (localizadores)
  private selectors = {
    toggleTraditionalLoginButton: '.toggle-login',
    usernameInput: 'input[type="text"][placeholder="Usuario"]',
    passwordInput: 'input[type="password"][placeholder="Contraseña"]',
    loginButton: 'button[type="submit"]',
    googleLoginButton: '.isg__button_login--google',
    
    // Selectores para validación después del login
    userInfo: '.user-info',
    userName: '.user-name-verdana',
    sidebar: '.my-sidebar',
    navbar: '.navbar'
  };

  /**
   * Constructor de la clase LoginPage
   * @param page - Instancia de Playwright Page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navega a la página de login
   */
  async navigateToLogin(): Promise<void> {
    await this.page.goto(env.loginUrl, { 
      waitUntil: 'domcontentloaded', // Más rápido que networkidle
      timeout: timeouts.navigation 
    });
    console.log('✓ Navegación a página de login exitosa');
  }

  /**
   * Verifica si está en la página de login
   * @returns true si está en la página de login
   */
  async isOnLoginPage(): Promise<boolean> {
    try {
      const isVisible = await this.page.isVisible(this.selectors.googleLoginButton, {
        timeout: timeouts.medium
      });
      return isVisible;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hace clic en el botón "Usar login tradicional"
   * Muestra el formulario de usuario y contraseña
   */
  async clickToggleTraditionalLogin(): Promise<void> {
    await this.page.click(this.selectors.toggleTraditionalLoginButton);
    await this.page.waitForSelector(this.selectors.usernameInput, {
      state: 'visible',
      timeout: timeouts.medium
    });
    console.log('✓ Formulario de login tradicional mostrado');
  }

  /**
   * Verifica si el formulario tradicional está visible
   * @returns true si el formulario está visible
   */
  async isTraditionalFormVisible(): Promise<boolean> {
    try {
      return await this.page.isVisible(this.selectors.usernameInput, {
        timeout: timeouts.medium
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Ingresa el nombre de usuario en el campo correspondiente
   * @param username - Nombre de usuario
   */
  async enterUsername(username: string): Promise<void> {
    await this.page.fill(this.selectors.usernameInput, username);
    console.log(`✓ Usuario ingresado: ${username}`);
  }

  /**
   * Ingresa la contraseña en el campo correspondiente
   * @param password - Contraseña
   */
  async enterPassword(password: string): Promise<void> {
    await this.page.fill(this.selectors.passwordInput, password);
    console.log('✓ Contraseña ingresada');
  }

  /**
   * Hace clic en el botón "INGRESAR"
   */
  async clickLoginButton(): Promise<void> {
    await this.page.click(this.selectors.loginButton);
    console.log('✓ Clic en botón INGRESAR');
  }

  /**
   * Realiza el proceso completo de login
   * Método de alto nivel que encapsula el flujo completo
   * @param username - Nombre de usuario
   * @param password - Contraseña
   */
  async login(username: string, password: string): Promise<void> {
    await this.navigateToLogin();
    await this.clickToggleTraditionalLogin();
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
    console.log('✓ Proceso de login completado');
  }

  /**
   * Verifica si el login fue exitoso
   * Busca elementos que solo aparecen después de un login exitoso
   * @returns true si el login fue exitoso
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      // Espera a que aparezca el sidebar (elemento exclusivo del dashboard)
      await this.page.waitForSelector(this.selectors.sidebar, {
        state: 'visible',
        timeout: timeouts.long
      });
      
      // Verifica que el navbar esté visible
      const navbarVisible = await this.page.isVisible(this.selectors.navbar);
      
      // Verifica que la información del usuario esté visible
      const userInfoVisible = await this.page.isVisible(this.selectors.userInfo);
      
      const isSuccessful = navbarVisible && userInfoVisible;
      
      if (isSuccessful) {
        console.log('✓ Login exitoso - Dashboard cargado correctamente');
      }
      
      return isSuccessful;
    } catch (error) {
      console.log('✗ Login fallido - Dashboard no cargado');
      return false;
    }
  }

  /**
   * Verifica rápidamente si el login falló (para unhappy paths)
   * Usa un timeout corto porque esperamos que NO aparezca el dashboard
   * @returns true si el login falló (dashboard NO visible)
   */
  async isLoginFailed(): Promise<boolean> {
    try {
      // Espera solo 5 segundos para confirmar que NO aparece el dashboard
      await this.page.waitForSelector(this.selectors.sidebar, {
        state: 'visible',
        timeout: 5000 // Timeout corto para unhappy paths
      });
      
      // Si llegamos aquí, el sidebar apareció = login exitoso (no esperado)
      console.log('✗ Login NO falló - Dashboard apareció inesperadamente');
      return false;
    } catch (error) {
      // El sidebar NO apareció en 5 segundos = login falló correctamente
      console.log('✓ Login falló como se esperaba - Dashboard no visible');
      return true;
    }
  }

  /**
   * Obtiene el nombre del usuario logueado
   * @returns Nombre del usuario o null si no está logueado
   */
  async getLoggedUsername(): Promise<string | null> {
    try {
      await this.page.waitForSelector(this.selectors.userName, {
        timeout: timeouts.medium
      });
      const username = await this.page.textContent(this.selectors.userName);
      return username;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica si el botón de login está habilitado
   * @returns true si el botón está habilitado
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    try {
      const isDisabled = await this.page.getAttribute(
        this.selectors.loginButton,
        'disabled'
      );
      return isDisabled === null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpia el campo de usuario
   */
  async clearUsername(): Promise<void> {
    await this.page.fill(this.selectors.usernameInput, '');
    console.log('✓ Campo de usuario limpiado');
  }

  /**
   * Limpia el campo de contraseña
   */
  async clearPassword(): Promise<void> {
    await this.page.fill(this.selectors.passwordInput, '');
    console.log('✓ Campo de contraseña limpiado');
  }

  /**
   * Toma una captura de pantalla
   * @param filename - Nombre del archivo
   */
  async takeScreenshot(filename: string): Promise<void> {
    await this.page.screenshot({ 
      path: `./screenshots/${filename}.png`,
      fullPage: true
    });
    console.log(`✓ Screenshot guardado: ${filename}.png`);
  }

  /**
   * Cierra la página
   */
  async close(): Promise<void> {
    await this.page.close();
    console.log('✓ Página cerrada');
  }
}

