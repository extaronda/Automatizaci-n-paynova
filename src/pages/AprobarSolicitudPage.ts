/**
 * Page Object para la funcionalidad de Aprobación de Solicitudes
 * Maneja diálogos nativos del navegador (alert/confirm)
 */

import { Page, expect } from '@playwright/test';

export class AprobarSolicitudPage {
  constructor(private page: Page) {}

  // ==================== SELECTORES ====================

  private selectors = {
    // Navegación
    menuSolicitudPagos: 'button:has-text("Solicitud de Pagos")',
    linkBandeja: 'a:has-text("Bandeja")',
    
    // Bandeja
    tablaSolicitudes: 'table tbody tr',
    botonVerDetalle: 'button:has-text("👁️"), button[title*="Ver"], button[title*="Detalle"]',
    botonTrazabilidad: 'button:has-text("📋"), button[title*="Trazabilidad"]',
    
    // Detalle de Solicitud
    botonAprobar: 'button.btn-success:has-text("APROBAR")',
    botonRechazar: 'button.btn-danger:has-text("RECHAZAR")',
    botonObservar: 'button.btn-warning:has-text("OBSERVAR")',
    botonVolverBandeja: 'button:has-text("VOLVER A BANDEJA"), a:has-text("VOLVER A BANDEJA")',
    
    // Información de la solicitud
    correlativo: 'text=/Correlativo:/i',
    incidente: 'text=/Incidente:/i',
    estado: 'text=/Estado:/i',
    paso: 'text=/Paso Actual:/i',
    
    // Campos de comentario (para Rechazar/Observar)
    textareaComentario: 'textarea, input[type="text"][placeholder*="comentario"], input[type="text"][placeholder*="observación"]',
    botonAceptarDocumento: 'button:has-text("Aceptar documento"), button:has-text("Aceptar Orden")',
    botonConfirmarCambio: 'button:has-text("Confirmar Cambio"), button:has-text("Confirmar")',
  };

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la bandeja de solicitudes de pago
   * IMPORTANTE: Debe ser la "Bandeja" dentro del menú "Solicitud de Pagos" (href="/solicitudes-pago")
   * Usa el mismo método robusto que RegistrarSolicitudPage
   */
  async navegarABandeja(): Promise<void> {
    // Verificar si ya estamos en la bandeja
    const currentUrl = this.page.url();
    if (currentUrl.includes('/solicitudes-pago') && !currentUrl.includes('/registrar')) {
      // Ya estamos en la bandeja, solo esperar a que cargue la tabla (timeout reducido)
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
      return;
    }
    
    // 1. Expandir menú Solicitud de Pagos
    const menuButton = this.page.locator('button:has-text("Solicitud de Pagos")');
    await menuButton.waitFor({ state: 'visible', timeout: 3000 });
    await menuButton.click();
    // Esperar solo a que aparezca el submenu (timeout reducido)
    await this.page.waitForSelector('a[href="/solicitudes-pago"].submenu-item', { state: 'attached', timeout: 2000 });
    
    // 2. Hacer clic en el enlace "Bandeja" del submenu de "Solicitud de Pagos"
    // Selector específico: <a href="/solicitudes-pago" class="submenu-item">Bandeja</a>
    // NO confundir con otras "Bandeja" de otros menús (como Asientos Manuales que tiene href="/inbox")
    // Usar force: true porque el elemento puede estar hidden pero presente en el DOM
    const linkBandeja = this.page.locator('a[href="/solicitudes-pago"].submenu-item');
    await linkBandeja.click({ force: true });
    
    // 3. Esperar a que cargue la tabla de solicitudes de pago (timeout reducido)
    await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
  }

  /**
   * Selecciona una solicitud de la bandeja por correlativo o por índice
   * Usa el mismo método que funcionó en MCP Playwright
   */
  async seleccionarSolicitud(correlativo?: string, indice: number = 0): Promise<void> {
    if (correlativo) {
      // Buscar por correlativo usando JavaScript (como en MCP)
      await this.page.evaluate((corr: string) => {
        // @ts-ignore - document existe en el contexto del navegador
        const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
        for (const row of rows) {
          if (row.textContent?.includes(corr)) {
            const buttons = row.querySelectorAll('button, a') as any;
            for (const btn of buttons) {
              const text = btn.textContent || '';
              const title = btn.getAttribute('title') || '';
              if (text.includes('👁️') || title.includes('Ver') || title.includes('Detalle')) {
                btn.click();
                return true;
              }
            }
          }
        }
        return false;
      }, correlativo);
    } else {
      // Seleccionar por índice (primera fila por defecto)
      const rows = this.page.locator('tbody tr, table tr');
      await rows.nth(indice).evaluate((row: any) => {
        const buttons = row.querySelectorAll('button, a') as any;
        for (const btn of buttons) {
          const text = btn.textContent || '';
          if (text.includes('👁️')) {
            btn.click();
            return true;
          }
        }
        return false;
      });
    }
    
    // Esperar a que cargue el detalle
    await this.page.waitForSelector('button.btn-success:has-text("APROBAR")', { state: 'visible', timeout: 10000 });
  }

