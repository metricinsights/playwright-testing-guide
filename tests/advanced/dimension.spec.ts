import { test, expect } from '@playwright/test';
// import Ajv from 'ajv';
import Ajv from 'ajv';
const ajv = new Ajv();

import {
  createDimension,
  deleteDimension,
  dimensionValueSchema,
  getDimValueById,
  getDimValueList,
  getDimValueForSchema,
  getDimValueByDimensionId,
  getDimValueByIdNoPermission,
} from './dimension';
import { createDimensionValue } from './dimension-value';
import { ADMIN, POWER, REGULAR, getTokens } from '../utils/auth';
import { createCategory, deleteCategory } from './category';
import { createMetric, enableMetric, collectMetric, updateMetric, deleteMetric } from './metric';
import { accessToMetric, accessToDimension } from './user-access';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let dimensionId: number | undefined; // Variable to store dimensionId
let dimensionValueId: number | undefined; // Variable to store dimensionValueId
let powerID: number | undefined; // Variable to store powerID
let regularID: number | undefined; // Variable to store regularID
let categoryId: number | undefined; // Variable to store categoryId
let metricId: number | undefined; // Variable to store metricId
let dimensionMetricId: number | undefined; // Variable to store metricId
const busAndTechnicalOwner = 'admin'; // Initialize with a default value

//npm run test:dev stg70 dimension.spec.ts

// Initialize tokens before running tests
test.beforeAll(async () => {
  tokens = await getTokens();
  powerID = Number(process.env.POWER_ID); // Ensure powerID is loaded and converted to a number
  regularID = Number(process.env.REGULAR_ID); // Ensure regularID is loaded and converted to a number
});

