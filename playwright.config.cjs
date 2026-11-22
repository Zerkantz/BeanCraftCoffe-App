const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  outputDir: 'tmp/playwright',
  use: {
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'node scripts/serve-web.cjs',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI
  }
});
