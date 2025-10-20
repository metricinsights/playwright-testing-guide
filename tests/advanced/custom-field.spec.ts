import { test, expect } from '@playwright/test';
import { ADMIN, getTokens, regularId, POWER, REGULAR, usernamePower, usernameAdmin } from '../utils/auth';
import {
  getCustomField,
  getCustomFieldBySection,
  getCustomFieldBySectionId,
  getCustomFieldValueToMetricWithoutAccess,
  putCustomFieldValuesWithoutAccess,
  putCustomFieldEmptyValue,
  putCustomFieldValue,
  getCustomFieldValue,
  customFieldInfo,
} from './сustom-field-and-custom-field-value';
import { createMetric, deleteMetric, enableMetric } from './metric';
import { accessToMetric } from './user-access';
import { createCategory, deleteCategory } from './category';
import axios from 'axios';

const customFieldValue = {
  singleVale: 'Single_Value_Postman',
  multiValue: 'Multi_Value_Postman',
  textValue: 'Text_Value_Postman',
  emailValue: 'Email_Address_Postman',
  dateAndTime: 'Date/time_Postman',
  users_Postman: 'Users_Postman',
};

const customFieldValueData = {
  singleValue: 'Option1',
  dateAndTime: '2024-02-13',
  emailValue: 'lalaa@gmail.com',
  textValue: 'text postman',
  users_Postman: `${usernamePower}`,
  multiValue: 'multi1',
  multiValue2: 'multi2',
};

//npm run test:dev stg70 сustom-field-and-custom-field-value.spec.ts

let tokens: Awaited<ReturnType<typeof getTokens>>; // have to be in the each file for getToken
let responseAdmin: { section: string; cfsId: number; status: number };
let responsePower: { section: string; cfsId: number; status: number };
let responseRegular: { section: string; cfsId: number; status: number };
let categoryId: number;
let adminMetricId: number;
let puMetricId: number;

test.beforeAll(async () => {
  tokens = await getTokens(); // have to be in the each file for getToken
});

test.describe.serial('Custom field', () => {
  test('Check all custom field by admin / RU / PU', async () => {
    responseAdmin = await getCustomField(tokens[ADMIN]);
    responsePower = await getCustomField(tokens[POWER]);
    responseRegular = await getCustomField(tokens[REGULAR]);

    expect(responseAdmin).toBeDefined();
    expect(responsePower).toBeDefined();
    expect(responseRegular).toBeDefined();

    expect(responseAdmin.status).toBe(200);
    expect(responsePower.status).toBe(200);
    expect(responseRegular.status).toBe(200);

    console.log(responseAdmin, '- Admin', responsePower, '- Power', responseRegular, '- Regular');
  });

  test('Check custom field by section as admin / RU / PU', async () => {
    const [respAdmin, respPower, respRegular] = await Promise.all([
      getCustomFieldBySection(tokens[ADMIN], responseAdmin.section, 'Admin'),
      getCustomFieldBySection(tokens[POWER], responsePower.section, 'Power'),
      getCustomFieldBySection(tokens[REGULAR], responseRegular.section, 'Regular'),
    ]);

    expect(respAdmin.allSectionsAreEqual).toBe(true);
    expect(respPower.allSectionsAreEqual).toBe(true);
    expect(respRegular.allSectionsAreEqual).toBe(true);
    expect(respAdmin.response.status).toBe(200);
    expect(respPower.response.status).toBe(200);
    expect(respRegular.response.status).toBe(200);
  });

  test('Check custom field by sectionId as admin / RU / PU', async () => {
    const [respAdmin, respPower, respRegular] = await Promise.all([
      getCustomFieldBySectionId(tokens[ADMIN], responseAdmin.cfsId, 'Admin'),
      getCustomFieldBySectionId(tokens[POWER], responsePower.cfsId, 'Power'),
      getCustomFieldBySectionId(tokens[REGULAR], responseRegular.cfsId, 'Regular'),
    ]);

    expect(respAdmin.allSectionsAreEqual).toBe(true);
    expect(respPower.allSectionsAreEqual).toBe(true);
    expect(respRegular.allSectionsAreEqual).toBe(true);
    expect(respAdmin.response.status).toBe(200);
    expect(respPower.response.status).toBe(200);
    expect(respRegular.response.status).toBe(200);
  });
});