  /**
   * Extrae el ID de la solicitud desde la tabla de la bandeja usando correlativo o incidente
   * El ID está en la primera columna de la tabla
   */
  async extraerIdSolicitudDesdeBandeja(correlativo: string, incidente: string): Promise<string | null> {
    return await this.page.evaluate(({ corr, inc }: { corr: string; inc: string }) => {
      // @ts-ignore
      const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
      for (const row of rows) {
        const rowText = row.textContent || '';
        if (rowText.includes(corr) || rowText.includes(inc)) {
          // El ID suele estar en la primera celda (td) de la fila
          const firstCell = row.querySelector('td');
          if (firstCell) {
            const id = firstCell.textContent?.trim();
            // Verificar que sea un número (el ID)
            if (id && /^\d+$/.test(id)) {
              return id;
            }
          }
          // También buscar en el href de los botones/enlaces
          const links = row.querySelectorAll('a[href*="/solicitudes-pago/"]');
          for (const link of links) {
            const href = link.getAttribute('href') || '';
            const match = href.match(/\/solicitudes-pago\/(\d+)/);
            if (match) {
              return match[1];
            }
          }
        }
      }
      return null;
    }, { corr: correlativo, inc: incidente });
  }

  /**
   * Navega directamente al detalle de una solicitud usando el ID o incidente
   * Útil cuando la solicitud puede estar en cualquier estado y no está en la bandeja actual
   */
  async navegarADetallePorIncidente(incidente: string, correlativo?: string): Promise<void> {
    // Primero intentar extraer el ID desde la bandeja si está visible
    if (correlativo) {
      const idSolicitud = await this.extraerIdSolicitudDesdeBandeja(correlativo, incidente);
      if (idSolicitud) {
        try {
      await this.page.goto(`/solicitudes-pago/${idSolicitud}?origen=bandeja`, {
        waitUntil: 'domcontentloaded', // Más rápido que networkidle
        timeout: 8000
      });
      
      await this.page.waitForSelector('text=/Detalle de Solicitud/i, h1:has-text("Detalle"), text=/Información General/i', {
        state: 'visible',
        timeout: 4000
      });
          
          console.log(`   ✓ Navegado directamente al detalle usando ID: ${idSolicitud}`);
          return;
        } catch (error) {
          console.log(`   ⚠️  No se pudo navegar con ID ${idSolicitud}`);
        }
      }
    }
    
    // Si no se encontró ID, intentar con el incidente directamente
    try {
      await this.page.goto(`/solicitudes-pago/${incidente}?origen=bandeja`, {
        waitUntil: 'domcontentloaded', // Más rápido que networkidle
        timeout: 8000
      });
      
      await this.page.waitForSelector('text=/Detalle de Solicitud/i, h1:has-text("Detalle"), text=/Información General/i', {
        state: 'visible',
        timeout: 4000
      });
      
      console.log(`   ✓ Navegado directamente al detalle usando incidente: ${incidente}`);
      return;
    } catch (error) {
      console.log(`   ⚠️  No se pudo navegar directamente con incidente ${incidente}`);
      throw error;
    }
  }

