/**
 * Generador de Reportes Profesionales con multiple-cucumber-html-reporter
 */

const report = require('multiple-cucumber-html-reporter');
import * as os from 'os';

report.generate({
    jsonDir: './test-results/json',
    reportPath: './test-results/reports/',
    reportName: 'Paynova Automation Report',
    pageTitle: 'Paynova - Test Automation Report',
    displayDuration: true,
    displayReportTime: true,
    
    metadata: {
        browser: {
            name: process.env.BROWSER || 'chromium',
            version: '121'
        },
        device: os.hostname(),
        platform: {
            name: os.platform(),
            version: os.release()
        }
    },
    
    customData: {
        title: 'Información del Proyecto',
        data: [
            { label: 'Proyecto', value: 'Paynova - Interseguro' },
            { label: 'Versión', value: '1.0.0' },
            { label: 'Ciclo', value: 'Regression' },
            { label: 'Entorno', value: process.env.ENV?.toUpperCase() || 'UAT' },
            { label: 'Ejecutado por', value: os.userInfo().username },
            { label: 'Fecha', value: new Date().toLocaleString('es-PE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
        ]
    },
    
    pageFooter: '<div style="text-align: center; margin-top: 20px; padding: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"><p><strong>Paynova Automation - Interseguro © 2025</strong></p></div>'
});

console.log('\n✅ Reporte profesional generado exitosamente!');
console.log('📁 Ubicación: test-results/reports/index.html');
console.log('🌐 Abre el reporte en tu navegador para ver los resultados detallados\n');

