module.exports = {
  default: {
    tags: process.env.npm_config_tags || '',
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: [
      'src/features/**/*.feature'
    ],
    dryRun: false,
    require: [
      'src/step-definitions/**/*.ts',
      'src/hooks/**/*.ts'
    ],
    requireModule: [
      'ts-node/register'
    ],
    format: [
      'progress-bar',
      'json:./test-results/json/cucumber-report.json'
    ],
    parallel: 1
  }
};

