const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../e2e',
  testMatch: '**/lampac-resume-spike.e2e.js',
  timeout: 90_000,
  expect: {
    timeout: 30_000,
  },
  retries: 0,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: '../playwright-report-resume' }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
