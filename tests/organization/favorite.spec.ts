import { test, expect } from '@playwright/test';
import {
  createFavoriteFolder,
  getFavoriteFolders,
  addMetricToFavorite,
  isMetricInFF,
  deleteMetricFromFavorite,
  deleteFF,
} from './favorite';
import { createCategory, deleteCategory } from '../content/category';
import { createMetric, enableMetric, collectMetric, updateMetric, deleteMetric } from '../content/metric';
import { addingUserToGroup, createGroup } from '../users/user-access';
import { getDefaultAdminToken, setupUsersAndTokens, cleanupUsers } from '../users/user';

let adminFavoriteFolderId: number | undefined; // Variable to store Admin favoriteFolderId
let powerFavoriteFolderId: number | undefined; // Variable to store Power favoriteFolderId
let regularFavoriteFolderId: number | undefined; // Variable to store Regular favoriteFolderId
let metricId: number | undefined; // Variable to store metricId
const busAndTechnicalOwner = 'admin'; // Initialize with a default value

// Test variables
let adminTokenDefault: string;
let adminToken: string;
let powerToken: string;
let regularToken: string;
let categoryId: number | undefined;
let powerId: number;
let regularId: number;
let createdGroupId: number;
let groupName: string;
let users: {
  id: string;
  username: string;
  email: string;
  token: string;
  type: 'administrator' | 'power' | 'regular';
}[] = [];

//npm run test:dev stg70 favorite.spec.ts

// Initialize tokens before running tests
test.beforeAll(async () => {

});

