// npm run test:dev stg70 tests/content/category.spec.ts

import { test, expect } from '@playwright/test';
import { createCategory, deleteCategory } from './category';
import { getDefaultAdminToken } from '../users/user';

let categoryId: number | undefined; // Variable to store categoryId
let adminTokenDefault: string;

// Initialize tokens before running tests
test.beforeAll(async () => {
  adminTokenDefault = await getDefaultAdminToken();
  console.log('Successfully retrieved default admin token');
});

// Describe block for the suite
test.describe.serial('Category', () => {
  test('Create Category', async () => {
    // Step 1: Create a new Category
    const responseCreateCategory = await createCategory(adminTokenDefault);

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

  test('Delete Category', async () => {
    // Check if Category is defined before proceeding
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure category was created successfully.');
    }

    // Delete category
    const responseDeleteCategory = await deleteCategory(adminTokenDefault, categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted}.`);
  });

  test.afterAll(async () => {
    try {
      if (categoryId !== undefined) await deleteCategory(adminTokenDefault, categoryId as number);
    } catch (error) {
      console.log('Failed to delete category in afterAll (might be already deleted)');
    }
  });
});
