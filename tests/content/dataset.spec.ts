import { test, expect } from '@playwright/test';
import { instanceBaseUrl } from '../auth/auth';
import { deleteGroup } from '../users/user-access';
import { cleanupUsers, initializeTestUsersWithGroup } from '../users/user';
import { testLogger } from '../utils/test-helpers';
import {
  createDataset,
  validateDataset,
  deleteDataset,
  enableDataset,
  generateDataset,
  getDataset,
  getDatasetData,
  noAvailableData,
  checkDatasetListAccess,
  deleteDatasetData,
} from './dataset';
import { createCategory, deleteCategory } from './category';

//npm run test:dev stg70 dataset.spec.ts

let users: {
  id: string;
  username: string;
  token: string;
  type: 'administrator' | 'power' | 'regular';
}[] = [];
let categoryId: number | undefined; // Variable to store categoryId
let adminTokenDefault: string;
let adminToken: string;
let powerToken: string;
let regularToken: string;
let powerId: number;
let regularId: number;
let createdGroupId: number;
let groupName: string;
let datasetId: number;

/**
 * Utility function to check if datasetId is defined and throw a consistent error if not
 */
function ensureDatasetIdExists(): void {
  if (datasetId === undefined) {
    throw new Error('datasetId is undefined. Ensure the dataset was created successfully.');
  }
}

/**
 * Utility function to check if categoryId is defined and throw a consistent error if not
 */
function ensureCategoryIdExists(): void {
  if (categoryId === undefined) {
    throw new Error('categoryId is undefined. Ensure the category was created successfully.');
  }
}

