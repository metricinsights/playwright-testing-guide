import { test, expect } from '@playwright/test';
import { createCategory, deleteCategory } from '../content/category';
import { createMetric, enableMetric, collectMetric, updateMetric, deleteMetric } from '../content/metric';
import { accessToMetric, accessToDimension, createGroup, deleteGroup } from './user-access';
import { createDimension, deleteDimension } from '../advanced/dimension';
import { createDimensionValue } from '../advanced/dimension-value';
import { ADMIN, getTokens, powerId, regularId } from '../utils/auth';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let categoryId: number | undefined; // Variable to store categoryId
let metricId: number | undefined; // Variable to store metricId
let dimensionId: number | undefined; // Variable to store dimensionId
let dimensionValueId: number | undefined; // Variable to store dimensionValueId
let dimensionMetricId: number | undefined; // Variable to store metricId
const busAndTechnicalOwner = 'admin'; // Initialize with a default value
let groupName: string;
let groupId: number;

//npm run test:dev stg70 user-access.spec.ts

// Initialize tokens before running tests
test.beforeAll(async () => {
  tokens = await getTokens();
});

// Describe block for the suite
test.describe.serial('Provide needed access', () => {
  test('Create Category', async () => {
    // Step 1: Create a new Category
    const responseCreateCategory = await createCategory(tokens[ADMIN]);

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
    const responseCreateMetric = await createMetric(tokens[ADMIN], categoryId, busAndTechnicalOwner);

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
    const responseEnableMetric = await enableMetric(tokens[ADMIN], metricId);

    expect(responseEnableMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been enabled.`);
  });

  test('Collect the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Collect the Metric
    const responseCollectMetric = await collectMetric(tokens[ADMIN], metricId);

    expect(responseCollectMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been collected.`);
  });

  test('Update the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Update the Metric
    const responseUpdateMetric = await updateMetric(tokens[ADMIN], metricId);

    expect(responseUpdateMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been updated.`);
  });

  test('Create Dimension', async () => {
    // Step 1: Create a new Dimension
    const responseCreateDimension = await createDimension(tokens[ADMIN]);

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
    const responseCreateDimensionValue = await createDimensionValue(tokens[ADMIN], dimensionId);

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
    const responseCreateMetric = await createMetric(tokens[ADMIN], categoryId, busAndTechnicalOwner, dimensionId);

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

  test('Give Power user access to metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetric = await accessToMetric(tokens[ADMIN], metricId);

    // Check if the status is 200 instead of 201 since the actual response status is 201
    expect(responseAccessToMetric.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetric.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Give Power user access to Dimension', async () => {
    if (dimensionId === undefined || powerId === undefined) {
      throw new Error('dimensionId or powerId is undefined.');
    }

    console.log('dimensionId:', dimensionId); // Log dimensionId
    console.log('powerId:', powerId); // Log powerId

    const responseAccessToDimensionForPower = await accessToDimension(tokens[ADMIN], dimensionId);

    expect(responseAccessToDimensionForPower.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForPower.data);
    console.log('Response Body:', responseBodyText); // Log the response body text

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test('Give Power user access to Dim metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined || powerId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    const responseAccessToDimMetricForPower = await accessToMetric(tokens[ADMIN], dimensionMetricId, powerId);

    // Check if the status is 200 instead of 201 since the actual response status is 201
    expect(responseAccessToDimMetricForPower.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToDimMetricForPower.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Give Regular user access to metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || regularId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetric = await accessToMetric(tokens[ADMIN], metricId, regularId);

    // Check if the status is 200 instead of 201 since the actual response status is 201
    expect(responseAccessToMetric.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetric.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test.skip('Give Regular user access to Dimension', async () => {
    if (dimensionId === undefined || regularId === undefined) {
      throw new Error('dimensionId or powerId is undefined.');
    }

    console.log('dimensionId:', dimensionId); // Log dimensionId
    console.log('regularId:', regularId); // Log powerId

    const responseAccessToDimensionForPower = await accessToDimension(tokens[ADMIN], dimensionId, regularId);

    expect(responseAccessToDimensionForPower.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForPower.data);
    console.log('Response Body:', responseBodyText); // Log the response body text

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test('Give Regular user access to Dim metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined || regularId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    const responseAccessToDimMetricForRegular = await accessToMetric(tokens[ADMIN], dimensionMetricId, regularId);

    // Check if the status is 200 instead of 201 since the actual response status is 201
    expect(responseAccessToDimMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToDimMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Create group', async () => {
    const response = await createGroup(tokens[ADMIN]);

    groupId = response.data.user_group.id;

    groupName = response.data.user_group.name;

    expect(groupId).toBeDefined();
    expect(groupName).toBeDefined();
    expect(response.status).toBe(201);

    console.log(groupId, groupName);
  });

  test('Delete group', async () => {
    const response = await deleteGroup(tokens[ADMIN], groupId);

    expect(response.status).toBe(200);
  });

  test('Delete metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('MetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete regular metric
    const responseDeleteMetric = await deleteMetric(tokens[ADMIN], metricId);
    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted}.`);
  });

  test('Delete Dim metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('dimensionMetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete metric
    const responseDeleteMetric = await deleteMetric(tokens[ADMIN], dimensionMetricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been deleted.`);
  });

  test('Delete Category', async () => {
    // Check if Category is defined before proceeding
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure category was created successfully.');
    }

    // Delete category
    const responseDeleteCategory = await deleteCategory(tokens[ADMIN], categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted}.`);
  });

  test('Delete Dimension', async () => {
    // Check if Dimension is defined before proceeding
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure Dimension was created successfully.');
    }

    // Delete Dimension
    const responseDeleteDimension = await deleteDimension(tokens[ADMIN], dimensionId);

    expect(responseDeleteDimension.status).toBe(200);
    console.log(`Dimension with ID ${dimensionId} has been deleted}.`);
  });

  test.afterAll(async () => {
    try {
      if (dimensionMetricId !== undefined) await deleteMetric(tokens[ADMIN], dimensionMetricId as number);
    } catch (error) {
      console.log('Failed to delete dimension metric in afterAll (might be already deleted)');
    }

    try {
      if (groupId !== undefined) await deleteGroup(tokens[ADMIN], groupId);
    } catch (error) {
      console.log('Failed to delete group in afterAll (might be already deleted)');
    }

    try {
      if (metricId !== undefined) await deleteMetric(tokens[ADMIN], metricId as number);
    } catch (error) {
      console.log('Failed to delete metric in afterAll (might be already deleted)');
    }

    try {
      if (categoryId !== undefined) await deleteCategory(tokens[ADMIN], categoryId as number);
    } catch (error) {
      console.log('Failed to delete category in afterAll (might be already deleted)');
    }

    try {
      if (dimensionId !== undefined) await deleteDimension(tokens[ADMIN], dimensionId as number);
    } catch (error) {
      console.log('Failed to delete dimension in afterAll (might be already deleted)');
    }
  });
});
