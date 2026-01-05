import { apiInstance } from '../utils/auth';
import * as crypto from 'crypto';



// Variables
const uniqueCatName = `Playwright_Category_${crypto.randomBytes(6).toString('hex')}`;

// Function to create a Category and return its ID
export async function createCategory(token: string) {
  const endpoint = `/api/category`;
  const headers = {
    token: token,
  };

  const createCategory = {
    name: uniqueCatName,
    visible_on_dashboard: 'Y',
    visible_in_search: 'Y',
    business_owner_id: process.env.DEFAULT_USERNAME_ADMIN,
    technical_owner_id: process.env.DEFAULT_USERNAME_ADMIN,
    sort_order_owner_id: process.env.DEFAULT_USERNAME_ADMIN,
    use_custom_access_denied_message: 'N',
  };

  const responseCreateCategory = await apiInstance.post<{
    category: { id: number; name: string; visible_on_dashboard: string; visible_in_search: string };
  }>(endpoint, createCategory, { headers });

  return responseCreateCategory;
}

// Function to delete Category
export async function deleteCategory(token: string, categoryId: number) {
  const endpoint = `/api/category/id/${categoryId}`;
  const headers = {
    token: token,
  };

  try {
    const responseDeleteCategory = await apiInstance.delete(endpoint, {
      headers: headers,
      data: deleteCategory,
    });

    return responseDeleteCategory;
  } catch (error) {
    // Handle 404 errors silently (category already deleted)
    const axiosError = error as { response?: { status?: number; data?: unknown } };
    if (axiosError.response?.status === 404) {
      // Return a mock successful response for 404s
      return {
        status: 200,
        data: { message: 'Category already deleted (404)' }
      };
    }

    // Re-throw other errors
    throw error;
  }
} 