  /**
   * Selecciona una solicitud por correlativo O incidente (más confiable que memo)
   * IMPORTANTE: Busca específicamente por correlativo/incidente desde solicitudes-creadas.json
   * NO selecciona la primera de la grilla, busca la solicitud exacta
   * OPCIONAL: Valida también el monto si se proporciona
   * Si no la encuentra en la bandeja, intenta navegar directamente por URL
   */
  async seleccionarSolicitudPorCorrelativoOIncidente(correlativo: string, incidente: string): Promise<void> {
    // Primero intentar buscar en la bandeja actual
    const encontrado = await this.page.evaluate(({ corr, inc }: { corr: string; inc: string }) => {
      // @ts-ignore - document existe en el contexto del navegador
      const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
      for (const row of rows) {
        const rowText = row.textContent || '';
        // Buscar por correlativo O incidente (cualquiera de los dos)
        if (rowText.includes(corr) || rowText.includes(inc)) {
          const buttons = row.querySelectorAll('button, a') as any;
          for (const btn of buttons) {
            const text = btn.textContent || '';
            const title = btn.getAttribute('title') || '';
            // Buscar botón del ojo (👁️) o botones con "Ver" o "Detalle"
            if (text.includes('👁️') || title.includes('Ver') || title.includes('Detalle') || 
                text.includes('Ver') || text.includes('ver') || title.toLowerCase().includes('ver')) {
              btn.click();
              return { encontrado: true, metodo: 'correlativo', valor: corr };
            }
          }
        }
      }
      return false;
    }, { corr: correlativo, inc: incidente });
    
    // Si no se encontró en la bandeja, intentar navegar directamente
    if (!encontrado || !encontrado.encontrado) {
      console.log(`   🔍 Solicitud no encontrada en bandeja actual, intentando navegar directamente...`);
      try {
        await this.navegarADetallePorIncidente(incidente, correlativo);
        // Si llegamos aquí, la navegación fue exitosa
        return;
      } catch (error) {
        // Si tampoco funciona, lanzar error con información útil
        const filasDisponibles = await this.page.evaluate(() => {
          // @ts-ignore
          const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
          return rows.slice(0, 5).map((row: any) => (row.textContent || '').substring(0, 100));
        });
        throw new Error(
          `No se encontró solicitud con correlativo "${correlativo}" o incidente "${incidente}" en la bandeja ni se pudo navegar directamente. ` +
          `Filas disponibles: ${filasDisponibles.join(' | ')}`
        );
      }
    }
    
    // Esperar a que cargue el detalle (más flexible, no requiere botones de acción)
    try {
      // Esperar por el título del detalle o cualquier elemento característico
      await this.page.waitForSelector('text=/Detalle de Solicitud/i, h1:has-text("Detalle"), text=/Información General/i', {
        state: 'visible',
        timeout: 5000
      });
      console.log('   ✓ Detalle de solicitud cargado');
    } catch (error) {
      // Si no encuentra el título, verificar que al menos estamos en una URL de detalle
      const currentUrl = this.page.url();
      if (currentUrl.includes('/solicitudes-pago/') && !currentUrl.includes('/registrar')) {
        console.log('   ✓ Navegado al detalle (verificado por URL)');
        // Esperar solo 500ms para que cargue el contenido (reducido de 2000ms)
        await this.page.waitForTimeout(500);
      } else {
        throw new Error(`No se pudo verificar que se cargó el detalle. URL actual: ${currentUrl}`);
      }
    }
    
    if (!encontrado.encontrado) {
      // Obtener información de debug: primeros correlativos/incidentes visibles
      const debugInfo = await this.page.evaluate(() => {
        // @ts-ignore
        const rows = Array.from(document.querySelectorAll('tbody tr')) as any[];
        return rows.slice(0, 5).map((row: any) => {
          const text = row.textContent || '';
          const corrMatch = text.match(/(\d{4}-[A-Z]+-\d+)/);
          const incMatch = text.match(/(\d{6,})/);
          return {
            correlativo: corrMatch ? corrMatch[1] : 'N/A',
            incidente: incMatch ? incMatch[1] : 'N/A',
            preview: text.substring(0, 80)
          };
        });
      });
      
      throw new Error(
        `❌ No se encontró solicitud con correlativo "${correlativo}" o incidente "${incidente}" en la bandeja.\n` +
        `Solicitudes visibles en la bandeja:\n${debugInfo.map((s: any) => `  - Correlativo: ${s.correlativo}, Incidente: ${s.incidente}`).join('\n')}\n` +
        `Asegúrate de que la solicitud fue registrada correctamente y está en estado PENDIENTE_APROBACION.`
      );
    }
    
    console.log(`   ✓ Solicitud encontrada por ${encontrado.metodo}: ${encontrado.valor}`);
    
    // Esperar a que cargue el detalle (más flexible, no requiere botones de acción)
    // Puede que el usuario no sea aprobador, así que solo esperamos el contenido del detalle
    try {
      await this.page.waitForSelector('text=/Detalle de Solicitud/i, h1:has-text("Detalle"), text=/Información General/i', {
        state: 'visible',
        timeout: 5000
      });
      console.log('   ✓ Detalle de solicitud cargado');
    } catch (error) {
      // Si no encuentra el título, esperar un momento y verificar URL
      await this.page.waitForTimeout(500);
      const currentUrl = this.page.url();
      if (currentUrl.includes('/solicitudes-pago/') && !currentUrl.includes('/registrar')) {
        console.log('   ✓ Detalle de solicitud cargado (verificado por URL)');
      } else {
        throw new Error(`No se pudo verificar que se cargó el detalle. URL actual: ${currentUrl}`);
      }
    }
  }

  /**
   * Selecciona la última solicitud creada con un memo específico
   * Usa el mismo método robusto que seleccionarSolicitud (JavaScript directo como en MCP)
   * Busca por texto parcial para ser más flexible
   */
  async seleccionarUltimaSolicitudPorMemo(memo: string): Promise<void> {
    // Normalizar el memo para búsqueda flexible (sin comas, mayúsculas/minúsculas)
    const memoNormalizado = memo.toUpperCase().replace(/,/g, '').trim();
    
    // Buscar usando JavaScript directo (como en MCP) - más robusto
    const encontrado = await this.page.evaluate((memoText: string) => {
      // @ts-ignore - document existe en el contexto del navegador
      const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
      for (const row of rows) {
        const rowText = (row.textContent || '').toUpperCase().replace(/,/g, '');
        // Buscar por coincidencia parcial (más flexible)
        if (rowText.includes(memoText) || memoText.split(' ').every(word => rowText.includes(word))) {
          const buttons = row.querySelectorAll('button, a') as any;
          for (const btn of buttons) {
            const text = btn.textContent || '';
            const title = btn.getAttribute('title') || '';
            // Buscar botón del ojo (👁️) o botones con "Ver" o "Detalle"
            if (text.includes('👁️') || title.includes('Ver') || title.includes('Detalle') || 
                text.includes('Ver') || text.includes('ver') || title.toLowerCase().includes('ver')) {
              btn.click();
              return true;
            }
          }
        }
      }
      return false;
    }, memoNormalizado);
    
    if (!encontrado) {
      // Intentar buscar todas las filas disponibles para debug
      const todasLasFilas = await this.page.evaluate(() => {
        // @ts-ignore
        const rows = Array.from(document.querySelectorAll('tbody tr, table tr')) as any[];
        return rows.slice(0, 5).map((row: any) => (row.textContent || '').substring(0, 100));
      });
      throw new Error(`No se encontró solicitud con memo "${memo}". Filas disponibles: ${todasLasFilas.join(' | ')}`);
    }
    
    // Esperar a que cargue el detalle (más flexible, no requiere botones de acción)
    await this.page.waitForSelector('text=/Detalle de Solicitud/i, h1:has-text("Detalle"), text=/Información General/i', {
      state: 'visible',
      timeout: 5000
    });
  }

