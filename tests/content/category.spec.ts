import { test, expect } from '@playwright/test';
import { createCategory, deleteCategory } from './category';
import { ADMIN, POWER, REGULAR, getTokens } from '../utils/auth';

let tokens: Awaited<ReturnType<typeof getTokens>>;
let categoryId: number | undefined; // Variable to store categoryId
let powerID: number | undefined; // Variable to store powerID
let regularID: number | undefined; // Variable to store regularID

// Initialize tokens before running tests
test.beforeAll(async () => {
  tokens = await getTokens();
  powerID = Number(process.env.POWER_ID); // Ensure powerID is loaded and converted to a number
  regularID = Number(process.env.REGULAR_ID); // Ensure regularID is loaded and converted to a number
});

// Describe block for the suite
test.describe.serial('Category', () => {
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
      if (categoryId !== undefined) await deleteCategory(tokens[ADMIN], categoryId as number);
    } catch (error) {
      console.log('Failed to delete category in afterAll (might be already deleted)');
    }
  });
});
