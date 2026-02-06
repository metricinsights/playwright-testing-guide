import { Page } from '@playwright/test';
import { apiInstance, loginAsAdmin } from '../auth/auth';
import axios from 'axios';
import { nameGenerators, testLogger } from '../utils/test-helpers';

export async function getGlossaryTerm(token: string, id?: string, baseUrl: string = `/api/glossary_term`) {
  const url = id ? `${baseUrl}/id/${id}` : baseUrl;

  const response = await apiInstance.get(url, {
    headers: {
      Token: token,
    },
  });

  return response;
}

export async function postGlossaryTerm(token: string, glossarySectionName: string) {
  const glossaryName = nameGenerators.glossaryTerm();
  try {
    const response = await apiInstance.post(
      '/api/glossary_term',
      {
        name: glossaryName,
        glossary_section: glossarySectionName,
        definition: '',
        business_owner: '',
        data_steward: '',
        technical_owner: '',
      },
      {
        headers: {
          Token: token,
        },
      },
    );

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Some error:', error.message, error.response?.data, error.response?.status);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

export async function deleteGlossaryTerm(token: string, id: number) {
  try {
    const response = await apiInstance.delete(`/api/glossary_term/id/${id}`, {
      headers: {
        Token: token,
      },
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(`Glossary term with ID ${id} already deleted. Skipping.`);

      return null;
    }

    throw error;
  }
}

/**
 * Creates a Glossary Section via UI.
 * Returns the name of the created section.
 */
export async function createGlossarySectionByUi(page: Page, sectionName: string): Promise<string> {
  await loginAsAdmin(page);

  // Navigate to Glossary page
  await page.goto(`${process.env.BASE_URL}/editor/glossary`);
  await page.waitForLoadState('networkidle');

  // Click on Sections tab
  await page.locator('[data-test="menu_glossary--tab_section"]').waitFor({ state: 'visible'});
  await page.locator('[data-test="menu_glossary--tab_section"]').click();
  await page.waitForLoadState('networkidle');

  // Click Add button to create new section
  const addButton = page.locator('[data-test="grid_editor_glossary_section_grid_buttons_add_button"]');
  await addButton.waitFor({ state: 'visible' });
  await addButton.click();

  // Fill section name
  await page.locator('[data-test="name"] input').waitFor({ state: 'visible' });
  await page.locator('[data-test="name"] input').fill(sectionName);

  // Save the section
  await page.locator('[data-test="popup_p_grid_popup_topicTypeGrid_ok_button"]').click();
  await page.waitForLoadState('networkidle');

  testLogger.success(`Glossary section "${sectionName}" created`);

  return sectionName;
}

/**
 * Deletes a Glossary Section via UI.
 */
export async function deleteGlossarySectionByUi(page: Page, sectionName: string): Promise<void> {
  await loginAsAdmin(page);

  // Navigate to Glossary Sections
  await page.goto(`${process.env.BASE_URL}/editor/glossary`);
  await page.waitForLoadState('networkidle');

  // Click on Sections tab
  await page.locator('[data-test="menu_glossary--tab_section"]').waitFor({ state: 'visible'});
  await page.locator('[data-test="menu_glossary--tab_section"]').click();
  await page.waitForLoadState('networkidle');

  // Click on the section to open it
  await page.getByText(sectionName, { exact: true }).click();
  await page.waitForLoadState('networkidle');

  // Delete the section
  await page.locator('[data-test="form_button_delete"]').click();
  await page.locator('[data-test="popup_Delete Item_ok_button"]').waitFor({ state: 'visible' });
  await page.locator('[data-test="popup_Delete Item_ok_button"]').click();
  await page.waitForLoadState('networkidle');

  testLogger.cleanup(`Glossary section "${sectionName}" deleted`);
}

/**
 * Checks if a Glossary Section exists by name.
 * Returns the section name if found, null otherwise.
 */
export async function getOrCreateGlossarySection(
  page: Page,
  token: string,
  sectionName?: string,
): Promise<string | null> {
  // First, try to get existing glossary terms to find a section
  try {
    const res = await getGlossaryTerm(token);

    if (res.data.terms && res.data.terms.length > 0) {
      const existingSection = res.data.terms[0].section;
      testLogger.info(`Found existing glossary section: ${existingSection}`);

      return existingSection;
    }
  } catch {
    testLogger.info('No existing glossary terms found');
  }

  // If no existing section found, create one via UI
  const newSectionName = sectionName || nameGenerators.glossarySection();

  try {
    await createGlossarySectionByUi(page, newSectionName);

    return newSectionName;
  } catch (error) {
    testLogger.error('Failed to create glossary section', error);

    return null;
  }
}
