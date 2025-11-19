import * as dotenv from 'dotenv';

/**
 * Environment Manager
 * Carga y gestiona variables de entorno
 */

export const getEnv = () => {
  const environment = process.env.ENV || 'uat';
  
  console.log(`🌍 Cargando entorno: ${environment.toUpperCase()}`);
  
  // Cargar variables de entorno desde archivo .env
  dotenv.config({
    path: `.env.${environment}`,
    override: true
  });
  
  // También cargar .env por defecto
  dotenv.config();
  
  // Log de configuración cargada
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'No configurada'}`);
  console.log(`🌐 Browser: ${process.env.BROWSER || 'chromium'}`);
  
  return {
    baseUrl: process.env.BASE_URL || 'https://paynova-uat.interseguro.com.pe',
    loginUrl: process.env.LOGIN_URL || 'https://paynova-uat.interseguro.com.pe/login',
    browser: process.env.BROWSER || 'chromium',
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '60000'),
    slowMo: parseInt(process.env.SLOW_MO || '100')
  };
};