test.describe.serial('Custom field value', () => {
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

  test('Create metric Admin and PU', async () => {
    const response1 = await createMetric(tokens[ADMIN], categoryId, `${usernameAdmin}`);

    adminMetricId = response1.data.metric.id;

    const response2 = await createMetric(tokens[ADMIN], categoryId, `${usernamePower}`);

    puMetricId = response2.data.metric.id;

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);

    console.log(adminMetricId, '- Admin metric', puMetricId, '- PU metric');
  });

  test('Enable metric Admin and PU', async () => {
    const responseAdmin = await enableMetric(tokens[ADMIN], adminMetricId);
    expect(responseAdmin.status).toBe(200);
    const responsePu = await enableMetric(tokens[ADMIN], puMetricId);
    expect(responsePu.status).toBe(200);

    console.log(responseAdmin.status, '- Admin metric enabled', responsePu.status, '- PU metric enabled');
  });

  test('"/api/custom_field" and "/api/custom_field_value/id/" with NoToken', async () => {
    const promises = [
      getCustomField('', '/api/custom_field'),
      getCustomField('', `/api/custom_field_value/id/${adminMetricId}`),
      putCustomFieldValue('', adminMetricId),
    ];

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const url = [
        '/api/custom_field',
        `/api/custom_field_value/id/${adminMetricId}`,
        `/api/custom_field_values/${adminMetricId}`,
      ][index];

      if (result.status === 'rejected' && axios.isAxiosError(result.reason)) {
        const error = result.reason;
        expect(error.response?.status).toBe(401);
        expect(error.response?.data).toHaveProperty('status', 'ERROR');
        expect(error.response?.data).toHaveProperty('message', 'Unauthorized');

        console.log(error.response?.status, 'for GET', url);
        console.log(error.response?.data, 'for GET', url);
      } else if (result.status === 'rejected') {
        console.error('Unexpected error:', result.reason);
        throw result.reason;
      } else if (result.status === 'fulfilled') {
        console.error(`Unexpected successful response for ${url}:`, result.value);
        throw new Error(`Expected request to ${url} to fail, but it succeeded`);
      }
    });
  });

  test('Give Regular user access to metric', async () => {
    // Check if adminMetricId is defined before proceeding
    if (adminMetricId === undefined || regularId === undefined) {
      throw new Error('adminMetricId or regularId is undefind.');
    }

    // Step 1: Add access for the specific user
    const responseAccessToMetricForRegular = await accessToMetric(tokens[ADMIN], adminMetricId, regularId);

    // Check if the status is 200 instead of 201 since the actual response status is 201
    expect(responseAccessToMetricForRegular.status).toBe(201);

    // Convert the response body to text
    const responseBodyText = JSON.stringify(responseAccessToMetricForRegular.data);

    // Check if the response contains 'user_element', 'id', and 'element_id'
    expect(responseBodyText).toContain('user_element');
    expect(responseBodyText).toContain('id');
    expect(responseBodyText).toContain('element_id');

    console.log('User access to metric granted successfully.');
  });

  test('Check the custom_field_value for Admin, Power, and Regular by metricId', async () => {
    const checkCustomFieldValues = async (token: string, metricId: number, userType: string) => {
      for (const value of Object.values(customFieldValue)) {
        const response = await getCustomFieldValue(token, metricId);

        const list = response.data.custom_field_values.some(
          (custom_field_values) => custom_field_values.title === value,
        );

        expect(list).toBe(true);
        expect(response.status).toBe(200);

        console.log(`${value}, - presented in the response for ${userType}`);
      }
    };

    await Promise.all([
      checkCustomFieldValues(tokens[ADMIN], adminMetricId, 'Admin'),
      checkCustomFieldValues(tokens[POWER], puMetricId, 'Power'),
      checkCustomFieldValues(tokens[REGULAR], adminMetricId, 'Regular'),
    ]);
  });

  test('Negative case without access', async () => {
    const error1 = await getCustomFieldValueToMetricWithoutAccess(tokens[POWER], adminMetricId, 'Power');

    if (axios.isAxiosError(error1)) {
      expect(error1.response?.status).toBe(403);
      expect(error1.response?.data).toHaveProperty('message', 'User has no permission to view the Element');
    } else {
      throw new Error('Expected an Axios error for error1');
    }

    const error2 = await getCustomFieldValueToMetricWithoutAccess(tokens[REGULAR], puMetricId, 'Regular');

    if (axios.isAxiosError(error2)) {
      expect(error2.response?.status).toBe(403);
      expect(error2.response?.data).toHaveProperty('message', 'User has no permission to view the Element');
    } else {
      throw new Error('Expected an Axios error for error2');
    }

    const error3 = await putCustomFieldValuesWithoutAccess(tokens[POWER], adminMetricId, 'Power');

    if (axios.isAxiosError(error3)) {
      expect(error3.response?.status).toBe(403);
      expect(error3.response?.data.message).toMatch(/User has no permission to (view|edit) the Element/);
    } else {
      throw new Error('Expected an Axios error for error3');
    }

    const error4 = await putCustomFieldValuesWithoutAccess(tokens[REGULAR], adminMetricId, 'Regular');

    if (axios.isAxiosError(error4)) {
      expect(error4.response?.status).toBe(403);
      expect(error4.response?.data.message).toMatch(/User has no permission to (view|edit) the Element/);
    } else {
      throw new Error('Expected an Axios error for error4');
    }
  });

  test('Adding value for all custom fields from Postman_Autotest_Section as Admin to adminMetricId', async () => {
    for (const data of Object.values(customFieldValueData)) {
      const response = await putCustomFieldValue(tokens[ADMIN], adminMetricId);

      const list = response.data.custom_field_values.some((custom_field_values) => {
        if (Array.isArray(custom_field_values.value)) {
          return custom_field_values.value.includes(data);
        } else {
          return custom_field_values.value === data;
        }
      });

      expect(list).toBe(true);
      expect(response.status).toBe(200);

      console.log(`${data}, - field value is in the response for ADMIN after adding`);
    }
  });

  test('Adding value for all custom fields from Postman_Autotest_Section as Power to puMetricId', async () => {
    for (const data of Object.values(customFieldValueData)) {
      const response = await putCustomFieldValue(tokens[POWER], puMetricId);

      const list = response.data.custom_field_values.some((custom_field_values) => {
        if (Array.isArray(custom_field_values.value)) {
          return custom_field_values.value.includes(data);
        } else {
          return custom_field_values.value === data;
        }
      });

      expect(list).toBe(true);
      expect(response.status).toBe(200);

      console.log(`${data}, - field value is in the response for POWER after adding`);
    }
  });

  test('GET custom_field_info', async () => {
    const checkCustomFieldInfo = async (token: string, metricId: number, userType: string) => {
      for (const value of Object.values(customFieldValue)) {
        const response = await customFieldInfo(token, metricId);

        const list = response.data.custom_fields[0].fields.some((custom_fields) => custom_fields.name === value);

        expect(list).toBe(true);
        expect(response.status).toBe(200);

        console.log(
          `---${value}, - field value is in the response for "/api/custom_field_info?element=" as ${userType}`,
        );
      }
    };

    await checkCustomFieldInfo(tokens[ADMIN], adminMetricId, 'Admin');
    await checkCustomFieldInfo(tokens[POWER], puMetricId, 'Power');
    await checkCustomFieldInfo(tokens[REGULAR], adminMetricId, 'Regular');
  });

  test('Deletion value from all custom fields by Postman_Autotest_Section for Admin', async () => {
    for (const data of Object.values(customFieldValueData)) {
      const response = await putCustomFieldEmptyValue(tokens[ADMIN], adminMetricId);

      //console.log(response);

      const list = response.data.custom_field_values.every(
        (custom_field_values) => !custom_field_values.value.includes(data),
      );

      expect(list).toBe(true);
      expect(response.status).toBe(200);

      console.log(`*****${data}, - field value is MISSED in the response for Admin`);
    }
  });

  test('Deletion value from all custom fields by Postman_Autotest_Section  for Power', async () => {
    for (const data of Object.values(customFieldValueData)) {
      const response = await putCustomFieldEmptyValue(tokens[POWER], puMetricId);

      //console.log(response);

      const list = response.data.custom_field_values.every(
        (custom_field_values) => !custom_field_values.value.includes(data),
      );

      expect(list).toBe(true);
      expect(response.status).toBe(200);

      console.log(`*****${data}, - field value is MISSED in the response for Power`);
    }
  });

  test('Delete metric Admin and PU', async () => {
    const responseAdmin = await deleteMetric(tokens[ADMIN], adminMetricId);
    expect(responseAdmin.status).toBe(200);
    const responsePu = await deleteMetric(tokens[ADMIN], puMetricId);
    expect(responsePu.status).toBe(200);

    console.log(responseAdmin.status, '- Admin metric deleted', responsePu.status, '- PU metric deleted');
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

  test.afterAll(async () => {
    try {
      if (adminMetricId !== undefined) await deleteMetric(tokens[ADMIN], adminMetricId as number);
    } catch (error) {
      console.log('Failed to delete admin metric in afterAll (might be already deleted)');
    }

    try {
      if (puMetricId !== undefined) await deleteMetric(tokens[ADMIN], puMetricId as number);
    } catch (error) {
      console.log('Failed to delete PU metric in afterAll (might be already deleted)');
    }

    try {
      if (categoryId !== undefined) await deleteCategory(tokens[ADMIN], categoryId as number);
    } catch (error) {
      console.log('Failed to delete category in afterAll (might be already deleted)');
    }
  });
});
