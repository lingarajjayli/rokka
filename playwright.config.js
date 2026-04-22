import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Browser-based test execution with UI
  uiMode: 'manual',
  
  // Projects to run
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        // Browser-based test configuration
        actionTimeout: 15 * 1000, // Longer timeout for browser interaction
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: 'http://localhost:5173',
        actionTimeout: 15 * 1000,
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        baseURL: 'http://localhost:5173',
        actionTimeout: 15 * 1000,
      },
    },
  ],

  // Test directory
  testDir: './tests',

  // Run your local dev server before executing tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },

  // Maximum time each action can take
  timeout: 30 * 1000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Use inline snapshots for UI components
  snapshotSuffix: '-chromium',

  // Opt into which files should be reported as code coverage
  reporter: [['html', { outputFolder: 'playwright-report' }]],

  // Shared settings for all projects
  use: {
    trace: 'on-first-retry',
  },
});
