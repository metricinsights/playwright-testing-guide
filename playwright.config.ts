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
  
  /* Shared settings for all the projects below */
  use: {
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Base URL - can be overridden via BASE_URL environment variable */
    baseURL: process.env.BASE_URL,
    
    /* API testing options */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },

  /* Configure projects for different scenarios */
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});

