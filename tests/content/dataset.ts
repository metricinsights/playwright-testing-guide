import { apiInstance } from '../auth/auth';
import crypto from 'crypto';
import axios from 'axios';

// Function to create a Dataset and return its ID
export async function createDataset(token: string, categoryId: number) {
  const endpoint = `/api/dataset`;
  const headers = {
    token: token,
  };
  const uniqueDatasetName = `Playwright_Dataset_${crypto.randomBytes(6).toString('hex')}`;
  const datasetPayload = {
    name: uniqueDatasetName,
    description: 'Playwright API Dataset',
    measurement_interval: 3,
    data_storage: 1,
    category: categoryId,
    data_collection_trigger: 17,
    keep_history: 'No',
    measurement_time_source: 'Measurement time command',
    can_historical_instances_be_backfilled: 'N',
    weekly_data_for: 'Last day of Week',
    custom_effective_date: 2,
    data_source: '2_sql',
    dataset_source: '0_0',
    data_fetch_command:
      'select plugin_id, name, plugin_internal_name from plugin ' +
      "WHERE name IN ('Tableau', 'QlikView', 'Qlik Sense', 'Local Filesystem', 'IBM Cognos');",
    omit_partial_periods_ind: 'No',
    generate_empty_instance_ind: 'skip generation',
    has_access_map_ind: 'user has access to all rows',
    instances_to_keep: 1095,
  };

  const responseCreateDataset = await apiInstance.post<{
    dataset: { id: number; name: string };
  }>(endpoint, datasetPayload, { headers });

  return responseCreateDataset;
}

// Function to delete Dataset
export async function deleteDataset(token: string, datasetId: number) {
  const endpoint = `/api/dataset/id/${datasetId}`;
  const headers = {
    token: token,
  };

  const responseDeleteDataset = await apiInstance.delete(endpoint, {
    headers: headers,
  });

  return responseDeleteDataset;
}

// Validate the created Dataset data
export async function validateDataset(token: string, datasetId: number) {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const endpoint = `/api/dataset/id/${datasetId}`;

  const headers = {
    token: token,
  };
  const validateDatasetPayload = {
    call: 'validate',
    last_measurement_time: formattedDate,
  };

  const responseValidateDataset = await apiInstance.put<{ message: string }>(endpoint, validateDatasetPayload, {
    headers,
  });

  return responseValidateDataset;
}

// Function to enable the created Dataset
export async function enableDataset(token: string, datasetId: number) {
  const endpoint = `/api/dataset/id/${datasetId}`;
  const headers = {
    token: token,
  };
  const enableDatasetPayload = {
    call: 'enable',
  };

  const responseEnableDataset = await apiInstance.put<{ message: string }>(endpoint, enableDatasetPayload, { headers });

  return responseEnableDataset;
}

// Function to Update the created Dataset
export async function generateDataset(token: string, datasetId: number) {
  const endpoint = `/api/dataset/id/${datasetId}`;
  const headers = {
    token: token,
  };
  const generateDatasetPayload = {
    call: 'generate',
  };

  const responseGenerateDataset = await apiInstance.put<{ message: string }>(endpoint, generateDatasetPayload, {
    headers,
  });

  return responseGenerateDataset;
}

// Function to delete Dataset data using PUT method
export async function deleteDatasetData(token: string, datasetId: number) {
  const endpoint = `/api/dataset/id/${datasetId}`;
  const headers = {
    token: token,
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0] + ' 00:00:00';
  try {
    const deleteDatasetDataPayload = {
      call: 'delete_data',
      delete_measurements_from: formattedDate,
      delete_measurements_through: formattedDate,
    };

    const responseDeleteDatasetData = await apiInstance.put<{ message: string }>(endpoint, deleteDatasetDataPayload, {
      headers,
    });

    return responseDeleteDatasetData;
  } catch (error) {
    console.error(`Failed to delete dataset data for ID ${datasetId}:`, error);
    throw error;
  }
}

// Function to get all Datasets
export async function getDataset(token: string) {
  const endpoint = `/api/dataset`;
  const headers = {
    token: token,
  };

  const responseGetDataset = await apiInstance.get<{
    datasets: Array<{ id: number; name: string }>;
  }>(endpoint, { headers });

  return responseGetDataset;
}

// Function to get Dataset data by ID
export async function getDatasetData(token: string, datasetId: number) {
  const endpoint = `/api/dataset_data?dataset=${datasetId}`;
  const headers = {
    token: token,
  };

  const responseGetDatasetData = await apiInstance.get<{
    data: Array<{
      plugin_id: number;
      name: string;
      plugin_internal_name: string;
    }>;
  }>(endpoint, { headers });

  return responseGetDatasetData;
}

// Function to attempt accessing dataset data with no permission
export async function noAvailableData(token: string, datasetId: number) {
  const endpoint = `/api/dataset_data?dataset=${datasetId}`;
  const headers = {
    token: token,
  };

  try {
    const responseGetDatasetData = await apiInstance.get(endpoint, { headers });

    return {
      success: true,
      data: responseGetDatasetData.data,
      status: responseGetDatasetData.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500, // Default to 500 if status is missing
        message: error.response?.data?.message || 'Unknown error',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
}

// Function to check if a user can access the dataset list
export async function checkDatasetListAccess(token: string) {
  const endpoint = `/api/dataset`;
  const headers = {
    token: token,
  };

  try {
    const response = await apiInstance.get(endpoint, { headers });

    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Unknown error',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
}
