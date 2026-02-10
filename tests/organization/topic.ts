import { Page } from '@playwright/test';
import { apiInstance, loginAsAdmin } from '../auth/auth';

export async function getTopics(token: string, userType: string) {
  try {
    const response = await apiInstance.get('/api/topic', {
      headers: {
        Token: token,
      },
    });

    return response;
  } catch (error: any) {
    if (error.response) {
      return error.response;
    } else {
      throw new Error('Request failed with no response');
    }
  }
}

export async function checkRequestById(userType: string, firstId: number | undefined, token: string) {
  if (firstId === undefined) {
    throw new Error(`First ID for ${userType} undefined`);
  }
  const response = await apiInstance.get(`/api/topic/id/${firstId}`, {
    headers: {
      Token: token,
    },
  });
  console.log(`Response for ${userType}:`, response.data);

  return response;
}

export async function createTagByUi(page: Page, topicName: string) {
  await loginAsAdmin(page);

  // Open Content menu and navigate to Tags
  await page.locator('.navbar-menu__root-item:has-text("Content")').waitFor({ state: 'visible' });
  await page.locator('.navbar-menu__root-item:has-text("Content")').click();
  await page.locator('[data-test="content_tags"]').waitFor({ state: 'visible' });
  await page.locator('[data-test="content_tags"]').click();

  // Wait for page to load and click Add button
  // Different data-test attributes for empty vs non-empty states:
  // - Empty: grid_editor_topic_grid_buttons_add_button
  // - Non-empty: grid_topicGrid_buttons_add_button
  await page.waitForLoadState('networkidle');
  const emptyStateAddButton = page.locator('[data-test="grid_editor_topic_grid_buttons_add_button"]');
  const nonEmptyStateAddButton = page.locator('[data-test="grid_topicGrid_buttons_add_button"]');

  // Wait for either button to be visible
  try {
    await Promise.race([
      emptyStateAddButton.waitFor({ state: 'visible' }),
      nonEmptyStateAddButton.waitFor({ state: 'visible' }),
    ]);
  } catch {
    throw new Error('Tags page did not load - Add button not found');
  }

  // Click whichever button is visible
  if (await emptyStateAddButton.isVisible()) {
    await emptyStateAddButton.click();
  } else {
    await nonEmptyStateAddButton.click();
  }

  // Fill in the tag name
  await page.locator('[data-test="name"] input').waitFor({ state: 'visible' });
  await page.locator('[data-test="name"] input').fill(topicName);

  // Save the tag
  await page.locator('[data-test="popup_p_grid_popup_topicGrid_ok_button"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Tag created successfully');
}

export async function deleteTagByUi(page: Page, topicName: string) {
  await loginAsAdmin(page);

  // Open Content menu and navigate to Tags
  await page.locator('.navbar-menu__root-item:has-text("Content")').waitFor({ state: 'visible' });
  await page.locator('.navbar-menu__root-item:has-text("Content")').click();
  await page.locator('[data-test="content_tags"]').waitFor({ state: 'visible' });
  await page.locator('[data-test="content_tags"]').click();

  await page.waitForLoadState('networkidle');

  // Search for the tag using the grid's search input with data-test attribute
  const gridSearchInput = page.locator('[data-test="grid-filter-topicGrid-pattern_search"] input');

  await gridSearchInput.fill(topicName);
  await gridSearchInput.press('Enter');
  await page.waitForLoadState('networkidle');

  // Wait for filtered results to appear and click on the tag link
  await page.getByRole('link', { name: topicName, exact: true }).click();
  await page.waitForLoadState('networkidle');

  // Delete the tag
  await page.locator('[data-test="form_button_delete"]').click();
  await page.locator('[data-test="popup_Delete Tag_ok_button"]').waitFor({ state: 'visible' });
  await page.locator('[data-test="popup_Delete Tag_ok_button"]').click();
  await page.waitForLoadState('networkidle');

  console.log('Tag deleted successfully');
}