// Describe block for the suite
test.describe.serial('Favorite Folder API Tests', () => {
  test('Initialize test users and create test group', async () => {
    //Create default admin token
    adminTokenDefault = await getDefaultAdminToken();

    //Create all type of users
    users = await setupUsersAndTokens(adminTokenDefault);

    adminToken = users.find((user) => user.type === 'administrator')?.token || '';
    powerToken = users.find((user) => user.type === 'power')?.token || '';
    regularToken = users.find((user) => user.type === 'regular')?.token || '';

    //Save all type of users id
    powerId = Number(users.find((user) => user.type === 'power')?.id || 0);
    regularId = Number(users.find((user) => user.type === 'regular')?.id || 0);

    expect(adminToken).toBeDefined();
    expect(powerToken).toBeDefined();
    expect(regularToken).toBeDefined();

    console.log(`Successfully created ${users.length} test users`);

    //Create group with all access for the user
    const response3 = await createGroup(adminToken, 'yes');
    createdGroupId = response3.data.user_group.id;
    groupName = response3.data.user_group.name;
    console.log(`Created group ID: ${createdGroupId}, Name: ${groupName}`);

    //Adding group to the created users
    const response1 = await addingUserToGroup(adminToken, powerId, createdGroupId);
    console.log(response1.data, 'PU added to the default group');

    const response2 = await addingUserToGroup(adminToken, regularId, createdGroupId); 
    console.log(response2.data, 'RU added to the default group');
  });

  test('Create favorite folder', async () => {
    // Step 1: Create a new favorite folder
    const responseCFF = await createFavoriteFolder(adminToken);

    // Check if response status is 201 and data contains the favorite folder
    if (responseCFF.status === 201 && responseCFF.data.favorite) {
      adminFavoriteFolderId = responseCFF.data.favorite.id;
      console.log('Created favorite folder with ID:', adminFavoriteFolderId);
      expect(responseCFF.status).toBe(201);
    } else {
      console.error('Favorite folder creation failed:', responseCFF.data);
      expect(responseCFF.status).toBe(201); // Fail the test if creation fails
    }
  });

  test('Verify that the new folder is present in the list via GET request', async () => {
    // Step 2: Verify the folder exists in the list
    const folders = await getFavoriteFolders(adminToken);
    const found = folders.some((folder: { id: number }) => folder.id === adminFavoriteFolderId);

    expect(found).toBe(true);
    console.log(`FF with ID ${adminFavoriteFolderId} found in the list.`);
  });

  test('Create Category', async () => {
    // Step 1: Create a new Category
    const responseCreateCategory = await createCategory(adminToken);

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



  test('Add metric to FF', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || adminFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or adminFavoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Add metric to FF
    const responseAddMetricToFavorite = await addMetricToFavorite(adminToken, adminFavoriteFolderId, metricId);

    expect(responseAddMetricToFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been added to favorite folder with ID ${adminFavoriteFolderId}.`);
  });

  test('Check metric is in FF via GET request', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || adminFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(adminToken, adminFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId exists in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was found in the favorite folder
    expect(foundFavoriteElement).toBe(true);
    console.log(`Metric with ID ${metricId} found in favorite folder with ID ${adminFavoriteFolderId}.`);
  });

  test('Delete metric from FF', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || adminFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Delete metric from FF
    const responseDeleteMetricFromFavorite = await deleteMetricFromFavorite(adminToken, 
      adminFavoriteFolderId, metricId);

    expect(responseDeleteMetricFromFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted from favorite folder with ID ${adminFavoriteFolderId}.`);
  });

  test('Check metric is NOT in FF via GET request', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || adminFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(adminToken, adminFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId does not exist in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was not found in the favorite folder
    expect(foundFavoriteElement).toBe(false);
    console.log(`Metric with ID ${metricId} is not in favorite folder with ID ${adminFavoriteFolderId}.`);
  });

  test('Delete FF', async () => {
    // Check if metricId is defined before proceeding
    if (adminFavoriteFolderId === undefined) {
      throw new Error('FavoriteFolderId is undefined. Ensure FavoriteFolderId was created successfully.');
    }

    // Delete metric
    const responseDeleteFF = await deleteFF(adminToken, adminFavoriteFolderId);

    expect(responseDeleteFF.status).toBe(200);
    console.log(`FF with ID ${adminFavoriteFolderId} has been deleted}.`);
  });
  test('Verify that the new folder is NOT in the list via GET request', async () => {
    // Step 2: Verify the folder doesn't exist in the list
    const folders = await getFavoriteFolders(adminToken);
    const found = folders.some((folder: { id: number }) => folder.id === adminFavoriteFolderId);

    expect(found).toBe(false);
    console.log(`FF with ID ${adminFavoriteFolderId} is not in the list.`);
  });

  test('Create favorite folder by Power', async () => {
    // Step 1: Create a new favorite folder
    const responseCFF = await createFavoriteFolder(powerToken);

    // Check if response status is 201 and data contains the favorite folder
    if (responseCFF.status === 201 && responseCFF.data.favorite) {
      powerFavoriteFolderId = responseCFF.data.favorite.id;
      console.log('Created favorite folder with ID:', powerFavoriteFolderId);
      expect(responseCFF.status).toBe(201);
    } else {
      console.error('Favorite folder creation failed:', responseCFF.data);
      expect(responseCFF.status).toBe(201); // Fail the test if creation fails
    }
  });

  test('Verify that the new folder is present in the list via GET request by Power', async () => {
    // Step 2: Verify the folder exists in the list
    const folders = await getFavoriteFolders(powerToken);
    const found = folders.some((folder: { id: number }) => folder.id === powerFavoriteFolderId);

    expect(found).toBe(true);
    console.log(`FF with ID ${powerFavoriteFolderId} found in the list.`);
  });

  test('Add metric to FF by Power', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || powerFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Add metric to FF
    const responseAddMetricToFavorite = await addMetricToFavorite(powerToken, powerFavoriteFolderId, metricId);

    expect(responseAddMetricToFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been added to favorite folder with ID ${powerFavoriteFolderId}.`);
  });

  test('Check metric is in FF via GET request by Power', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || powerFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(powerToken, powerFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId exists in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was found in the favorite folder
    expect(foundFavoriteElement).toBe(true);
    console.log(`Metric with ID ${metricId} found in favorite folder with ID ${powerFavoriteFolderId}.`);
  });

  test('Delete metric from FF by Power', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || powerFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Delete metric from FF
    const responseDeleteMetricFromFavorite = await deleteMetricFromFavorite(powerToken, 
      powerFavoriteFolderId, metricId);

    expect(responseDeleteMetricFromFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted from favorite folder with ID ${powerFavoriteFolderId}.`);
  });

  test('Check metric is NOT in FF via GET request by Power', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || powerFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(powerToken, powerFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId does not exist in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was not found in the favorite folder
    expect(foundFavoriteElement).toBe(false);
    console.log(`Metric with ID ${metricId} is not in favorite folder with ID ${powerFavoriteFolderId}.`);
  });

  test('Delete FF by Power', async () => {
    // Check if metricId is defined before proceeding
    if (powerFavoriteFolderId === undefined) {
      throw new Error('FavoriteFolderId is undefined. Ensure FavoriteFolderId was created successfully.');
    }

    // Delete metric
    const responseDeleteFF = await deleteFF(powerToken, powerFavoriteFolderId);

    expect(responseDeleteFF.status).toBe(200);
    console.log(`FF with ID ${powerFavoriteFolderId} has been deleted}.`);
  });

  test('Verify that the new folder is NOT in the list via GET request by Power', async () => {
    // Step 2: Verify the folder doesn't exist in the list
    const folders = await getFavoriteFolders(powerToken);
    const found = folders.some((folder: { id: number }) => folder.id === powerFavoriteFolderId);
    expect(found).toBe(false);
    console.log(`FF with ID ${powerFavoriteFolderId} is not in the list.`);
  });

  //---------------------------------------------------------------------------------------//

  test('Create favorite folder by Regular', async () => {
    // Step 1: Create a new favorite folder
    const responseCFF = await createFavoriteFolder(regularToken);

    // Check if response status is 201 and data contains the favorite folder
    if (responseCFF.status === 201 && responseCFF.data.favorite) {
      regularFavoriteFolderId = responseCFF.data.favorite.id;
      console.log('Created favorite folder with ID:', regularFavoriteFolderId);
      expect(responseCFF.status).toBe(201);
    } else {
      console.error('Favorite folder creation failed:', responseCFF.data);
      expect(responseCFF.status).toBe(201); // Fail the test if creation fails
    }
  });

  test('Verify that the new folder is present in the list via GET request by Regular', async () => {
    // Step 2: Verify the folder exists in the list
    const folders = await getFavoriteFolders(regularToken);
    const found = folders.some((folder: { id: number }) => folder.id === regularFavoriteFolderId);
    expect(found).toBe(true);
    console.log(`FF with ID ${regularFavoriteFolderId} found in the list.`);
  });

  test('Add metric to FF by Regular', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || regularFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Add metric to FF
    const responseAddMetricToFavorite = await addMetricToFavorite(regularToken, regularFavoriteFolderId, metricId);

    expect(responseAddMetricToFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been added to favorite folder with ID ${regularFavoriteFolderId}.`);
  });

  test('Check metric is in FF via GET request by Regular', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || regularFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(regularToken, regularFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId exists in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was found in the favorite folder
    expect(foundFavoriteElement).toBe(true);
    console.log(`Metric with ID ${metricId} found in favorite folder with ID ${regularFavoriteFolderId}.`);
  });

  test('Delete metric from FF by Regular', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined || regularFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Delete metric from FF
    const responseDeleteMetricFromFavorite = await deleteMetricFromFavorite(
      regularToken,
      regularFavoriteFolderId,
      metricId,
    );

    expect(responseDeleteMetricFromFavorite.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted from favorite folder with ID ${regularFavoriteFolderId}.`);
  });

  test('Check metric is NOT in FF via GET request by Regular', async () => {
    // Check if metricId and favoriteFolderId are defined before proceeding
    if (metricId === undefined || regularFavoriteFolderId === undefined) {
      throw new Error(
        'Either metricId or favoriteFolderId is undefined. Ensure metric and folder were created successfully',
      );
    }

    // Make API call to get the favorite folder elements
    const responseIsMetricInFF = await isMetricInFF(regularToken, regularFavoriteFolderId);

    // Access the favorite_elements array from the response data
    const favoriteElements = responseIsMetricInFF.data.favorite_elements;

    // Check if the metricId does not exist in the favorite folder's elements
    const foundFavoriteElement = favoriteElements.some(
      (element: { element_id: number }) => element.element_id === metricId,
    );

    // Assert that the metricId was not found in the favorite folder
    expect(foundFavoriteElement).toBe(false);
    console.log(`Metric with ID ${metricId} is not in favorite folder with ID ${regularFavoriteFolderId}.`);
  });

  test('Delete FF by Regular', async () => {
    // Check if metricId is defined before proceeding
    if (regularFavoriteFolderId === undefined) {
      throw new Error('FavoriteFolderId is undefined. Ensure FavoriteFolderId was created successfully.');
    }

    // Delete metric
    const responseDeleteFF = await deleteFF(regularToken, regularFavoriteFolderId);

    expect(responseDeleteFF.status).toBe(200);
    console.log(`FF with ID ${regularFavoriteFolderId} has been deleted}.`);
  });

  test('Verify that the new folder is NOT in the list via GET request by Regular', async () => {
    // Step 2: Verify the folder doesn't exist in the list
    const folders = await getFavoriteFolders(regularToken);
    const found = folders.some((folder: { id: number }) => folder.id === regularFavoriteFolderId);
    expect(found).toBe(false);
    console.log(`FF with ID ${regularFavoriteFolderId} is not in the list.`);
  });

  test('Delete metric', async () => {
    // Check if metricId is defined before proceeding
    if (metricId === undefined) {
      throw new Error('metricId is undefined. Ensure the metric was created successfully.');
    }

    // Delete the metric
    const responseDeleteMetric = await deleteMetric(adminToken, metricId);

    expect(responseDeleteMetric.status).toBe(200);
    console.log(`Metric with ID ${metricId} has been deleted.`);
  });

  test('Delete Category', async () => {
    // Check if categoryId is defined before proceeding
    if (categoryId === undefined) {
      throw new Error('categoryId is undefined. Ensure the category was created successfully.');
    }

    // Delete the category
    const responseDeleteCategory = await deleteCategory(adminToken, categoryId);

    expect(responseDeleteCategory.status).toBe(200);
    console.log(`Category with ID ${categoryId} has been deleted.`);
  });

  test.afterAll(async () => {
    // Cleanup metric (safety net in case explicit test failed)
    if (metricId !== undefined) {
      try {
        await deleteMetric(adminTokenDefault, metricId);
      } catch (error) {
        console.log('Failed to delete metric in afterAll:', (error as Error)?.message);
      }
    }

    // Cleanup category (safety net in case explicit test failed)
    if (categoryId !== undefined) {
      try {
        await deleteCategory(adminTokenDefault, categoryId);
      } catch (error) {
        console.log('Failed to delete category in afterAll:', (error as Error)?.message);
      }
    }

    // Deleted the last favorite folder, because the favorite FolderId variable was overwritten three times
    try {
      if (adminFavoriteFolderId !== undefined) await deleteFF(adminTokenDefault, adminFavoriteFolderId);
    } catch (error) {
      console.log('Failed to delete favorite folder in afterAll (might be already deleted)');
    }

    try {
      if (powerFavoriteFolderId !== undefined) await deleteFF(adminTokenDefault, powerFavoriteFolderId);
    } catch (error) {
      console.log('Failed to delete favorite folder in afterAll (might be already deleted)');
    }

    try {
      if (regularFavoriteFolderId !== undefined) await deleteFF(adminTokenDefault, regularFavoriteFolderId);
    } catch (error) {
      console.log('Failed to delete favorite folder in afterAll (might be already deleted)');
    }

    // Clean up users
    await cleanupUsers(adminTokenDefault, users);
  });
});
