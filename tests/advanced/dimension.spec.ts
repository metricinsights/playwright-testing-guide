import { test, expect } from '@playwright/test';
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
import { createCategory, deleteCategory } from '../content/category';
import { createMetric, enableMetric, collectMetric, updateMetric, deleteMetric } from '../content/metric';
import { accessToMetric, accessToDimension } from '../users/user-access';
import { getDefaultAdminToken, setupUsersAndTokens } from '../users/user';
import { addingUserToGroup } from '../users/user-access';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let dimensionId: number | undefined; // Variable to store dimensionId
let dimensionValueId: number | undefined; // Variable to store dimensionValueId
let powerId: number | undefined; // Variable to store powerID
let regularId: number | undefined; // Variable to store regularID
let categoryId: number | undefined; // Variable to store categoryId
let metricId: number | undefined; // Variable to store metricId
let dimensionMetricId: number | undefined; // Variable to store metricId
const busAndTechnicalOwner = 'admin'; // Initialize with a default value
let users: { id: string; username: string; token: string; type: 'administrator' | 'power' | 'regular' }[] = [];
let adminTokenDefault: string;
let adminToken: string;
let powerToken: string;
let regularToken: string;
let userTokens: { token: string; userType: string }[] = [];

// Initialize tokens before running tests
test.beforeAll(async () => {

});

