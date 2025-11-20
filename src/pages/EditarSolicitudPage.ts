/**
 * Page Object para la funcionalidad de Editar Solicitudes Observadas
 * Maneja el flujo completo de edición de solicitudes en estado OBSERVADO
 */

import { Page } from '@playwright/test';

export class EditarSolicitudPage {
  constructor(private page: Page) {}

  // ==================== SELECTORES ====================

  private selectors = {
    // Navegación
    menuSolicitudPagos: 'button:has-text("Solicitud de Pagos")',
    linkBandeja: 'a[href="/solicitudes-pago"].submenu-item',
    
    // Bandeja
    tablaSolicitudes: 'table tbody tr',
    botonVerDetalle: 'button:has-text("👁️"), button[title*="Ver"], button[title*="Detalle"]',
    
    // Detalle de Solicitud
    pasoActual: 'text=/Paso Actual:/i',
    
    // Edición
    botonEditarSolicitud: 'button:has-text("EDITAR SOLICITUD"), button:has-text("✏️ EDITAR SOLICITUD")',
    botonActualizar: 'button:has-text("ACTUALIZAR")',
    botonEnviar: 'button:has-text("ENVIAR")',
  };

  // ==================== NAVEGACIÓN ====================

  /**
   * Navega a la bandeja de solicitudes de pago
   */
  async navegarABandeja(): Promise<void> {
    // Verificar si ya estamos en la bandeja
    const currentUrl = this.page.url();
    if (currentUrl.includes('/solicitudes-pago') && !currentUrl.includes('/registrar')) {
      // Ya estamos en la bandeja, solo esperar a que cargue la tabla
      await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
      return;
    }
    
    // 1. Expandir menú Solicitud de Pagos
    const menuButton = this.page.locator('button:has-text("Solicitud de Pagos")');
    await menuButton.waitFor({ state: 'visible', timeout: 3000 });
    await menuButton.click();
    
    // 2. Esperar a que aparezca el submenu
    await this.page.waitForSelector('a[href="/solicitudes-pago"].submenu-item', { state: 'attached', timeout: 2000 });
    
    // 3. Hacer clic en el enlace "Bandeja"
    const linkBandeja = this.page.locator('a[href="/solicitudes-pago"].submenu-item');
    await linkBandeja.click({ force: true });
    
    // 4. Esperar a que cargue la tabla de solicitudes
    await this.page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });
  }

  // ==================== BÚSQUEDA Y SELECCIÓN ====================

  /**
   * Busca una solicitud con "Paso Actual" igual a "OBSERVADO" en la bandeja
   * y hace clic en el botón del ojo para ver el detalle
   */
  async buscarSolicitudObservadaYClicOjo(): Promise<void> {
    console.log('   🔍 Buscando solicitud con Paso Actual = OBSERVADO...');
    
    const encontrada = await this.page.evaluate(() => {
      // @ts-ignore
      const rows = Array.from(document.querySelectorAll('tbody tr')) as any[];
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td')) as any[];
        // Buscar la columna "Paso Actual" que debería contener "OBSERVADO"
        for (const cell of cells) {
          const cellText = (cell.textContent || '').trim();
          if (cellText === 'OBSERVADO') {
            // Encontrar el botón del ojo en esta fila
            const buttons = row.querySelectorAll('button') as any[];
            for (const btn of buttons) {
              const text = btn.textContent || '';
              const title = btn.getAttribute('title') || '';
              // Buscar botón del ojo (puede tener emoji 👁️ o texto relacionado)
              if (text.includes('👁️') || title.toLowerCase().includes('ver') || title.toLowerCase().includes('detalle')) {
                btn.click();
                return true;
              }
            }
          }
        }
      }
      return false;
    });

    if (!encontrada) {
      throw new Error('No se encontró ninguna solicitud con Paso Actual = OBSERVADO en la bandeja');
    }

    console.log('   ✓ Solicitud OBSERVADO encontrada y clic en botón del ojo realizado');
    
    // Esperar a que navegue al detalle
    await this.page.waitForSelector('text=/Detalle de Solicitud/i', { state: 'visible', timeout: 10000 });
    
    // IMPORTANTE: Esperar a que termine de cargar completamente el detalle
    // Esperar a que desaparezca el mensaje "Cargando detalle de solicitud..."
    try {
      await this.page.waitForSelector('text=/Cargando detalle de solicitud/i', { 
        state: 'hidden', 
        timeout: 15000 
      });
      console.log('   ✓ Mensaje de carga desapareció');
    } catch (error) {
      // Si no aparece el mensaje de carga, continuar
      console.log('   ⚠️  No se detectó mensaje de carga (puede que ya esté cargado)');
    }
    
    // Esperar a que aparezca la información general (campos como Correlativo, Incidente, etc.)
    // Esto confirma que el detalle está completamente cargado
    try {
      await this.page.waitForSelector('text=/Correlativo|Incidente|Paso Actual/i', { 
        state: 'visible', 
        timeout: 10000 
      });
      console.log('   ✓ Información General cargada');
    } catch (error) {
      // Si no encuentra esos campos específicos, esperar un poco más
      await this.page.waitForTimeout(2000);
      console.log('   ⚠️  Esperando carga adicional...');
    }
    
    // Esperar un momento adicional para asegurar que todo está cargado
    await this.page.waitForTimeout(1000);
  }

  // ==================== VERIFICACIONES ====================

  /**
   * Verifica que el campo "Paso Actual" sea "OBSERVADO"
   * IMPORTANTE: En la bandeja se llama "Paso Actual", pero en el detalle se llama "Estado"
   * Busca de múltiples formas para ser más robusto
   */
  async verificarPasoActualObservado(): Promise<boolean> {
    console.log('   🔍 Verificando que Paso Actual sea OBSERVADO...');
    
    // IMPORTANTE: Esperar a que la página termine de cargar completamente
    // Esperar a que desaparezca el mensaje "Cargando detalle de solicitud..."
    try {
      await this.page.waitForSelector('text=/Cargando detalle de solicitud/i', { 
        state: 'hidden', 
        timeout: 15000 
      });
      console.log('   ✓ Mensaje de carga desapareció');
    } catch (error) {
      // Si no aparece el mensaje de carga, puede que ya esté cargado
      console.log('   ⚠️  No se detectó mensaje de carga');
    }
    
    // Esperar a que aparezcan los campos de información general
    try {
      await this.page.waitForSelector('text=/Correlativo|Incidente|Estado|Paso Actual/i', { 
        state: 'visible', 
        timeout: 10000 
      });
      // Esperar un momento adicional para asegurar que los valores están renderizados
      await this.page.waitForTimeout(1000);
    } catch (error) {
      console.log('   ⚠️  Esperando carga de campos...');
      await this.page.waitForTimeout(2000);
    }
    
    // Método 1: Buscar "Estado: Observado" (en el detalle se llama "Estado", no "Paso Actual")
    try {
      const estadoSelector = this.page.locator('text=/Estado:/i');
      const estadoVisible = await estadoSelector.isVisible({ timeout: 3000 }).catch(() => false);
      if (estadoVisible) {
        // Buscar el texto completo que contiene "Estado: Observado"
        const estadoText = await this.page.evaluate(() => {
          // @ts-ignore
          const elements = Array.from(document.querySelectorAll('*')) as any[];
          for (const el of elements) {
            const text = el.textContent || '';
            if (text.toLowerCase().includes('estado') && text.toLowerCase().includes('observado')) {
              return text;
            }
          }
          return '';
        });
        
        if (estadoText && estadoText.toLowerCase().includes('observado')) {
          console.log(`   ✓ Estado es "Observado" (OBSERVADO)`);
          return true;
        }
      }
    } catch (error) {
      // Continuar con otros métodos
    }
    
    // Método 2: Usar el selector específico "Paso Actual" si está disponible (en la bandeja)
    try {
      const pasoSelector = this.page.locator(this.selectors.pasoActual);
      const pasoVisible = await pasoSelector.isVisible({ timeout: 3000 }).catch(() => false);
      if (pasoVisible) {
        const pasoText = await pasoSelector.textContent();
        if (pasoText && pasoText.toLowerCase().includes('observado')) {
          console.log(`   ✓ Paso Actual es "${pasoText.trim()}" (OBSERVADO)`);
          return true;
        }
      }
    } catch (error) {
      // Continuar con otros métodos
    }
    
    // Método 2: Buscar en toda la página usando JavaScript (más robusto)
    // IMPORTANTE: En el detalle se llama "Estado: Observado", en la bandeja "Paso Actual: OBSERVADO"
    const pasoActual = await this.page.evaluate(() => {
      // @ts-ignore
      const pageText = document.body.innerText || document.body.textContent || '';
      
      // Buscar patrón "Estado: Observado" (en el detalle)
      const estadoPatterns = [
        /estado[:]\s*([^\n\r]+)/i,
        /estado\s+([^\n\r]+)/i
      ];
      
      for (const pattern of estadoPatterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          const valor = match[1].trim();
          if (valor.toLowerCase().includes('observado')) {
            return valor;
          }
        }
      }
      
      // Buscar patrón "Paso Actual: OBSERVADO" o "Paso Actual OBSERVADO" (en la bandeja)
      const patterns = [
        /paso\s+actual[:]\s*([^\n\r]+)/i,
        /paso\s+actual\s+([^\n\r]+)/i,
        /paso[:]\s*([^\n\r]+)/i,
        /paso\s*actual[:\s]*([^\n\r]+)/i
      ];
      
      for (const pattern of patterns) {
        const match = pageText.match(pattern);
        if (match && match[1]) {
          const valor = match[1].trim();
          if (valor.toLowerCase().includes('observado')) {
            return valor;
          }
        }
      }
      
      // Buscar también en elementos específicos (labels, spans, divs, tds, dt, dd)
      // @ts-ignore
      const allElements = Array.from(document.querySelectorAll('*')) as any[];
      
      // Buscar elementos que contengan "Estado" (en el detalle) o "Paso Actual" (en la bandeja)
      for (const el of allElements) {
        const text = (el.textContent || '').trim();
        const textLower = text.toLowerCase();
        
        // Buscar si el elemento contiene "estado" y "observado" (en el detalle)
        if (textLower.includes('estado') && textLower.includes('observado')) {
          const match = text.match(/estado[:]\s*([^\n\r]+)/i);
          if (match && match[1]) {
            const valor = match[1].trim();
            if (valor.toLowerCase().includes('observado')) {
              return valor;
            }
          }
        }
        
        // Buscar si el elemento contiene "paso actual"
        if (textLower.includes('paso') && textLower.includes('actual')) {
          // Buscar el valor después de "Paso Actual:"
          const match = text.match(/paso\s+actual[:]\s*([^\n\r]+)/i);
          if (match && match[1]) {
            const valor = match[1].trim();
            if (valor.toLowerCase().includes('observado')) {
              return valor;
            }
          }
          
          // Si el texto completo contiene "observado", extraerlo
          if (textLower.includes('observado')) {
            const observadoMatch = text.match(/observado/i);
            if (observadoMatch) {
              return 'OBSERVADO';
            }
          }
          
          // Buscar en el siguiente elemento hermano
          let sibling = el.nextElementSibling;
          while (sibling) {
            const siblingText = (sibling.textContent || '').trim().toLowerCase();
            if (siblingText.includes('observado')) {
              return siblingText.toUpperCase();
            }
            sibling = sibling.nextElementSibling;
          }
          
          // Buscar en el elemento padre y sus hijos
          const parent = el.parentElement;
          if (parent) {
            const parentText = parent.textContent || '';
            const parentMatch = parentText.match(/paso\s+actual[:]\s*([^\n\r]+)/i);
            if (parentMatch && parentMatch[1]) {
              const valor = parentMatch[1].trim();
              if (valor.toLowerCase().includes('observado')) {
                return valor;
              }
            }
            
            // Buscar en todos los hijos del padre
            // @ts-ignore
            const children = Array.from(parent.querySelectorAll('*')) as any[];
            for (const child of children) {
              const childText = (child.textContent || '').trim().toLowerCase();
              if (childText === 'observado' || childText.includes('observado')) {
                return 'OBSERVADO';
              }
            }
          }
        }
      }
      
      // Buscar directamente el texto "OBSERVADO" cerca de elementos que mencionen "paso"
      // @ts-ignore
      const pasoElements = Array.from(document.querySelectorAll('*')) as any[];
      for (const el of pasoElements) {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('paso') && text.includes('observado')) {
          // Extraer "OBSERVADO" del texto
          const observadoMatch = text.match(/observado/i);
          if (observadoMatch) {
            return 'OBSERVADO';
          }
        }
      }
      
      return '';
    });
    
    const esObservado = pasoActual.toLowerCase().includes('observado');
    
    if (esObservado) {
      console.log(`   ✓ Paso Actual es "${pasoActual}" (OBSERVADO)`);
    } else {
      console.log(`   ✗ Paso Actual es "${pasoActual || '(vacío)'}" (esperado: OBSERVADO)`);
      
      // Debug exhaustivo: buscar todas las menciones de "paso" y "observado" en la página
      const debugInfo = await this.page.evaluate(() => {
        // @ts-ignore
        const pageText = document.body.innerText || document.body.textContent || '';
        
        // Buscar todas las menciones de "paso"
        const pasoMatches: string[] = [];
        const pasoRegex = /paso[^\n\r]{0,50}/gi;
        let match;
        while ((match = pasoRegex.exec(pageText)) !== null) {
          pasoMatches.push(match[0].trim());
        }
        
        // Buscar todas las menciones de "observado"
        const observadoMatches: string[] = [];
        const observadoRegex = /observado[^\n\r]{0,30}/gi;
        while ((match = observadoRegex.exec(pageText)) !== null) {
          observadoMatches.push(match[0].trim());
        }
        
        // Buscar en elementos específicos que puedan contener el estado
        // @ts-ignore
        const estadoElements = Array.from(document.querySelectorAll('*')) as any[];
        const elementosConEstado: string[] = [];
        for (const el of estadoElements) {
          const text = (el.textContent || '').trim();
          if ((text.toLowerCase().includes('paso') || text.toLowerCase().includes('estado') || 
               text.toLowerCase().includes('observado')) && text.length < 100) {
            elementosConEstado.push(text);
          }
        }
        
        return {
          preview: pageText.substring(0, 1000),
          pasoMatches: pasoMatches.slice(0, 10),
          observadoMatches: observadoMatches.slice(0, 10),
          elementosConEstado: elementosConEstado.slice(0, 20)
        };
      });
      
      console.log(`   🔍 Debug - Menciones de "paso": ${debugInfo.pasoMatches.join(' | ')}`);
      console.log(`   🔍 Debug - Menciones de "observado": ${debugInfo.observadoMatches.join(' | ')}`);
      console.log(`   🔍 Debug - Elementos con estado: ${debugInfo.elementosConEstado.slice(0, 5).join(' | ')}`);
      console.log(`   🔍 Preview del texto de la página: ${debugInfo.preview.substring(0, 300)}...`);
    }
    
    return esObservado;
  }

  // ==================== ACCIONES DE EDICIÓN ====================

  /**
   * Hace clic en el botón "EDITAR SOLICITUD"
   */
  async clicEditarSolicitud(): Promise<void> {
    console.log('   🖱️  Haciendo clic en botón EDITAR SOLICITUD...');
    
    const botonEditar = this.page.locator(this.selectors.botonEditarSolicitud);
    await botonEditar.waitFor({ state: 'visible', timeout: 10000 });
    await botonEditar.click();
    
    console.log('   ✓ Clic en EDITAR SOLICITUD realizado');
    
    // Esperar a que navegue a la página de edición
    await this.page.waitForSelector('text=/Editar Solicitud de Pago/i', { state: 'visible', timeout: 10000 });
    
    // IMPORTANTE: Esperar a que la data se cargue completamente
    // Esperar a que aparezcan los campos del formulario con valores
    await this.page.waitForSelector('input[type="number"][placeholder="0.00"]', { state: 'visible', timeout: 15000 });
    
    // Esperar adicional para asegurar que todos los datos están cargados
    await this.page.waitForTimeout(3000);
    
    console.log('   ✓ Formulario de edición cargado completamente');
  }

  /**
   * Modifica el monto en el formulario de edición
   */
  async modificarMonto(nuevoMonto: string): Promise<void> {
    console.log(`   ✏️  Modificando monto a ${nuevoMonto}...`);
    
    // Esperar a que el formulario esté completamente cargado
    await this.page.waitForSelector('input[type="number"][placeholder="0.00"]', { 
      state: 'visible', 
      timeout: 10000 
    });
    
    // Método 1: Buscar directamente el input de tipo number con placeholder "0.00"
    try {
      const montoInput = this.page.locator('input[type="number"][placeholder="0.00"]');
      await montoInput.waitFor({ state: 'visible', timeout: 5000 });
      await montoInput.clear();
      await montoInput.fill(nuevoMonto);
      await montoInput.press('Tab'); // Disparar eventos de cambio
      console.log(`   ✓ Monto modificado a ${nuevoMonto} (método directo)`);
      await this.page.waitForTimeout(500);
      return;
    } catch (error) {
      console.log('   ⚠️  Método directo falló, intentando método alternativo...');
    }
    
    // Método 2: Buscar usando JavaScript (más robusto)
    const modificado = await this.page.evaluate((monto: string) => {
      // @ts-ignore
      const inputs = Array.from(document.querySelectorAll('input[type="number"], input[type="text"]')) as any[];
      
      // Buscar primero el input con placeholder "0.00"
      for (const input of inputs) {
        const placeholder = input.getAttribute('placeholder') || '';
        if (placeholder.includes('0.00') || placeholder.includes('0,00')) {
          input.value = monto;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
      }
      
      // Buscar el input que está cerca del label "Monto"
      for (const input of inputs) {
        const parent = input.closest('div, form, section');
        const parentText = (parent?.textContent || '').toLowerCase();
        if (parentText.includes('monto') && parentText.includes('tipo de pago')) {
          input.value = monto;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
      }
      
      // Buscar por valor numérico existente (el monto actual)
      for (const input of inputs) {
        const value = input.value || '';
        // Buscar valores numéricos que puedan ser montos
        if (value.match(/^\d+\.?\d*$/) && parseFloat(value) > 0) {
          input.value = monto;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          return true;
        }
      }
      
      return false;
    }, nuevoMonto);

    if (!modificado) {
      // Debug: mostrar todos los inputs disponibles
      const debugInfo = await this.page.evaluate(() => {
        // @ts-ignore
        const inputs = Array.from(document.querySelectorAll('input')) as any[];
        return inputs.map((input: any) => ({
          type: input.type,
          placeholder: input.getAttribute('placeholder') || '',
          value: input.value || '',
          name: input.name || '',
          id: input.id || '',
          nearText: (input.closest('div')?.textContent || '').substring(0, 100)
        }));
      });
      
      console.log(`   🔍 Debug - Inputs disponibles:`, JSON.stringify(debugInfo.slice(0, 10), null, 2));
      throw new Error('No se pudo encontrar el campo de Monto para modificar');
    }

    console.log(`   ✓ Monto modificado a ${nuevoMonto}`);
    
    // IMPORTANTE: Esperar tiempo suficiente para que la aplicación procese el cambio
    // y potencialmente actualice la grilla automáticamente
    await this.page.waitForTimeout(4000);
    
    // Disparar evento adicional para asegurar que se procesó
    await this.page.evaluate(() => {
      // @ts-ignore
      const input = document.querySelector('input[type="number"][placeholder="0.00"]') as any;
      if (input) {
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    await this.page.waitForTimeout(3000); // Esperar adicional para procesamiento
  }

  /**
   * Verifica que el monto se actualiza en la grilla de datos guardados
   * IMPORTANTE: La grilla puede tardar en actualizarse después de modificar el monto
   */
  async verificarMontoEnGrilla(montoEsperado: string): Promise<boolean> {
    console.log(`   🔍 Verificando que el monto ${montoEsperado} se actualiza en la grilla...`);
    
    // IMPORTANTE: Esperar tiempo suficiente para que la grilla se actualice
    // La grilla puede tardar en actualizarse después de modificar el monto
    await this.page.waitForTimeout(3000);
    
    // Intentar varias veces con esperas incrementales
    for (let intento = 0; intento < 5; intento++) {
      const montoEnGrilla = await this.page.evaluate((monto: string) => {
        // @ts-ignore
        const tables = Array.from(document.querySelectorAll('table')) as any[];
        for (const table of tables) {
          const tableText = table.textContent || '';
          // Buscar la tabla de "Datos Guardados"
          if (tableText.toLowerCase().includes('datos guardados') || 
              (tableText.toLowerCase().includes('monto') && tableText.toLowerCase().includes('guardados'))) {
            // Buscar el monto en las celdas de la tabla
            const cells = table.querySelectorAll('td') as any[];
            for (const cell of cells) {
              const cellText = (cell.textContent || '').trim();
              // Comparar sin formato (puede tener espacios, comas, puntos decimales, etc.)
              const cellMonto = cellText.replace(/[^\d]/g, '');
              const montoEsperadoLimpio = monto.replace(/[^\d]/g, '');
              if (cellMonto === montoEsperadoLimpio) {
                return true;
              }
            }
            
            // También buscar en el texto completo de la tabla (puede estar en el total)
            const tableTextClean = tableText.replace(/[^\d]/g, '');
            if (tableTextClean.includes(monto.replace(/[^\d]/g, ''))) {
              return true;
            }
          }
        }
        return false;
      }, montoEsperado);

      if (montoEnGrilla) {
        console.log(`   ✓ Monto ${montoEsperado} encontrado en la grilla`);
        return true;
      }
      
      // Si no se encontró, esperar un poco más antes del siguiente intento
      if (intento < 4) {
        console.log(`   ⏳ Esperando actualización de grilla (intento ${intento + 1}/5)...`);
        await this.page.waitForTimeout(3000);
      }
    }

    // Si no se encontró después de los intentos, mostrar debug
    const debugInfo = await this.page.evaluate(() => {
      // @ts-ignore
      const tables = Array.from(document.querySelectorAll('table')) as any[];
      const info: any[] = [];
      for (const table of tables) {
        const tableText = table.textContent || '';
        if (tableText.toLowerCase().includes('datos guardados') || 
            tableText.toLowerCase().includes('monto')) {
          const cells = table.querySelectorAll('td') as any[];
          const valores = Array.from(cells).slice(0, 10).map((cell: any) => (cell.textContent || '').trim());
          info.push({
            texto: tableText.substring(0, 200),
            valores: valores
          });
        }
      }
      return info;
    });
    
    console.log(`   ✗ Monto ${montoEsperado} NO encontrado en la grilla después de 3 intentos`);
    console.log(`   🔍 Debug - Contenido de tablas:`, JSON.stringify(debugInfo, null, 2));
    return false;
  }

  /**
   * Hace clic en el botón "ACTUALIZAR"
   */
  async clicActualizar(): Promise<void> {
    console.log('   🖱️  Haciendo clic en botón ACTUALIZAR...');
    
    const botonActualizar = this.page.locator(this.selectors.botonActualizar);
    await botonActualizar.waitFor({ state: 'visible', timeout: 10000 });
    await botonActualizar.click();
    
    console.log('   ✓ Clic en ACTUALIZAR realizado');
    
    // IMPORTANTE: Esperar tiempo suficiente para que se procese la actualización
    // y la grilla se sincronice (como vimos en MCP: "grilla sincronizada")
    await this.page.waitForTimeout(3000);
    
    // Esperar a que aparezca el mensaje de éxito si existe
    try {
      await this.page.waitForSelector('text=/actualizado exitosamente|sincronizada/i', { 
        state: 'visible', 
        timeout: 5000 
      });
      console.log('   ✓ Actualización confirmada');
    } catch (error) {
      // Si no aparece el mensaje, continuar de todas formas
      console.log('   ⚠️  No se detectó mensaje de confirmación, continuando...');
    }
  }

  /**
   * Hace clic en el botón "ENVIAR"
   */
  async clicEnviar(): Promise<void> {
    console.log('   🖱️  Haciendo clic en botón ENVIAR...');
    
    const botonEnviar = this.page.locator(this.selectors.botonEnviar);
    await botonEnviar.waitFor({ state: 'visible', timeout: 10000 });
    await botonEnviar.click();
    
    console.log('   ✓ Clic en ENVIAR realizado');
    
    // Esperar a que se procese el envío (puede navegar o mostrar mensaje)
    await this.page.waitForTimeout(3000);
  }
}

