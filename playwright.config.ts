import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Metric Insights API Tests
 * 
 * This configuration is optimized for API testing with sensible defaults.
 * Customize as needed for your environment.
 */

export default defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run */
  timeout: 60000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], 
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  /* Expect timeout */
  expect: {
    timeout: 15000,
  },

  /* Shared settings for all the projects below */
  use: {
    /* Run browser in headless mode */
    headless: true,

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Record video for test runs */
    video: 'on-first-retry',

    /* Enable browser snapshots for debugging */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

