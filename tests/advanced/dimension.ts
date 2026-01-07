import { apiInstance } from '../auth/auth';
import axios from 'axios';
import crypto from 'crypto';
import { JSONSchemaType } from 'ajv';

const uniqueDimensionName = `Playwright_Dimension_${crypto.randomBytes(6).toString('hex')}`;

// Function to create a Dimension and return its ID
export async function createDimension(token: string) {
  const endpoint = `/api/dimension`;

  const headers = {
    token: token,
  };
  const createDimension = {
    name: uniqueDimensionName,
    value_type: 'text',
    bind_parameter: 'dim',
    show_as_tile_default: 'yes',
    include_compound_dimension_values: 'selected values',
    combines_existing_dimensions: 'simple',
    element_name_template: 6,
    data_source: 'manual',
    data_collection_trigger: 11,
    scope_of_access_default: 'All Dimension Values',
    include_total_dimension_value: 'Yes',
    include_individual_currency_prefix: 'No',
    show_dimension_drop_down_when_there_is_only_one_value: 'No',
  };

  const responseCreateDimension = await apiInstance.post<{
    dimension: { id: number; name: string };
  }>(endpoint, createDimension, { headers });

  return responseCreateDimension;
}

// Function to delete Dimension
export async function deleteDimension(token: string, dimensionId: number) {
  const endpoint = `/api/dimension/id/${dimensionId}`;

  const headers = {
    token: token,
  };

  const responseDeleteDimension = await apiInstance.delete(endpoint, {
    headers: headers,
    data: deleteDimension,
  });

  return responseDeleteDimension;
}

interface DimensionValue {
  id: number;
  dimension: number;
  name: string;
  key_value_varchar: string;
  visible_in_dashboard: string;
}

interface MyData {
  dimension_value: DimensionValue;
}

// JSON Schema for dimension_value
export const dimensionValueSchema: JSONSchemaType<MyData> = {
  type: 'object',
  properties: {
    dimension_value: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        dimension: { type: 'integer' },
        name: { type: 'string' },
        key_value_varchar: { type: 'string' },
        visible_in_dashboard: { type: 'string' },
      },
      required: ['dimension', 'id', 'name', 'key_value_varchar', 'visible_in_dashboard'],
      additionalProperties: false,
    },
  },
  required: ['dimension_value'],
};

// Function to retrieve the list of dim values by Id
export async function getDimValueForSchema(token: string, dimensionValueId: number) {
  const endpoint = `/api/dimension_value/id/${dimensionValueId}`;

  const headers = {
    token: token,
  };

  const responseGetDimValueForSchema = await apiInstance.get(endpoint, { headers });

  return responseGetDimValueForSchema.data;
}

// Function to retrieve the list of dim values by Id
export async function getDimValueById(token: string, dimensionValueId: number) {
  const endpoint = `/api/dimension_value/id/${dimensionValueId}`;

  const headers = {
    token: token,
  };

  const responseGetDimValueById = await apiInstance.get(endpoint, { headers });

  return responseGetDimValueById.data.dimension_value;
}

// Function to validate dimension_value is present in the list
export async function getDimValueList(token: string) {
  const endpoint = `/api/dimension_value`;

  const headers = {
    token: token,
  };

  const responseDimValueList = await apiInstance.get<{
    dimension_values: { id: number; dimension: number }[]; // Indicating that dimension_values is an array
  }>(endpoint, { headers });

  return responseDimValueList.data.dimension_values;
}

// Function to validate dimension value by dim_id
export async function getDimValueByDimensionId(token: string, dimensionId: number) {
  const endpoint = `/api/dimension_value?dimension=${dimensionId}`;

  const headers = {
    token: token,
  };

  const responseDimValueByDimensionId = await apiInstance.get<{
    dimension_values: { id: number; dimension: number }[];
  }>(endpoint, { headers });

  return responseDimValueByDimensionId.data.dimension_values;
}

// Function to get dim value by id with no permission
export async function getDimValueByIdNoPermission(token: string, dimensionValueId: number) {
  const endpoint = `/api/dimension_value/id/${dimensionValueId}`;
  const headers = {
    token: token,
  };

  try {
    const responseGetDimValueByIdNoPermission = await apiInstance.get(endpoint, { headers });

    return {
      success: true,
      data: responseGetDimValueByIdNoPermission.data,
      status: responseGetDimValueByIdNoPermission.status,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500, // Default to 500 if status is missing
        message: error.response?.data?.message || 'Unknown error',
      };
    }

    return { success: false, status: 500, message: 'An unexpected error occurred' };
  }
}