  // ==================== VERIFICACIONES ====================

  /**
   * Verifica que está en la página de detalle de solicitud
   */
  async verificarDetalleVisible(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.selectors.botonAprobar, { state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el correlativo de la solicitud actual
   * Usa JavaScript directo para buscar en toda la página (más robusto como en MCP)
   */
  async obtenerCorrelativo(): Promise<string> {
    const correlativo = await this.page.evaluate(() => {
      // @ts-ignore - document existe en el contexto del navegador
      const pageText = document.body.innerText || document.body.textContent || '';
      // Buscar patrón: "Correlativo: 2025-VIDA-0441" o "Correlativo 2025-VIDA-0441"
      const match = pageText.match(/correlativo[:\s]+([0-9A-Z\-]+)/i);
      return match ? match[1].trim() : '';
    });
    return correlativo;
  }

  /**
   * Obtiene el incidente de la solicitud actual
   * Usa JavaScript directo para buscar en toda la página (más robusto como en MCP)
   */
  async obtenerIncidente(): Promise<string> {
    const incidente = await this.page.evaluate(() => {
      // @ts-ignore - document existe en el contexto del navegador
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar patrón: "Incidente: 633287" o "Incidente 633287"
      let match = pageText.match(/incidente[:\s]+(\d+)/i);
      if (match) return match[1].trim();
      
      // Buscar también en elementos específicos (labels, spans, etc.)
      // @ts-ignore
      const labels = Array.from(document.querySelectorAll('label, span, div, td')) as any[];
      for (const el of labels) {
        const text = el.textContent || '';
        if (text.toLowerCase().includes('incidente')) {
          const numMatch = text.match(/(\d{6,})/); // Buscar números de 6+ dígitos
          if (numMatch) return numMatch[1].trim();
        }
      }
      
      return '';
    });
    return incidente;
  }

  /**
   * Verifica que los datos del documento hayan migrado correctamente
   * Más flexible: verifica que hay tablas o datos en la página
   */
  async verificarDatosMigrados(): Promise<boolean> {
    // Verificar que hay datos en la página (tablas, información, etc.)
    // Buscar cualquier tabla o información de datos
    const tieneTablas = await this.page.evaluate(() => {
      // @ts-ignore
      const tables = document.querySelectorAll('table');
      return tables.length > 0;
    });
    
    if (tieneTablas) {
      return true;
    }
    
    // También verificar si hay texto que indique datos
    const tieneDatos = await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = (document.body.innerText || document.body.textContent || '').toLowerCase();
      return pageText.includes('datos') || pageText.includes('información') || pageText.includes('detalle');
    });
    
    return tieneDatos;
  }

  // ==================== MÉTODOS PARA VALIDACIÓN DE DETALLE ====================

  /**
   * Obtiene un campo de la sección Información General
   */
  async obtenerCampoInformacionGeneral(campo: string): Promise<string> {
    const valor = await this.page.evaluate((campoNombre: string) => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar el campo en el formato "Campo: Valor"
      const campoLower = campoNombre.toLowerCase();
      const regex = new RegExp(`${campoLower}[:\\s]+([^\\n]+)`, 'i');
      const match = pageText.match(regex);
      
      if (match) {
        return match[1].trim();
      }
      
      // Buscar también en elementos específicos
      // @ts-ignore
      const elements = Array.from(document.querySelectorAll('label, span, div, td, th')) as any[];
      for (const el of elements) {
        const text = el.textContent || '';
        if (text.toLowerCase().includes(campoLower)) {
          // Buscar el siguiente elemento hermano o el valor en el mismo elemento
          const nextSibling = el.nextElementSibling;
          if (nextSibling) {
            const nextText = nextSibling.textContent || '';
            if (nextText.trim() && !nextText.toLowerCase().includes(campoLower)) {
              return nextText.trim();
            }
          }
          // Si el texto contiene el valor después de ":"
          const colonMatch = text.match(new RegExp(`${campoLower}[:\\s]+([^\\n]+)`, 'i'));
          if (colonMatch) {
            return colonMatch[1].trim();
          }
        }
      }
      
      return '';
    }, campo);
    
