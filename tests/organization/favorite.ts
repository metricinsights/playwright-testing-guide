import { apiInstance } from './auth';
import * as crypto from 'crypto';



// Function to create a favorite folder and return its ID
export async function createFavoriteFolder(token: string) {
  const endpoint = `/api/favorite`;
  const headers = {
    token: token,
  };

  const randomHex = crypto.randomBytes(6).toString('hex');
  const uniqueName = `Playwright_FF_${randomHex}`;
  const createFF = {
    name: uniqueName,
  };

  const response = await apiInstance.post<{
    favorite: { id: number; name: string };
    status: number;
  }>(endpoint, createFF, {
    headers,
  });

  return response; // Return the response object
}

// Function to retrieve the list of favorite folders
export async function getFavoriteFolders(token: string) {
  const endpoint = `/api/favorite`;

  const headers = {
    token: token,
  };

  const response = await apiInstance.get(endpoint, { headers });

  return response.data.favorites;
}

// Function to add metric to FF
export async function addMetricToFavorite(token: string, favoriteFolderId: number, metricId: number) {
  const endpoint = `/api/favorite_element`;
  const headers = {
    token: token,
  };
  const addMetricToFavorite = {
    favorite_id: favoriteFolderId,
    element_id: metricId,
    segment_value_id: 0,
  };

  const responseAddMetricToFavorite = await apiInstance.post(endpoint, addMetricToFavorite, { headers });

  return responseAddMetricToFavorite;
}

// Function to check metric is in FF
export async function isMetricInFF(token: string, favoriteFolderId: number) {
  const endpoint = `/api/favorite_element?favorite=${favoriteFolderId}`;
  const headers = {
    token: token,
  };

  // Define the response type including `favorite_elements`
  const responseIsMetricInFF = await apiInstance.get<{
    favorite_elements: Array<{
      user_dashboard_element_instance_id: number;
      user_id: number;
      element_id: number;
      segment_value_id: number;
      section_type: string;
      favorite_id: number;
      category_id: number;
      // Add other fields if necessary
    }>;
  }>(endpoint, { headers });

  return responseIsMetricInFF;
}

// Function to Delete metric from FF
export async function deleteMetricFromFavorite(token: string, favoriteFolderId: number, metricId: number) {
  const endpoint = `/api/favorite_element`;
  const headers = {
    token: token,
  };
  const deleteMetricFromFavorite = {
    favorite_id: favoriteFolderId,
    element_id: metricId,
    segment_value_id: 0,
  };

  const responseDeleteMetricFromFavorite = await apiInstance.delete(endpoint, {
    headers: headers,
    data: deleteMetricFromFavorite, // This is how you send a body with DELETE requests
  });
  
  return responseDeleteMetricFromFavorite;
}


// Function to delete the FF
export async function deleteFF(token: string, favoriteFolderId: number) {
  const endpoint = `/api/favorite/id/${favoriteFolderId}`;
  const headers = {
    token: token,
  };

  const responseDeleteFF = await apiInstance.delete(endpoint, {
    headers: headers,
  });

  return responseDeleteFF;
}
