import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60000,
  expect: { timeout: 20000 },
  outputDir: 'artifacts/e2e/results',
  reporter: [['list'], ['html', { outputFolder: 'artifacts/e2e/report', open: 'never' }], ['junit', { outputFile: 'artifacts/e2e/junit.xml' }]],
  use: { baseURL: 'http://localhost:18081', trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure' },
  projects: [{ name: 'chromium-mobile', use: { ...devices['Pixel 7'], browserName: 'chromium' } }],
  webServer: {
    command: 'node node_modules/expo/bin/cli start --web --port 18081',
    url: 'http://localhost:18081',
    reuseExistingServer: false,
    timeout: 180000,
    env: { CI: '1', EXPO_NO_DOTENV: '1', EXPO_PUBLIC_API_URL: 'http://127.0.0.1:18080', EXPO_PUBLIC_KEYCLOAK_URL: 'http://localhost:18180', EXPO_PUBLIC_KEYCLOAK_REALM: 'ecommerce', EXPO_PUBLIC_KEYCLOAK_CLIENT_ID: 'mobile-app' },
  },
});