test.describe.serial('Dimension', () => {
  test('Create Category', async () => {
    const responseCreateCategory = await createCategory(tokens[ADMIN]);

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
    const responseCreateDimension = await createDimension(tokens[ADMIN]);

    expect(responseCreateDimension.status).toBe(201);

    // Ensure that response data contains the 'dimension' object and extract the ID
    if (responseCreateDimension.data && responseCreateDimension.data.dimension.id != null) {
      dimensionId = responseCreateDimension.data.dimension.id;
      console.log(`Dimension ID: ${dimensionId}`);
    } else {
      console.error('Dimension creation failed: ID is undefined.');
    }
  });

  test('Create Dimension Value', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefind.');
    }

    const responseCreateDimensionValue = await createDimensionValue(tokens[ADMIN], dimensionId);

    expect(responseCreateDimensionValue.status).toBe(201);

    // Ensure that response data contains the 'dimension_value' object and extract the ID
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

  test('Enable the created Dim metric', async () => {
    // Check if Dim metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('Dim metricId is undefined. Ensure the metric was created successfully.');
    }

    // Enable the Metric
    const responseEnableMetric = await enableMetric(tokens[ADMIN], dimensionMetricId);

    expect(responseEnableMetric.status).toBe(200);
    console.log(`Dim Metric with ID ${dimensionMetricId} has been enabled.`);
  });

  test('Collect Dim the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Collect the Metric
    const responseCollectMetric = await collectMetric(tokens[ADMIN], dimensionMetricId);

    expect(responseCollectMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been collected.`);
  });

  test('Update Dim the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Update the Metric
    const responseUpdateMetric = await updateMetric(tokens[ADMIN], dimensionMetricId);

    expect(responseUpdateMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been updated.`);
  });

  test('Validate response schema', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueForSchema = await getDimValueForSchema(tokens[ADMIN], dimensionValueId);

    const validate = ajv.compile(dimensionValueSchema);

    const isValid = validate(responseGetDimValueForSchema);

    // Log validation errors (if any) for troubleshooting
    if (!isValid) {
      console.log(validate.errors);
    }

    expect(isValid).toBe(true);
    console.log('Schema is valid');
  });

  test('Validate dimension_value fields', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueById = await getDimValueById(tokens[ADMIN], dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test('Validate dimension_value is present in the list', async () => {
    const responseDimValueList = await getDimValueList(tokens[ADMIN]);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value by dim_id', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(tokens[ADMIN], dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValue).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value is not present in the list by Power', async () => {
    const responseDimValueList = await getDimValueList(tokens[POWER]);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test('Validate dimension_value by dim_id. Power with no permission', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(tokens[POWER], dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );
    expect(foundDimensionValue).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test('Validate dimension_value fields by PU with no permission', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure that dimensionValue was created successfully.');
    }

    const responseGetDimValueByIdNoPermission = await getDimValueByIdNoPermission(tokens[POWER], dimensionValueId);

    expect(responseGetDimValueByIdNoPermission.status).toBe(403);
    expect(responseGetDimValueByIdNoPermission.message).toBe('User has no permission to access the Dimension Value');
    console.log(`The dimension_value was not found because PU didn't have permission.`);
  });

  test('Give Power user access to metric', async () => {
    if (metricId === undefined || powerID === undefined) {
      throw new Error('metricId or powerID is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetricForPower = await accessToMetric(tokens[ADMIN], metricId, powerID);

    expect(responseAccessToMetricForPower.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetricForPower.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Give Power user access to Dimension', async () => {
    if (dimensionId === undefined || powerID === undefined) {
      throw new Error('dimensionId or powerID is undefined.');
    }

    const responseAccessToDimensionForPower = await accessToDimension(tokens[ADMIN], dimensionId, powerID);

    expect(responseAccessToDimensionForPower.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForPower.data);

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test('Give Power user access to Dim metric', async () => {
    if (dimensionMetricId === undefined || powerID === undefined) {
      throw new Error('metricId or powerID is undefind.');
    }

    const responseAccessToDimMetricForPower = await accessToMetric(tokens[ADMIN], dimensionMetricId, powerID);

    expect(responseAccessToDimMetricForPower.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToDimMetricForPower.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Validate dimension_value fields by Power', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueById = await getDimValueById(tokens[POWER], dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test('Validate dimension_value is present in the list by Power', async () => {
    const responseDimValueList = await getDimValueList(tokens[POWER]);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value by dim_id by Power', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(tokens[POWER], dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValue).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value is not present in the list by Regular', async () => {
    const responseDimValueList = await getDimValueList(tokens[REGULAR]);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test('Validate dimension_value fields by RU with no permission', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure that dimensionValue was created successfully.');
    }

    const responseGetDimValueByIdNoPermission = await getDimValueByIdNoPermission(tokens[REGULAR], dimensionValueId);

    expect(responseGetDimValueByIdNoPermission.status).toBe(403);
    expect(responseGetDimValueByIdNoPermission.message).toBe('User has no permission to access the Dimension Value');
    console.log(`The dimension_value was not found because RU didn't have permission.`);
  });

  test('Validate dimension_value by dim_id. Regular with no permission', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(tokens[REGULAR], dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );
    expect(foundDimensionValue).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test('Give Refular user access to metric', async () => {
    if (metricId === undefined || regularID === undefined) {
      throw new Error('metricId or regularID is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetricForRegular = await accessToMetric(tokens[ADMIN], metricId, regularID);

    expect(responseAccessToMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Give Regular user access to Dimension', async () => {
    if (dimensionId === undefined || regularID === undefined) {
      throw new Error('dimensionId or powerID is undefined.');
    }

    const responseAccessToDimensionForRegular = await accessToDimension(tokens[ADMIN], dimensionId, regularID);

    expect(responseAccessToDimensionForRegular.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForRegular.data);

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test('Give Regular user access to Dim metric', async () => {
    if (dimensionMetricId === undefined || regularID === undefined) {
      throw new Error('metricId or powerID is undefind.');
    }

    const responseAccessToDimMetricForRegular = await accessToMetric(tokens[ADMIN], dimensionMetricId, regularID);

    expect(responseAccessToDimMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToDimMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Validate dimension_value fields by Regular', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueById = await getDimValueById(tokens[REGULAR], dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test('Validate dimension_value is present in the list by Regular', async () => {
    const responseDimValueList = await getDimValueList(tokens[REGULAR]);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value by dim_id by Regular', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(tokens[REGULAR], dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValue).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Delete metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('MetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete metric
    const responseDeleteMetric = await deleteMetric(tokens[ADMIN], metricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted.`);
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
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure category was created successfully.');
    }

    const responseDeleteCategory = await deleteCategory(tokens[ADMIN], categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted}.`);
  });

  test('Delete Dimension', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure Dimension was created successfully.');
    }

    const responseDeleteDimension = await deleteDimension(tokens[ADMIN], dimensionId);

    expect(responseDeleteDimension.status).toBe(200);
    console.log(`Dimension with ID ${dimensionId} has been deleted}.`);
  });

  test.afterAll(async () => {
    try {
      if (metricId !== undefined) await deleteMetric(tokens[ADMIN], metricId as number);
    } catch (error) {
      console.log('Failed to delete metric in afterAll (might be already deleted)');
    }

    try {
      if (dimensionMetricId !== undefined) await deleteMetric(tokens[ADMIN], dimensionMetricId as number);
    } catch (error) {
      console.log('Failed to delete dimension metric in afterAll (might be already deleted)');
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
