import axios from 'axios';
import { apiInstance } from '../auth/auth';
import { testLogger } from '../utils/test-helpers';

// Function to create a Dimension Value and return its ID
export async function createDimensionValue(token: string, dimensionId: number) {
  const endpoint = `/api/dimension_value`;
  const headers = {
    token: token,
  };
  const createDimensionValue = {
    dimension: dimensionId,
    name: 'France',
    key_value_varchar: 1,
    visible_in_dashboard: 'Y',
  };

  testLogger.info(`Creating dimension value "${createDimensionValue.name}"`, `Dimension ID: ${dimensionId}`);

  try {
    const responseCreateDimensionValue = await apiInstance.post<{
      dimension_value: { id: number; name: string };
    }>(endpoint, createDimensionValue, { headers });

    return responseCreateDimensionValue;
  } catch (error: unknown) {
    console.error('Error creating dimension value:');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Headers:', error.response?.headers);
    }
    throw error;
  }
}

