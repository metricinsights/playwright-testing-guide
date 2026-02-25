import { test, expect } from '@playwright/test';
import { createCategory, deleteCategory } from './category';
import { createMetric, enableMetric, collectMetric, updateMetric, deleteMetric, validateMetricData } from './metric';
import { createDimension, deleteDimension } from '../advanced/dimension';
import { createDimensionValue } from '../advanced/dimension-value';
import { initializeTestUsers, cleanupUsers } from '../users/user';

let categoryId: number | undefined; // Variable to store categoryId
let metricId: number | undefined; // Variable to store metricId
let dimensionId: number | undefined; // Variable to store dimensionId
let dimensionValueId: number | undefined; // Variable to store dimensionValueId
let dimensionMetricId: number | undefined; // Variable to store metricId
const busAndTechnicalOwner: string = 'admin'; // Initialize with a default value
let users: { id: string; username: string; token: string; type: 'administrator' | 'power' | 'regular' }[] = [];
let adminTokenDefault: string;
let adminToken: string;

//npm run test:dev stg70 metric.spec.ts

// Initialize tokens before running tests
test.beforeAll(async () => {
  const userSetup = await initializeTestUsers();

  adminTokenDefault = userSetup.adminTokenDefault;
  adminToken = userSetup.adminToken;
  users = userSetup.users;
});

// Describe block for the suite
test.describe.serial('Metric', () => {
  test('Create Category', async () => {
    // Step 1: Create a new Category
    const responseCreateCategory = await createCategory(adminToken);

    // Check if response status is 201 and data contains the category
    expect(responseCreateCategory.status).toBe(201);

    // Ensure that response data contains the 'category' object and extract the ID
    if (responseCreateCategory.data.category.id != null) {
      categoryId = responseCreateCategory.data.category.id;
      console.log(`Category ID: ${categoryId}`);
    } else {
      console.error('Category creation failed: ID is undefined.');
    }
  });

  test('Create Metric', async () => {
    // Check if categoryId is defined before proceeding
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure the category was created successfully.');
    }

    // Step 1: Create a new Metric
    const responseCreateMetric = await createMetric(adminToken, categoryId, busAndTechnicalOwner);

    // Check if response status is 201 and data contains the metric
    expect(responseCreateMetric.status).toBe(201);

    // Ensure that response data contains the 'metric' object and extract the ID
    if (responseCreateMetric.data && responseCreateMetric.data.metric.id != null) {
      metricId = responseCreateMetric.data.metric.id;
      console.log(`Metric ID: ${metricId}`);
    } else {
      console.error('Metric creation failed: ID is undefined.');
    }
  });

  test('Enable the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Enable the Metric
    const responseEnableMetric = await enableMetric(adminToken, metricId);

    expect(responseEnableMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been enabled.`);
  });

  test('Validate the created metric data', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Enable the Metric
    const responseEnableMetric = await validateMetricData(adminToken, metricId);

    expect(responseEnableMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been validated.`);
  });

  test('Collect the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Collect the Metric
    const responseCollectMetric = await collectMetric(adminToken, metricId);

    expect(responseCollectMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been collected.`);
  });

  test('Update the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Update the Metric
    const responseUpdateMetric = await updateMetric(adminToken, metricId);

    expect(responseUpdateMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been updated.`);
  });

  test('Create Dimension', async () => {
    // Step 1: Create a new Dimension
    const responseCreateDimension = await createDimension(adminToken);

    // Check if response status is 201 and data contains the metric
    expect(responseCreateDimension.status).toBe(201);

    // Ensure that response data contains the 'metric' object and extract the ID
    if (responseCreateDimension.data && responseCreateDimension.data.dimension.id != null) {
      dimensionId = responseCreateDimension.data.dimension.id;
      console.log(`Dimension ID: ${dimensionId}`);
    } else {
      console.error('Dimension creation failed: ID is undefined.');
    }
  });

  test('Create Dimension Value', async () => {
    // Check if dimensionId is defined before proceeding
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefind.');
    }

    // Step 1: Create a new Dimension Value
    const responseCreateDimensionValue = await createDimensionValue(adminToken, dimensionId);

    // Check if response status is 201 and data contains the metric
    expect(responseCreateDimensionValue.status).toBe(201);

    // Ensure that response data contains the 'metric' object and extract the ID
    if (responseCreateDimensionValue.data && responseCreateDimensionValue.data.dimension_value.id != null) {
      dimensionValueId = responseCreateDimensionValue.data.dimension_value.id;
      console.log(`Dimension Value ID: ${dimensionValueId}`);
    } else {
      console.error('Dimension value creation failed: ID is undefined.');
    }
  });

  test('Create Dim Metric', async () => {
    // Check if categoryId is defined before proceeding
    if (categoryId === undefined || dimensionId === undefined) {
      throw new Error(
        'categoryId or dimensionId is undefined. Ensure the category and dimension were created successfully.',
      );
    }

    // Step 1: Create a new Metric
    const responseCreateMetric = await createMetric(adminToken, categoryId, busAndTechnicalOwner, dimensionId);

    // Check if response status is 201 and data contains the metric
    expect(responseCreateMetric.status).toBe(201);

    // Ensure that response data contains the 'metric' object and extract the ID
    if (responseCreateMetric.data && responseCreateMetric.data.metric.id != null) {
      dimensionMetricId = responseCreateMetric.data.metric.id;
      console.log(`Metric ID: ${dimensionMetricId}`);
    } else {
      console.error('Metric creation failed: ID is undefined.');
    }
  });

  test('Delete metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('MetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete metric
    const responseDeleteMetric = await deleteMetric(adminToken, metricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted}.`);
  });

  test('Delete Dim metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('dimensionMetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete metric
    const responseDeleteMetric = await deleteMetric(adminToken, dimensionMetricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been deleted}.`);
  });

  test('Delete Category', async () => {
    // Check if Category is defined before proceeding
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure category was created successfully.');
    }

    // Delete category
    const responseDeleteCategory = await deleteCategory(adminToken, categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted}.`);
  });

  test('Delete Dimension', async () => {
    // Check if Dimension is defined before proceeding
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure Dimension was created successfully.');
    }

    // Delete Dimension
    const responseDeleteDimension = await deleteDimension(adminToken, dimensionId);

    expect(responseDeleteDimension.status).toBe(200);
    console.log(`Dimension with ID ${dimensionId} has been deleted}.`);
  });

  test.afterAll(async () => {
    try {
      if (metricId !== undefined) await deleteMetric(adminToken, metricId as number);
    } catch (error) {
      console.log('Failed to delete metric in afterAll (might be already deleted)');
    }

    try {
      if (dimensionMetricId !== undefined) await deleteMetric(adminToken, dimensionMetricId as number);
    } catch (error) {
      console.log('Failed to delete dimension metric in afterAll (might be already deleted)');
    }

    try {
      if (categoryId !== undefined) await deleteCategory(adminToken, categoryId as number);
    } catch (error) {
      console.log('Failed to delete category in afterAll (might be already deleted)');
    }

    try {
      if (dimensionId !== undefined) await deleteDimension(adminToken, dimensionId as number);
    } catch (error) {
      console.log('Failed to delete dimension in afterAll (might be already deleted)');
    }

    // Clean up users
    await cleanupUsers(adminTokenDefault, users);
  });
});