test.describe.serial('Dimension', () => {
  test('Create users and get tokens, added default group for this users', async () => {
    adminTokenDefault = await getDefaultAdminToken();
    console.log('Successfully retrieved default admin token');

    //Creating Admin / PU / RU
    users = await setupUsersAndTokens(adminTokenDefault);

    adminToken = users.find((user) => user.type === 'administrator')?.token || '';
    powerToken = users.find((user) => user.type === 'power')?.token || '';
    regularToken = users.find((user) => user.type === 'regular')?.token || '';

    powerId = Number(users.find((user) => user.type === 'power')?.id || 0);
    regularId = Number(users.find((user) => user.type === 'regular')?.id || 0);

    console.log(powerId, '- Power User', regularId, '- Regular User');

    expect(adminToken).toBeDefined();
    expect(powerToken).toBeDefined();
    expect(regularToken).toBeDefined();

    console.log(`Successfully created ${users.length} test users`);

    userTokens = [
      { token: adminToken, userType: 'Admin' },
      { token: powerToken, userType: 'Power User' },
      { token: regularToken, userType: 'Regular User' },
    ];

    //Adding group to the created users
    const response1 = await addingUserToGroup(adminToken, powerId, 1);

    console.log(response1.data, 'PU added to the default group');

    const response2 = await addingUserToGroup(adminToken, regularId, 1);

    console.log(response2.data, 'RU added to the default group');
  });
  test('Create Category', async () => {
    const responseCreateCategory = await createCategory(adminToken);
    expect(responseCreateCategory.status).toBe(201);

    // Ensure that response data contains the 'category' object and extract the ID
    if (responseCreateCategory.data.category.id != null) {
      categoryId = responseCreateCategory.data.category.id;
      console.log(`Category ID: ${categoryId}`);
    } else {
      console.error('Category creation failed: ID is undefined.');
      console.error('Response data:', JSON.stringify(responseCreateCategory.data));
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
    const responseCreateDimension = await createDimension(adminToken);

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

    const responseCreateDimensionValue = await createDimensionValue(adminToken, dimensionId);

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

  test('Enable the created Dim metric', async () => {
    // Check if Dim metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('Dim metricId is undefined. Ensure the metric was created successfully.');
    }

    // Enable the Metric
    const responseEnableMetric = await enableMetric(adminToken, dimensionMetricId);

    expect(responseEnableMetric.status).toBe(200);
    console.log(`Dim Metric with ID ${dimensionMetricId} has been enabled.`);
  });

  test('Collect Dim the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Collect the Metric
    const responseCollectMetric = await collectMetric(adminToken, dimensionMetricId);

    expect(responseCollectMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been collected.`);
  });

  test('Update Dim the created metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('metricId is undefined. Ensure the category was created successfully.');
    }

    // Update the Metric
    const responseUpdateMetric = await updateMetric(adminToken, dimensionMetricId);

    expect(responseUpdateMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been updated.`);
  });

  test('Validate response schema', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueForSchema = await getDimValueForSchema(adminToken, dimensionValueId);

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
    const responseGetDimValueById = await getDimValueById(adminToken, dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test('Validate dimension_value is present in the list', async () => {
    const responseDimValueList = await getDimValueList(adminToken);

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
    const responseDimValueByDimensionId = await getDimValueByDimensionId(adminToken, dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValue).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test('Validate dimension_value is not present in the list by Power', async () => {
    const responseDimValueList = await getDimValueList(powerToken);

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
    const responseDimValueByDimensionId = await getDimValueByDimensionId(powerToken, dimensionId);

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

    const responseGetDimValueByIdNoPermission = await getDimValueByIdNoPermission(powerToken, dimensionValueId);

    expect(responseGetDimValueByIdNoPermission.status).toBe(403);
    expect(responseGetDimValueByIdNoPermission.message).toBe('User has no permission to access the Dimension Value');
    console.log(`The dimension_value was not found because PU didn't have permission.`);
  });

  test('Give Power user access to metric', async () => {
    if (metricId === undefined || powerId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    console.log(`Attempting to give access: metricId=${metricId}, powerId=${powerId}`);

    // Step 1: Add access for the specific user
    const responseAccessToMetricForPower = await accessToMetric(adminToken, metricId, powerId);

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
    if (dimensionId === undefined || powerId === undefined) {
      throw new Error('dimensionId or powerId is undefined.');
    }

    const responseAccessToDimensionForPower = await accessToDimension(adminToken, dimensionId, powerId);

    expect(responseAccessToDimensionForPower.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForPower.data);

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test('Give Power user access to Dim metric', async () => {
    if (dimensionMetricId === undefined || powerId === undefined) {
      throw new Error('metricId or powerId is undefind.');
    }

    const responseAccessToDimMetricForPower = await accessToMetric(adminToken, dimensionMetricId, powerId);

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
    const responseGetDimValueById = await getDimValueById(powerToken, dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test('Validate dimension_value is present in the list by Power', async () => {
    const responseDimValueList = await getDimValueList(powerToken);

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
    const responseDimValueByDimensionId = await getDimValueByDimensionId(powerToken, dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValue).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test.skip('Validate dimension_value is not present in the list by Regular', async () => {
    const responseDimValueList = await getDimValueList(regularToken);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test.skip('Validate dimension_value fields by RU with no permission', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure that dimensionValue was created successfully.');
    }

    const responseGetDimValueByIdNoPermission = await getDimValueByIdNoPermission(regularToken, dimensionValueId);

    expect(responseGetDimValueByIdNoPermission.status).toBe(403);
    expect(responseGetDimValueByIdNoPermission.message).toBe('User has no permission to access the Dimension Value');
    console.log(`The dimension_value was not found because RU didn't have permission.`);
  });

  test.skip('Validate dimension_value by dim_id. Regular with no permission', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(regularToken, dimensionId);

    // Validate specific fields
    const foundDimensionValue = responseDimValueByDimensionId.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );
    expect(foundDimensionValue).toBe(false);
    console.log('dimension_value was not found in the list.');
  });

  test.skip('Give Regular user access to metric', async () => {
    if (metricId === undefined || regularId === undefined) {
      throw new Error('metricId or regularId is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetricForRegular = await accessToMetric(adminToken, metricId, regularId);

    expect(responseAccessToMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test.skip('Give Regular user access to Dimension', async () => {
    if (dimensionId === undefined || regularId === undefined) {
      throw new Error('dimensionId or powerID is undefined.');
    }

    const responseAccessToDimensionForRegular = await accessToDimension(adminToken, dimensionId, regularId);

    expect(responseAccessToDimensionForRegular.status).toBe(201);

    const responseBodyText = JSON.stringify(responseAccessToDimensionForRegular.data);

    expect(responseBodyText).toContain('dimension');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('user');

    console.log('User access to dimension granted successfully.');
  });

  test.skip('Give Regular user access to Dim metric', async () => {
    if (dimensionMetricId === undefined || regularId === undefined) {
      throw new Error('metricId or powerID is undefind.');
    }

    const responseAccessToDimMetricForRegular = await accessToMetric(adminToken, dimensionMetricId, regularId);

    expect(responseAccessToDimMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToDimMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test.skip('Validate dimension_value fields by Regular', async () => {
    if (dimensionValueId === undefined) {
      throw new Error('dimensionValueId is undefined. Ensure the dimensionValue was created successfully.');
    }
    const responseGetDimValueById = await getDimValueById(regularToken, dimensionValueId);

    // Validate specific fields
    expect(responseGetDimValueById.dimension).toBe(dimensionId);
    expect(responseGetDimValueById.id).toBe(dimensionValueId);
    console.log('dimension_value validation passed.');
  });

  test.skip('Validate dimension_value is present in the list by Regular', async () => {
    const responseDimValueList = await getDimValueList(regularToken);

    // Validate specific fields
    const foundDimensionValueId = responseDimValueList.some(
      (dimension_values: { id: number }) => dimension_values.id === dimensionValueId,
    );

    expect(foundDimensionValueId).toBe(true);
    console.log('dimension_value was found in the list.');
  });

  test.skip('Validate dimension_value by dim_id by Regular', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure the dimension was created successfully.');
    }
    const responseDimValueByDimensionId = await getDimValueByDimensionId(regularToken, dimensionId);

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
    const responseDeleteMetric = await deleteMetric(adminToken, metricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted.`);
  });

  test('Delete Dim metric', async () => {
    // Check if metricId is defined before proceeding
    if (dimensionMetricId === undefined) {
      throw new Error('dimensionMetricId is undefined. Ensure metric was created successfully.');
    }

    // Delete metric
    const responseDeleteMetric = await deleteMetric(adminToken, dimensionMetricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${dimensionMetricId} has been deleted.`);
  });

  test('Delete Category', async () => {
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure category was created successfully.');
    }

    const responseDeleteCategory = await deleteCategory(adminToken, categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted}.`);
  });

  test('Delete Dimension', async () => {
    if (dimensionId === undefined) {
      throw new Error('dimensionId is undefined. Ensure Dimension was created successfully.');
    }

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
  });
});
