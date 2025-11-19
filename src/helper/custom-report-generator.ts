import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Generador de Reporte HTML Personalizado
 * Crea un reporte profesional directamente desde el JSON de Cucumber
 */

interface CucumberStep {
  keyword: string;
  name: string;
  result: {
    status: string;
    duration: number;
  };
}

interface CucumberScenario {
  name: string;
  keyword: string;
  steps: CucumberStep[];
  tags?: Array<{ name: string }>;
}

interface CucumberFeature {
  name: string;
  description: string;
  elements: CucumberScenario[];
  uri: string;
}

export const generateCustomReport = (): void => {
  const jsonPath = path.join(process.cwd(), 'test-results', 'reports', 'cucumber-report.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  No se encontró cucumber-report.json');
    return;
  }

  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const features: CucumberFeature[] = JSON.parse(jsonContent);

  let totalScenarios = 0;
  let passedScenarios = 0;
  let failedScenarios = 0;
  let totalSteps = 0;
  let passedSteps = 0;
  let failedSteps = 0;
  let totalDuration = 0;

  // Calcular estadísticas
  features.forEach(feature => {
    feature.elements.forEach(scenario => {
      if (scenario.keyword === 'Escenario' || scenario.keyword === 'Scenario') {
        totalScenarios++;
        const scenarioPassed = scenario.steps.every(step => !step.result || step.result.status === 'passed');
        if (scenarioPassed) passedScenarios++;
        else failedScenarios++;

        scenario.steps.forEach(step => {
          if (step.result && !step.keyword.includes('Before') && !step.keyword.includes('After')) {
            totalSteps++;
            if (step.result.status === 'passed') passedSteps++;
            else failedSteps++;
            totalDuration += step.result.duration || 0;
          }
        });
      }
    });
  });

  const passRate = totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(1) : '0';
  const durationInSeconds = (totalDuration / 1000000000).toFixed(2);

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paynova Automation Report</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --success-color: #10b981;
            --danger-color: #ef4444;
            --warning-color: #f59e0b;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
        }
        
        .header-gradient {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            color: white;
            padding: 3rem 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .stat-card {
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            border: none;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }
        
        .feature-card {
            border-radius: 1rem;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            border: none;
        }
        
        .scenario-item {
            border-left: 4px solid var(--success-color);
            padding: 1rem;
            margin: 0.5rem 0;
            background: #f8f9fa;
            border-radius: 0.5rem;
        }
        
        .scenario-item.failed {
            border-left-color: var(--danger-color);
        }
        
        .step-item {
            padding: 0.5rem 1rem;
            margin: 0.25rem 0;
            border-radius: 0.375rem;
            background: white;
        }
        
        .step-passed { border-left: 3px solid var(--success-color); }
        .step-failed { border-left: 3px solid var(--danger-color); background-color: #fee; }
        
        .badge-custom {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
        }
        
        .progress-circle {
            width: 120px;
            height: 120px;
        }
        
        .dark-mode-toggle {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 1000;
        }
        
        @media print {
            .dark-mode-toggle { display: none; }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header-gradient">
        <div class="container">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1 class="mb-0"><i class="fas fa-robot me-3"></i>Paynova Automation Report</h1>
                    <p class="mb-0 mt-2 opacity-75">Test Automation Results - ${new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div class="text-end">
                    <div class="badge bg-white text-dark fs-5 px-4 py-2">
                        <i class="fas fa-check-circle text-success me-2"></i>${passRate}% Aprobado
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="container my-5">
        <div class="row g-4">
            <div class="col-md-3">
                <div class="card stat-card bg-white">
                    <div class="card-body text-center">
                        <i class="fas fa-file-alt fa-3x text-primary mb-3"></i>
                        <h3 class="mb-0">${features.length}</h3>
                        <p class="text-muted mb-0">Features</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card bg-white">
                    <div class="card-body text-center">
                        <i class="fas fa-list fa-3x text-info mb-3"></i>
                        <h3 class="mb-0">${totalScenarios}</h3>
                        <p class="text-muted mb-0">Escenarios</p>
                        <small class="text-success">${passedScenarios} pasados</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card bg-white">
                    <div class="card-body text-center">
                        <i class="fas fa-tasks fa-3x text-warning mb-3"></i>
                        <h3 class="mb-0">${totalSteps}</h3>
                        <p class="text-muted mb-0">Steps</p>
                        <small class="text-success">${passedSteps} pasados</small>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card stat-card bg-white">
                    <div class="card-body text-center">
                        <i class="fas fa-clock fa-3x text-secondary mb-3"></i>
                        <h3 class="mb-0">${durationInSeconds}s</h3>
                        <p class="text-muted mb-0">Duración</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Features & Scenarios -->
    <div class="container mb-5">
        <h2 class="mb-4"><i class="fas fa-clipboard-list me-2"></i>Resultados por Feature</h2>
        ${features.map(feature => {
          const featureScenarios = feature.elements.filter(el => el.keyword === 'Escenario' || el.keyword === 'Scenario');
          const featurePassed = featureScenarios.every(scenario => 
            scenario.steps.every(step => !step.result || step.result.status === 'passed')
          );
          
          return `
          <div class="card feature-card">
              <div class="card-header bg-white py-3">
                  <div class="d-flex justify-content-between align-items-center">
                      <h4 class="mb-0">
                          <i class="fas fa-${featurePassed ? 'check-circle text-success' : 'times-circle text-danger'} me-2"></i>
                          ${feature.name}
                      </h4>
                      <span class="badge ${featurePassed ? 'bg-success' : 'bg-danger'} badge-custom">
                          ${featureScenarios.length} escenario${featureScenarios.length !== 1 ? 's' : ''}
                      </span>
                  </div>
                  ${feature.description ? `<p class="text-muted mb-0 mt-2">${feature.description.trim()}</p>` : ''}
              </div>
              <div class="card-body">
                  ${featureScenarios.map(scenario => {
                    const scenarioPassed = scenario.steps.every(step => !step.result || step.result.status === 'passed');
                    const visibleSteps = scenario.steps.filter(step => 
                      step.result && !step.keyword.includes('Before') && !step.keyword.includes('After')
                    );
                    
                    return `
                    <div class="scenario-item ${!scenarioPassed ? 'failed' : ''}">
                        <h5>
                            <i class="fas fa-${scenarioPassed ? 'check-circle text-success' : 'times-circle text-danger'} me-2"></i>
                            ${scenario.name}
                        </h5>
                        ${visibleSteps.length > 0 ? `
                          <div class="mt-2">
                              ${visibleSteps.map(step => `
                                <div class="step-item step-${step.result.status}">
                                    <small>
                                        <i class="fas fa-${step.result.status === 'passed' ? 'check' : 'times'} me-2"></i>
                                        <strong>${step.keyword}</strong> ${step.name}
                                        <span class="text-muted float-end">${(step.result.duration / 1000000).toFixed(0)}ms</span>
                                    </small>
                                </div>
                              `).join('')}
                          </div>
                        ` : ''}
                    </div>
                    `;
                  }).join('')}
              </div>
          </div>
          `;
        }).join('')}
    </div>

    <!-- Footer -->
    <footer class="header-gradient py-4 mt-5">
        <div class="container text-center">
            <p class="mb-0"><strong>Paynova Automation - Interseguro © 2025</strong></p>
            <p class="mb-0 mt-2 opacity-75">
                <i class="fas fa-server me-2"></i>${os.hostname()} | 
                <i class="fas fa-user me-2 ms-3"></i>${os.userInfo().username} | 
                <i class="fas fa-laptop me-2 ms-3"></i>${process.env.BROWSER || 'chromium'}
            </p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

  const outputPath = path.join(process.cwd(), 'test-results', 'reports', 'index.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log('\n✅ Reporte profesional generado exitosamente!');
  console.log('📁 Ubicación: test-results/reports/index.html');
  console.log(`📊 Resumen: ${passedScenarios}/${totalScenarios} escenarios pasados (${passRate}%)`);
  console.log(`⏱️  Duración total: ${durationInSeconds}s\n`);
};

