import { apiInstance, usernamePower } from './auth';
import axios from 'axios';
import { AxiosResponse } from 'axios';

export const csdId = process.env.CFS_ID;

const singleValue = process.env.CF_ID_SINGLE_VALUE;
const dateAndTime = process.env.CF_ID_DATE_AND_TIME;
const emailAddress = process.env.CF_ID_EMAIL_ADDRESS;
const multiValue = process.env.CF_ID_MULTI_VALUE;
const textValue = process.env.CF_ID_TEXT_VALUE;
const users = process.env.CF_ID_USERS;

//custom_field
export async function getCustomField(token: string, url: string = `/api/custom_field`) {
  const response = await apiInstance.get(`${url}`, {
    headers: {
      Token: token,
    },
  });

  const status = response.status;

  if (response.data.custom_fields.length > 0) {
    const section = response.data.custom_fields[0].section;
    const cfsId = response.data.custom_fields[0].cfs_id;

    return { section, cfsId, status };
  } else {
    console.log('Response is empty');

    return undefined;
  }
}

export async function getCustomFieldBySection(token: string, sectionName: string, userType: string) {
  const response = await apiInstance.get(`/api/custom_field?section=${sectionName}`, {
    headers: {
      Token: token,
    },
  });

  const customFields = response.data.custom_fields;

  if (!customFields || customFields.length === 0) {
    console.error(`Error: No custom fields found for section "${sectionName}".`);
    throw new Error(`No custom fields found for section "${sectionName}".`);
  }

  const allSectionsAreEqual = response.data.custom_fields.every((field: any) => field.section === `${sectionName}`);

  console.log(`All section key have value ${sectionName}`, `for the ${userType}`);

  return { allSectionsAreEqual, response };
}

export async function getCustomFieldBySectionId(token: string, sectionId: number, userType: string) {
  const response = await apiInstance.get(`/api/custom_field?section=${sectionId}`, {
    headers: {
      Token: token,
    },
  });

  const customFields = response.data.custom_fields;

  if (!customFields || customFields.length === 0) {
    console.error(`Error: No custom fields found for section "${sectionId}".`);
    throw new Error(`No custom fields found for section "${sectionId}".`);
  }

  const allSectionsAreEqual = response.data.custom_fields.every((field: any) => field.cfs_id === sectionId);

  console.log(`All section key have value ${sectionId}`, `for the ${userType}`);
  //console.log(response.data);

  return { allSectionsAreEqual, response };
}

//custom_field_value
export async function putCustomFieldValue(token: string, metricId: number): Promise<AxiosResponse> {
  const response = await apiInstance.put(
    `/api/custom_field_value/id/${metricId}`,
    [
      {
        cf_id: `${singleValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Single_Value_Postman',
        value: 'Option1',
      },
      {
        cf_id: `${dateAndTime}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Date/time_Postman',
        value: '2024-02-13',
      },
      {
        cf_id: `${emailAddress}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Email_Address_Postman',
        value: 'lalaa@gmail.com',
      },
      {
        cf_id: `${multiValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Multi_Value_Postman',
        value: ['multi1', 'multi2'],
      },
      {
        cf_id: `${textValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Text_Value_Postman',
        value: 'text postman',
      },
      {
        cf_id: `${users}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Users_Postman',
        value: `${usernamePower}`,
      },
    ],
    {
      headers: {
        Token: token,
      },
    },
  );

  return response;
}

export async function putCustomFieldEmptyValue(token: string, metricId: number): Promise<AxiosResponse> {
  const response = await apiInstance.put(
    `/api/custom_field_value/id/${metricId}`,
    [
      {
        cf_id: `${singleValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Single_Value_Postman',
        value: '',
      },
      {
        cf_id: `${dateAndTime}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Date/time_Postman',
        value: '',
      },
      {
        cf_id: `${emailAddress}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Email_Address_Postman',
        value: '',
      },
      {
        cf_id: `${multiValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Multi_Value_Postman',
        value: [],
      },
      {
        cf_id: `${textValue}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Text_Value_Postman',
        value: '',
      },
      {
        cf_id: `${users}`,
        cfs_id: csdId,
        section: 'Postman_Autotest_Section (DONT DELETE)',
        title: 'Users_Postman',
        value: '',
      },
    ],
    {
      headers: {
        Token: token,
      },
    },
  );

  return response;
}

export async function getCustomFieldValue(token: string, metricId: number) {
  const response = await apiInstance.get(`/api/custom_field_value/id/${metricId}`, {
    headers: {
      Token: token,
    },
  });

  return response;
}

export async function customFieldInfo(token: string, metricId: number) {
  const response = await apiInstance.get(`/api/custom_field_info?element=${metricId}`, {
    headers: {
      Token: token,
    },
  });

  //console.log(response.data.custom_fields[0].fields);
  //console.log(response.data.custom_fields);

  return response;
}

export async function getCustomFieldValueToMetricWithoutAccess(token: string, mericId: number, userType: string) {
  try {
    const response = await apiInstance.get(`/api/custom_field_value/id/${mericId}`, {
      headers: {
        Token: token,
      },
    });

    if (response.status === 200) {
      throw new Error(`Request failed with status code ${response.status}`);
    }
    //console.log(response.data);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.status);
      console.log(error.response?.data, `---${userType} sending GET request to the adminMetricId`);

      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

export async function putCustomFieldValuesWithoutAccess(
  token: string,
  id: number,
  userType: string,
): Promise<AxiosResponse> {
  try {
    const response = await apiInstance.put(
      `/api/custom_field_value/id/${id}`,
      {},
      {
        headers: {
          Token: token,
        },
      },
    );

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.status);
      console.log(error.response?.data, `${userType} sending PUT request without access `);

      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
