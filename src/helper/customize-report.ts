import * as fs from 'fs';
import * as path from 'path';

/**
 * Customiza el diseño del reporte HTML generado
 * Inyecta estilos CSS personalizados de forma segura
 */

const CUSTOM_CSS = `
<style>
  /* ===== COLORES PERSONALIZADOS PAYNOVA ===== */
  
  /* Header principal */
  .navbar-brand {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    padding: 15px 25px !important;
    border-radius: 8px !important;
  }
  
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    padding: 30px !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3) !important;
  }
  
  /* Badges de estado */
  .badge-success, .label-success {
    background-color: #10b981 !important;
    color: white !important;
  }
  
  .badge-danger, .label-danger {
    background-color: #ef4444 !important;
    color: white !important;
  }
  
  .badge-warning, .label-warning {
    background-color: #f59e0b !important;
    color: white !important;
  }
  
  /* Gráficos */
  .chart-container {
    background: white !important;
    padding: 20px !important;
    border-radius: 10px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    margin-bottom: 20px !important;
  }
  
  /* Tablas */
  .table-hover tbody tr:hover {
    background-color: #f3f4f6 !important;
  }
  
  .table thead th {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    font-weight: 600 !important;
  }
  
  /* Cards de features */
  .panel-default {
    border-radius: 8px !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    margin-bottom: 20px !important;
    border: none !important;
  }
  
  .panel-heading {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 8px 8px 0 0 !important;
    font-weight: 600 !important;
  }
  
  /* Botones */
  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 8px 20px !important;
    transition: all 0.3s ease !important;
  }
  
  .btn-primary:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
  }
  
  /* Screenshots */
  .screenshot {
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    margin: 10px 0 !important;
  }
  
  /* Footer personalizado */
  .footer-custom {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    text-align: center !important;
    padding: 20px !important;
    margin-top: 40px !important;
    border-radius: 8px !important;
  }
  
  /* Animaciones */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .panel-default {
    animation: fadeIn 0.5s ease-out !important;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .page-header {
      padding: 20px 10px !important;
    }
    
    .chart-container {
      padding: 10px !important;
    }
  }
</style>
`;

/**
 * Inyecta CSS personalizado en todos los archivos HTML del reporte
 */
export function customizeReportDesign() {
  const reportsDir = path.join(process.cwd(), 'test-results', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.log('⚠️  Carpeta de reportes no encontrada');
    return;
  }
  
  // Buscar todos los archivos HTML
  const htmlFiles = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.html'));
  
  if (htmlFiles.length === 0) {
    console.log('⚠️  No se encontraron archivos HTML para personalizar');
    return;
  }
  
  console.log(`\n🎨 Personalizando ${htmlFiles.length} archivo(s) HTML...`);
  
  htmlFiles.forEach(file => {
    const filePath = path.join(reportsDir, file);
    let htmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene los estilos personalizados
    if (htmlContent.includes('COLORES PERSONALIZADOS PAYNOVA')) {
      console.log(`   ⏭️  ${file} ya está personalizado`);
      return;
    }
    
    // Inyectar CSS antes del cierre de </head>
    if (htmlContent.includes('</head>')) {
      htmlContent = htmlContent.replace('</head>', `${CUSTOM_CSS}\n</head>`);
      fs.writeFileSync(filePath, htmlContent, 'utf8');
      console.log(`   ✅ ${file} personalizado`);
    } else {
      console.log(`   ⚠️  No se pudo personalizar ${file} (no tiene </head>)`);
    }
  });
  
  console.log('🎉 Diseño personalizado aplicado exitosamente!\n');
}