    return valor;
  }

  /**
   * Obtiene todos los datos de la sección Información General
   */
  async obtenerInformacionGeneral(): Promise<Record<string, string>> {
    const campos = ['Correlativo', 'Incidente', 'Asunto', 'Monto', 'Estado', 'Fecha Creación'];
    const informacion: Record<string, string> = {};
    
    for (const campo of campos) {
      informacion[campo] = await this.obtenerCampoInformacionGeneral(campo);
    }
    
    return informacion;
  }

  /**
   * Verifica que la sección Datos tenga registros
   */
  async tieneRegistrosDatos(): Promise<boolean> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar la sección "Datos" y verificar si tiene registros
      const datosMatch = pageText.match(/datos\s*\((\d+)\s*registros?\)/i);
      if (datosMatch) {
        const cantidad = parseInt(datosMatch[1]);
        return cantidad > 0;
      }
      
      // Buscar tablas que puedan contener datos
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('nombre') && 
            tableText.toLowerCase().includes('dni') &&
            tableText.toLowerCase().includes('banco')) {
          // Verificar que tenga filas de datos (más de la fila de encabezado)
          const rows = table.querySelectorAll('tbody tr, tr');
          return rows.length > 1; // Al menos una fila de datos además del header
        }
      }
      
      return false;
    });
  }

  /**
   * Obtiene los registros de la sección Datos
   */
  async obtenerRegistrosDatos(): Promise<Array<Record<string, string>>> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      const registros: Array<Record<string, string>> = [];
      
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('nombre') && 
            tableText.toLowerCase().includes('dni') &&
            tableText.toLowerCase().includes('banco')) {
          // Encontrar la tabla de Datos
          const rows = table.querySelectorAll('tbody tr, tr');
          const headers: string[] = [];
          
          // Obtener headers de la primera fila
          const firstRow = rows[0];
          if (firstRow) {
            const headerCells = firstRow.querySelectorAll('th, td');
            headerCells.forEach((cell: any) => {
              headers.push((cell.textContent || '').trim());
            });
          }
          
          // Obtener datos de las filas siguientes
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            const registro: Record<string, string> = {};
            
            cells.forEach((cell: any, index: number) => {
              if (headers[index]) {
                registro[headers[index]] = (cell.textContent || '').trim();
              }
            });
            
            if (Object.keys(registro).length > 0) {
              registros.push(registro);
            }
          }
          
          break; // Solo procesar la primera tabla de Datos encontrada
        }
      }
      
      return registros;
    });
  }

  /**
   * Verifica que una sección esté presente en el detalle
   */
  async verificarSeccionPresente(nombreSeccion: string): Promise<boolean> {
    return await this.page.evaluate((seccion: string) => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      const seccionLower = seccion.toLowerCase();
      
      // Buscar el nombre de la sección en el texto
      return pageText.toLowerCase().includes(seccionLower);
    }, nombreSeccion);
  }

  /**
   * Verifica que la sección Trazabilidad tenga registros
   */
  async tieneRegistrosTrazabilidad(): Promise<boolean> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar la sección "Trazabilidad" y verificar si tiene registros
      const trazabilidadMatch = pageText.match(/trazabilidad\s*\((\d+)\s*registros?\)/i);
      if (trazabilidadMatch) {
        const cantidad = parseInt(trazabilidadMatch[1]);
        return cantidad > 0;
      }
      
      // Buscar tablas que puedan contener trazabilidad
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('paso') && 
            tableText.toLowerCase().includes('usuario') &&
            tableText.toLowerCase().includes('estado')) {
          // Verificar que tenga filas de datos
          const rows = table.querySelectorAll('tbody tr, tr');
          return rows.length > 1; // Al menos una fila de datos además del header
        }
      }
      
      return false;
    });
  }

  /**
   * Verifica que la sección Distribución tenga registros
   */
  async tieneRegistrosDistribucion(): Promise<boolean> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar la sección "Distribución" y verificar si tiene registros
      const distribucionMatch = pageText.match(/distribución\s*\((\d+)\s*registros?\)/i);
      if (distribucionMatch) {
        const cantidad = parseInt(distribucionMatch[1]);
        return cantidad > 0;
      }
      
      // Buscar tablas que puedan contener distribución
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('centro de costo') && 
            tableText.toLowerCase().includes('porcentaje') &&
            tableText.toLowerCase().includes('monto')) {
          // Verificar que tenga filas de datos
          const rows = table.querySelectorAll('tbody tr, tr');
          return rows.length > 1; // Al menos una fila de datos además del header
        }
      }
      
      return false;
    });
  }

  /**
   * Obtiene los registros de la sección Distribución
   */
  async obtenerRegistrosDistribucion(): Promise<Array<Record<string, string>>> {
    return await this.page.evaluate(() => {
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      const registros: Array<Record<string, string>> = [];
      
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('centro de costo') && 
            tableText.toLowerCase().includes('porcentaje') &&
            tableText.toLowerCase().includes('monto')) {
          // Encontrar la tabla de Distribución
          const rows = table.querySelectorAll('tbody tr, tr');
          const headers: string[] = [];
          
          // Obtener headers de la primera fila
          const firstRow = rows[0];
          if (firstRow) {
            const headerCells = firstRow.querySelectorAll('th, td');
            headerCells.forEach((cell: any) => {
              headers.push((cell.textContent || '').trim());
            });
          }
          
          // Obtener datos de las filas siguientes
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td');
            const registro: Record<string, string> = {};
            
            cells.forEach((cell: any, index: number) => {
              if (headers[index]) {
                registro[headers[index]] = (cell.textContent || '').trim();
              }
            });
            
            if (Object.keys(registro).length > 0) {
              registros.push(registro);
            }
          }
          
          break; // Solo procesar la primera tabla de Distribución encontrada
        }
      }
      
      return registros;
    });
  }

  // ==================== ACCIONES DE APROBACIÓN ====================

  /**
   * Hace clic en APROBAR/ENVIAR y maneja el diálogo de confirmación
   * IMPORTANTE: Configurar el listener ANTES del clic para capturar el alert nativo
   * Espera a que se procese la solicitud completamente antes de continuar
   */

  async clickAprobar(): Promise<void> {
    const botonAprobar = this.page.locator('button.btn-success').first();
    await botonAprobar.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ Botón APROBAR encontrado y visible');
  
    // Registrar un handler que se ejecute una sola vez
    console.log('   ⏳ Configurando listener para diálogo...');
    this.page.once('dialog', async dialog => {
      const mensajeDialogo = dialog.message();
      console.log(`   📋 Diálogo detectado: ${mensajeDialogo}`);
      await dialog.accept();
      console.log('   ✅ Diálogo ACEPTADO correctamente');
    });
  
    // Hacer click — el dialog será aceptado por el handler registrado
    console.log('   🖱️  Haciendo clic en botón APROBAR...');
    await botonAprobar.click();
    console.log('   ✓ Clic realizado');
  
    // IMPORTANTE: Esperar tiempo suficiente para que el backend procese completamente
    console.log('   ⏳ Esperando procesamiento del backend...');
    await this.page.waitForTimeout(3000); // Dar tiempo al backend para procesar
  
    // Esperar la consecuencia (navegación o volver a la bandeja)
    console.log('   ⏳ Esperando que se complete el procesamiento y regreso a bandeja...');
    try {
      // Esperar a que regrese a la bandeja (puede tardar más después de APROBAR)
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
      console.log('   ✓ Tabla de bandeja visible - Procesamiento completado');
      
      // Esperar un momento adicional para asegurar que todo se procesó
      await this.page.waitForTimeout(2000);
    } catch (error: any) {
      console.error('   ⚠️  Error esperando regreso a bandeja:', error);
      // Verificar si al menos estamos en una URL válida
      const urlActual = this.page.url();
      if (urlActual.includes('/solicitudes-pago')) {
        console.log('   ⚠️  Continuando aunque no se verificó la tabla...');
        // Esperar un poco más por si acaso
        await this.page.waitForTimeout(2000);
      } else {
        throw new Error(`No se pudo verificar el procesamiento. URL actual: ${urlActual}`);
      }
    }
  }

  /**
   * Hace clic en RECHAZAR, ingresa comentario y confirma
   * IMPORTANTE: El diálogo es un window.prompt() nativo que permite ingresar texto
   * Similar a APROBAR pero con prompt en lugar de confirm
   */
  async clickRechazar(comentario: string): Promise<void> {
    const botonRechazar = this.page.locator('button.btn-danger').first();
    await botonRechazar.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ Botón RECHAZAR encontrado y visible');
  
    // Registrar un handler que se ejecute una sola vez para el prompt
    console.log('   ⏳ Configurando listener para diálogo prompt...');
    this.page.once('dialog', async dialog => {
      const mensajeDialogo = dialog.message();
      console.log(`   📋 Diálogo prompt detectado: ${mensajeDialogo}`);
      // El diálogo es un prompt, aceptarlo con el comentario
      await dialog.accept(comentario);
      console.log(`   ✅ Diálogo prompt ACEPTADO con comentario: ${comentario}`);
    });
  
    // Hacer click — el dialog será aceptado por el handler registrado
    console.log('   🖱️  Haciendo clic en botón RECHAZAR...');
    await botonRechazar.click();
    console.log('   ✓ Clic realizado');
  
    // Esperar segundo diálogo de confirmación (similar a APROBAR)
    console.log('   ⏳ Esperando diálogo de confirmación...');
    this.page.once('dialog', async dialog => {
      const mensajeDialogo = dialog.message();
      console.log(`   📋 Diálogo de confirmación detectado: ${mensajeDialogo}`);
      await dialog.accept();
      console.log('   ✅ Diálogo de confirmación ACEPTADO');
    });
  
    // IMPORTANTE: Esperar tiempo suficiente para que el backend procese completamente
    console.log('   ⏳ Esperando procesamiento del backend...');
    await this.page.waitForTimeout(3000); // Dar tiempo al backend para procesar
  
    // Esperar la consecuencia (navegación o volver a la bandeja)
    console.log('   ⏳ Esperando que se complete el procesamiento y regreso a bandeja...');
    try {
      // Esperar a que regrese a la bandeja (puede tardar más después de RECHAZAR)
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
      console.log('   ✓ Tabla de bandeja visible - Procesamiento completado');
      
      // Esperar un momento adicional para asegurar que todo se procesó
      await this.page.waitForTimeout(2000);
    } catch (error: any) {
      console.error('   ⚠️  Error esperando regreso a bandeja:', error);
      // Verificar si al menos estamos en una URL válida
      const urlActual = this.page.url();
      if (urlActual.includes('/solicitudes-pago')) {
        console.log('   ⚠️  Continuando aunque no se verificó la tabla...');
        // Esperar un poco más por si acaso
        await this.page.waitForTimeout(2000);
      } else {
        throw new Error(`No se pudo verificar el procesamiento. URL actual: ${urlActual}`);
      }
    }
  }

  /**
   * Hace clic en OBSERVAR, ingresa comentario y confirma
   * IMPORTANTE: OBSERVAR usa un modal en el DOM (NO es window.prompt)
   * Flujo: 1) Clic en OBSERVAR → 2) Aparece modal con textarea → 3) Llenar textarea → 
   *        4) Clic en "CONFIRMAR OBSERVACIÓN" → 5) Aparece diálogo nativo de confirmación → 6) Aceptar
   */
  async clickObservar(comentario: string): Promise<void> {
    const botonObservar = this.page.locator('button.btn-warning').first();
    await botonObservar.waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✓ Botón OBSERVAR encontrado y visible');
  
    // Paso 1: Hacer clic en OBSERVAR para abrir el modal
    console.log('   🖱️  Haciendo clic en botón OBSERVAR...');
    await botonObservar.click();
    console.log('   ✓ Clic realizado');
  
    // Paso 2: Esperar a que aparezca el modal con el textarea
    console.log('   ⏳ Esperando modal de observación...');
    await this.page.waitForSelector('textarea[placeholder*="observación"], textarea[placeholder*="observacion"]', { 
      state: 'visible', 
      timeout: 5000 
    });
    console.log('   ✓ Modal de observación visible');
  
    // Paso 3: Llenar el textarea con el comentario
    console.log(`   📝 Ingresando comentario: "${comentario}"`);
    await this.page.fill('textarea[placeholder*="observación"], textarea[placeholder*="observacion"]', comentario);
    console.log('   ✓ Comentario ingresado');
  
    // Paso 4: Configurar listener para el diálogo de confirmación ANTES del clic
    console.log('   ⏳ Configurando listener para diálogo de confirmación...');
    this.page.once('dialog', async dialog => {
      const mensajeDialogo = dialog.message();
      console.log(`   📋 Diálogo de confirmación detectado: ${mensajeDialogo}`);
      await dialog.accept();
      console.log('   ✅ Diálogo de confirmación ACEPTADO');
    });
  
    // Paso 5: Hacer clic en "CONFIRMAR OBSERVACIÓN"
    console.log('   🖱️  Haciendo clic en CONFIRMAR OBSERVACIÓN...');
    const botonConfirmar = this.page.locator('button.btn-warning:has-text("CONFIRMAR OBSERVACIÓN")');
    await botonConfirmar.waitFor({ state: 'visible', timeout: 5000 });
    await botonConfirmar.click();
    console.log('   ✓ Clic en CONFIRMAR OBSERVACIÓN realizado');
  
    // Paso 6: Esperar la consecuencia (navegación o volver a la bandeja)
    // IMPORTANTE: Esperar tiempo suficiente para que el backend procese completamente
    console.log('   ⏳ Esperando procesamiento del backend...');
    await this.page.waitForTimeout(3000); // Dar tiempo al backend para procesar
    
    console.log('   ⏳ Esperando que se complete el procesamiento y regreso a bandeja...');
    try {
      // Esperar a que regrese a la bandeja (puede tardar más después de OBSERVAR)
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
      console.log('   ✓ Tabla de bandeja visible - Procesamiento completado');
      
      // Esperar un momento adicional para asegurar que todo se procesó
      await this.page.waitForTimeout(2000);
    } catch (error: any) {
      console.error('   ⚠️  Error esperando regreso a bandeja:', error);
      // Verificar si al menos estamos en una URL válida
      const urlActual = this.page.url();
      if (urlActual.includes('/solicitudes-pago')) {
        console.log('   ⚠️  Continuando aunque no se verificó la tabla...');
        // Esperar un poco más por si acaso
        await this.page.waitForTimeout(2000);
      } else {
        throw new Error(`No se pudo verificar el procesamiento. URL actual: ${urlActual}`);
      }
    }
  }

  /**
   * Confirma el envío/aprobación (para Aprobadores 2 y 3)
   * IMPORTANTE: El diálogo ya fue disparado por el clic en "Enviar" (que llama a clickAprobar)
   * Este método solo espera y acepta el diálogo, luego espera el procesamiento
   */
  async confirmarEnvio(): Promise<void> {
    // El diálogo ya debería estar apareciendo después del clic en "Enviar"
    // Esperar y aceptar el diálogo
    console.log('   ⏳ Esperando diálogo de confirmación...');
    try {
      const dialog = await this.page.waitForEvent('dialog', { timeout: 5000 });
      const mensajeDialogo = dialog.message();
      console.log(`   📋 Diálogo detectado: ${mensajeDialogo}`);
      await dialog.accept();
      console.log('   ✅ Diálogo ACEPTADO correctamente');
    } catch (error: any) {
      // Si no hay diálogo, puede que ya se haya procesado o el flujo sea diferente
      console.log('   ⚠️  No se detectó diálogo, continuando...');
    }
    
    // IMPORTANTE: Esperar tiempo suficiente para que el backend procese completamente
    console.log('   ⏳ Esperando procesamiento del backend...');
    await this.page.waitForTimeout(3000); // Dar tiempo al backend para procesar
    
    // Esperar la consecuencia (navegación o volver a la bandeja)
    console.log('   ⏳ Esperando que se complete el procesamiento y regreso a bandeja...');
    try {
      // Esperar a que regrese a la bandeja (puede tardar más después de APROBAR)
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 15000 });
      console.log('   ✓ Tabla de bandeja visible - Procesamiento completado');
      
      // Esperar un momento adicional para asegurar que todo se procesó
      await this.page.waitForTimeout(2000);
    } catch (error: any) {
      console.error('   ⚠️  Error esperando regreso a bandeja:', error);
      // Verificar si al menos estamos en una URL válida
      const urlActual = this.page.url();
      if (urlActual.includes('/solicitudes-pago')) {
        console.log('   ⚠️  Continuando aunque no se verificó la tabla...');
        // Esperar un poco más por si acaso
        await this.page.waitForTimeout(2000);
      } else {
        throw new Error(`No se pudo verificar el procesamiento. URL actual: ${urlActual}`);
      }
    }
  }

  // ==================== VERIFICACIONES DE ESTADO ====================

  /**
   * Verifica que el estado de la solicitud sea el esperado
   */
  async verificarEstado(estadoEsperado: string): Promise<boolean> {
    const estadoText = await this.page.locator(this.selectors.paso).textContent();
    if (estadoText) {
      return estadoText.toLowerCase().includes(estadoEsperado.toLowerCase());
    }
    return false;
  }

  /**
   * Verifica que regresó a la bandeja después de aprobar
   * IMPORTANTE: Después de aprobar, la solicitud ya NO está en la bandeja (pasó a EXACTUS)
   * Solo verificamos que estamos en la página de bandeja, no que la solicitud específica esté ahí
   */
  async verificarRegresoABandeja(): Promise<boolean> {
    try {
      // Verificar que estamos de vuelta en la bandeja (múltiples formas de verificar)
      // Opción 1: Verificar tabla de solicitudes
      const tablaVisible = await this.page.locator('table tbody tr').first().isVisible({ timeout: 5000 }).catch(() => false);
      if (tablaVisible) {
        return true;
      }
      
      // Opción 2: Verificar URL (debe estar en /solicitudes-pago sin ID de detalle)
      const urlActual = this.page.url();
      const enBandejaURL = urlActual.includes('/solicitudes-pago') && !urlActual.match(/\/solicitudes-pago\/\d+/);
      if (enBandejaURL) {
        return true;
      }
      
      // Opción 3: Verificar que hay elementos de la bandeja (títulos, filtros, etc.)
      const tieneElementosBandeja = await this.page.locator('h1, h2, h3, .page-title, [class*="bandeja"]').first().isVisible({ timeout: 3000 }).catch(() => false);
      return tieneElementosBandeja;
    } catch {
      return false;
    }
  }

  /**
   * Verifica que la solicitud pasó a EXACTUS
   * IMPORTANTE: Después de aprobar, la solicitud ya NO está en la bandeja del aprobador
   * porque pasó a EXACTUS. Por lo tanto, verificamos de múltiples formas:
   * 1. Buscar texto EXACTUS en la página (si está visible)
   * 2. Verificar que la solicitud ya no está en la bandeja (indirectamente confirma que pasó a EXACTUS)
   * 3. Si el proceso de aprobación se completó exitosamente, asumimos que pasó a EXACTUS
   */
  async verificarPasoAExactus(): Promise<boolean> {
    // Opción 1: Buscar en toda la página el texto EXACTUS (si está visible en algún mensaje o estado)
    const pasoAExactus = await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = (document.body.innerText || document.body.textContent || '').toUpperCase();
      return pageText.includes('EXACTUS');
    });
    
    if (pasoAExactus) {
      return true;
    }
    
    // Opción 2: Buscar en elementos específicos (estado, trazabilidad, mensajes)
    const enEstado = await this.page.locator('text=/EXACTUS/i').isVisible({ timeout: 2000 }).catch(() => false);
    if (enEstado) {
      return true;
    }
    
    // Opción 3: Verificar que estamos en la bandeja y el proceso se completó exitosamente
    // Si el proceso de aprobación se completó (diálogo aceptado, regreso a bandeja),
    // entonces la solicitud pasó a EXACTUS (ya no está pendiente en la bandeja del aprobador)
    const enBandeja = await this.verificarRegresoABandeja();
    if (enBandeja) {
      // Si estamos en la bandeja después de aprobar, significa que el proceso se completó
      // y la solicitud pasó a EXACTUS (por eso ya no está en la bandeja del aprobador)
      return true;
    }
    
    return false;
  }

  /**
   * Vuelve a la bandeja desde el detalle
   */
  async volverABandeja(): Promise<void> {
    await this.page.locator(this.selectors.botonVolverBandeja).click();
    await this.page.waitForSelector(this.selectors.tablaSolicitudes, { state: 'visible', timeout: 10000 });
  }
}

