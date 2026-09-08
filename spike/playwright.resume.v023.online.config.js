const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '../e2e',
  testMatch: ['**/lampac-resume-live-real.e2e.js'],
  timeout: 210_000,
  expect: { timeout: 30_000 },
  retries: 0,
  reporter: [
    ['line'],
    ['html', { open: 'never', outputFolder: '../playwright-report-resume-v023-online' }],
  ],
  use: {
    storageState: {
      cookies: [],
      origins: [{
        origin: 'https://arst113.github.io',
        localStorage: [
          { name: 'language', value: 'ru' },
          { name: 'tmdb_lang', value: 'ru' },
        ],
      }],
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
