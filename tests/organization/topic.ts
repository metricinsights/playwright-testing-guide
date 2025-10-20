import { Page, expect } from '@playwright/test';
import { apiInstance, loginAsAdmin } from '../utils/auth';

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
  await page.getByText('Content', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText('Content', { exact: true }).click();
  await page.locator('[data-test="content_tags"]').click();
  await page.locator('[data-test="grid_topicGrid_buttons_add_button"]').waitFor({ state: 'visible' });
  await page.locator('[data-test="grid_topicGrid_buttons_add_button"]').click();

  await page.click("input[name='name']");

  await page.getByRole('textbox').fill(topicName);
  await page.locator('[data-test="popup_p_grid_popup_topicGrid_ok_button"]').click();

  console.log('tag created=)');
}

export async function deleteTagByUi(page: Page, topicName: string) {
  await loginAsAdmin(page);
  await page.getByText('Content', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText('Content', { exact: true }).click();
  await page.locator('[data-test="content_tags"]').click();

  await page.waitForLoadState('load');
  await page.getByPlaceholder('Search').click();
  await page.getByPlaceholder('Search').fill(topicName);
  await page.waitForLoadState('load');
  await expect(page.getByRole('link', { name: topicName })).toBeVisible();
  await page.getByRole('link', { name: topicName }).click();
  await page.getByLabel('Delete').click();
  await page.waitForSelector("//button[text()='Delete']", { timeout: 5000 });
  await page.locator("//button[text()='Delete']").click();

  console.log('tag deleted=)');
}
