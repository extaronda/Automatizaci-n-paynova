/**
 * Type definitions para variables globales
 * Permite usar global.browser, global.page, etc. con TypeScript
 */

import { Browser, BrowserContext, Page } from 'playwright';

declare global {
  var browser: Browser;
  var context: BrowserContext;
  var page: Page;
  
  namespace NodeJS {
    interface ProcessEnv {
      ENV?: 'dev' | 'uat' | 'prod';
      BROWSER?: 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'safari';
      HEADLESS?: 'true' | 'false';
      BASE_URL?: string;
      LOGIN_URL?: string;
      TIMEOUT?: string;
      SLOW_MO?: string;
      TEST_USERNAME?: string;
      TEST_PASSWORD?: string;
    }
  }
}

export {};