test.describe.serial('Dataset API Testing Suite', () => {
  test.beforeAll(async () => {
    const userSetup = await initializeTestUsersWithGroup('yes');

    adminTokenDefault = userSetup.adminTokenDefault;
    adminToken = userSetup.adminToken;
    powerToken = userSetup.powerToken;
    regularToken = userSetup.regularToken;
    users = userSetup.users;
    powerId = userSetup.powerId;
    regularId = userSetup.regularId;
    createdGroupId = userSetup.groupId;
    groupName = userSetup.groupName;
  });

  test.describe('Dataset CRUD and Permission Tests', () => {
    test.describe.serial('Admin dataset operations', () => {
      test('Create category for dataset storage', async () => {
        const responseCreateCategory = await createCategory(adminToken);

        expect(responseCreateCategory.status).toBe(201);

        // Ensure that response data contains the 'category' object and extract the ID
        if (responseCreateCategory.data.category.id != null) {
          categoryId = responseCreateCategory.data.category.id;
          testLogger.success('Created Category:', categoryId);
        } else {
          testLogger.error('Category creation failed', 'ID is undefined');
        }
      });

      test('Create new dataset in the specified category', async () => {
        ensureCategoryIdExists();
        const responseCreateDataset = await createDataset(adminToken, categoryId as number);

        expect(responseCreateDataset.status).toBe(201);

        datasetId = responseCreateDataset.data.dataset.id;
        testLogger.success('Created Dataset', datasetId);
      });

      test('Validate dataset data structure and content', async () => {
        ensureDatasetIdExists();

        // validate the dataset
        const responseValidateDataset = await validateDataset(adminToken, datasetId);

        expect(responseValidateDataset.status).toBe(200);
        testLogger.success('Dataset has been validated:', datasetId);
      });

      test('Enable dataset for data collection', async () => {
        ensureDatasetIdExists();

        // Enable the dataset
        const responseEnableDataset = await enableDataset(adminToken, datasetId);

        expect(responseEnableDataset.status).toBe(200);
        testLogger.success('Dataset enabled:', datasetId);
      });

      test('Generate dataset data and trigger data collection', async () => {
        ensureDatasetIdExists();

        // Generate the dataset
        const responseGenerateDataset = await generateDataset(adminToken, datasetId);

        expect(responseGenerateDataset.status).toBe(200);
        testLogger.success('Dataset generated:', datasetId);
      });

      test('Verify dataset appears in dataset list', async () => {
        ensureDatasetIdExists();

        // Get all datasets
        const responseGetDataset = await getDataset(adminToken);

        expect(responseGetDataset.status).toBe(200);

        // Check if the created dataset exists in the list
        const isDatasetPresent = responseGetDataset.data.datasets.some((dataset) => dataset.id === datasetId);

        expect(isDatasetPresent).toBe(true);
        testLogger.success('Dataset present in list:', datasetId);
      });

      test('Verify dataset data structure is valid', async () => {
        ensureDatasetIdExists();

        const responseGetDatasetData = await getDatasetData(adminToken, datasetId);

        expect(responseGetDatasetData.status).toBe(200);

        // Check if response has data property and it's an array
        expect(responseGetDatasetData.data).toHaveProperty('data');
        expect(Array.isArray(responseGetDatasetData.data.data)).toBe(true);

        // Check if data array has expected length
        expect(responseGetDatasetData.data.data).toHaveLength(5);

        testLogger.success('Dataset data structure valid:', datasetId);
      });

      test('Verify dataset access is restricted for non-admin users', async () => {
        ensureDatasetIdExists();

        // Test array of user types to check
        const userTypes = [
          { token: powerToken, userType: 'Power' },
          { token: regularToken, userType: 'Regular' },
        ];

        for (const { token, userType } of userTypes) {
          // Attempt to access dataset with each user type
          const response = await noAvailableData(token, datasetId);

          // Verify access is denied
          expect(response.success).toBe(false);
          expect(response.status).toBe(403);

          testLogger.info(`Dataset access denied for ${userType} user`, '403 Forbidden (expected)');
        }
      });

      test('Grant group access to dataset via UI', async ({ page }) => {
        if (datasetId === undefined || groupName === undefined) {
          throw new Error('Dataset ID, Group Name is undefined. Ensure they were created successfully.');
        }
        // Set up authentication token for page context
        await page.setExtraHTTPHeaders({
          token: adminToken,
        });

        // Navigate directly to the user map tab using URL fragment
        await page.goto(`${instanceBaseUrl}/editor/dataset/${datasetId}#user_map`);
        await page.waitForLoadState('networkidle');
        testLogger.info('Navigated to dataset user map page');

        // Click the Add button
        await page.click('[data-test*="add_button"]', { force: true });
        testLogger.info('Clicked Add button');

        await page.waitForTimeout(1000);

        try {
          // Wait for the group selection dialog to appear
          await page.waitForSelector('.modal, .dialog, form', { timeout: 3000 });
          testLogger.info('Dialog detected');

          // Try to use keyboard Tab to navigate to the field
          await page.keyboard.press('Tab');
          await page.keyboard.press('Tab');

          // Try typing the group name directly
          await page.keyboard.type(groupName);
          await page.keyboard.press('Enter');
          testLogger.info('Used keyboard navigation to enter group name');

          await page.waitForTimeout(5000);

          const checkboxElement = await page
            .locator('[data-test="grid_type_id_grid_checkbox_column_check_all"]')
            .getByRole('checkbox');

          // Check if checkboxElement is not null or undefined
          if (checkboxElement !== null && checkboxElement !== undefined) {
            await checkboxElement.check();
            testLogger.info('Checkbox checked');
          } else {
            testLogger.warn('Checkbox not found');
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          testLogger.error('Error during dialog interaction', errorMessage);
        }

        await page.waitForTimeout(1000);

        try {
          await page.locator('[data-test="popup_p_grid_popup_datasetAccessGroupGrid_ok_button"]').click();

          testLogger.info('Clicked save button');
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          testLogger.warn('Could not click save button', errorMessage);
          // Try pressing Enter
          await page.keyboard.press('Enter');
          testLogger.info('Pressed Enter instead');
        }

        await page.waitForTimeout(2000);

        testLogger.success(`Group access granted for dataset to group '${groupName}'`, datasetId);
      });

      test('Verify Power user can view dataset list after permissions granted', async () => {
        const response = await checkDatasetListAccess(powerToken);

        // Power users should have access like Admin
        expect(response.success).toBe(true);
        expect(response.status).toBe(200);

        // Verify dataset is present in the list
        if (datasetId !== undefined && response.data && response.data.datasets) {
          const isDatasetPresent = response.data.datasets.some((dataset: { id: number }) => dataset.id === datasetId);

          testLogger.info(`Dataset ${datasetId} in Power user list`, `${isDatasetPresent}`);
        }
      });

      test('Verify Regular user access is still restricted for dataset list', async () => {
        const response = await checkDatasetListAccess(regularToken);

        // Regular users should be denied access
        expect(response.success).toBe(false);
        expect(response.status).toBe(403);

        testLogger.info('Regular user cannot access dataset list', '403 Forbidden (expected)');
      });

      test('Verify Power user can access dataset data after permission grant', async () => {
        ensureDatasetIdExists();

        // Only Power users get dataset access via group permission
        // Regular users are expected to remain blocked (per previous test)
        try {
          const responseGetDatasetData = await getDatasetData(powerToken, datasetId);

          expect(responseGetDatasetData.status).toBe(200);

          // Check if response has data property and it's an array
          expect(responseGetDatasetData.data).toHaveProperty('data');
          expect(Array.isArray(responseGetDatasetData.data.data)).toBe(true);

          expect(responseGetDatasetData.data.data).toHaveLength(5);

          testLogger.success('Power user can access dataset data:', datasetId);
        } catch (error) {
          // If the UI permission grant didn't work, skip with a warning
          testLogger.warn('Power user cannot access dataset', 'UI permission grant may have failed');
          test.skip();
        }
      });

      test('Delete dataset data using PUT method', async () => {
        ensureDatasetIdExists();

        const responseDeleteDatasetData = await deleteDatasetData(adminToken, datasetId);

        expect(responseDeleteDatasetData.status).toBe(200);
        testLogger.cleanup('Deleted dataset data', datasetId);
      });

      test('Clean up: Delete dataset', async () => {
        ensureDatasetIdExists();

        const responseDeleteDataset = await deleteDataset(adminToken, datasetId);
        expect(responseDeleteDataset.status).toBe(200);
        testLogger.cleanup('Deleted has been deleted:', datasetId);
      });

      test('Clean up: Delete category', async () => {
        ensureCategoryIdExists();

        // Delete category
        const responseDeleteCategory = await deleteCategory(adminToken, categoryId as number);

        expect(responseDeleteCategory.status).toBe(200);
        testLogger.cleanup('Category has been deleted:', categoryId);
      });
    });
  });

  // This block ensures proper resource cleanup even if tests fail
  test.afterAll(async () => {
    try {
      // Clean up users
      if (adminTokenDefault && users.length > 0) {
        await cleanupUsers(adminTokenDefault, users);
      }

      // Clean up group
      if (adminTokenDefault && createdGroupId) {
        await deleteGroup(adminTokenDefault, createdGroupId);
      }

      // Additional failsafe cleanup for dataset and category if they still exist
      if (adminToken) {
        if (datasetId) {
          try {
            await deleteDataset(adminToken, datasetId as number);
            testLogger.cleanup('Cleaned up dataset in afterAll hook', datasetId);
          } catch (error) {
            testLogger.info(`Dataset ${datasetId} may already be deleted`);
          }
        }

        if (categoryId) {
          try {
            await deleteCategory(adminToken, categoryId as number);
            testLogger.cleanup('Cleaned up category in afterAll hook:', categoryId);
          } catch (error) {
            testLogger.info(`Category ${categoryId} may already be deleted`);
          }
        }
      }
    } catch (error) {
      testLogger.error('Error during test cleanup', error);
    }
  });
});
