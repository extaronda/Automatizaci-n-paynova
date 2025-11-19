import { chromium, firefox, webkit, LaunchOptions } from 'playwright';

/**
 * Browser Manager
 * Gestiona la creación y configuración de navegadores
 */

const options: LaunchOptions = {
  headless: false,
  slowMo: 100,
  timeout: 30000,
  args: [
    '--start-maximized',
    '--ignore-certificate-errors',
    '--disable-blink-features=AutomationControlled'
  ]
};

export const invokeBrowser = () => {
  const browserType = process.env.BROWSER || 'chromium';
  
  console.log(`🚀 Lanzando navegador: ${browserType}`);
  
  switch (browserType.toLowerCase()) {
    case 'chrome':
    case 'chromium':
      return chromium.launch(options);
      
    case 'firefox':
      return firefox.launch(options);
      
    case 'webkit':
    case 'safari':
      return webkit.launch(options);
      
    default:
      console.log(`⚠️  Navegador desconocido: ${browserType}, usando Chromium`);
      return chromium.launch(options);
  }
};

