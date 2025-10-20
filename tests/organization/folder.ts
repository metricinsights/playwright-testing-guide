import { apiInstance } from '../utils/auth';
import { AxiosResponse, AxiosError } from 'axios';

import { Page } from '@playwright/test';

export async function deleteFolder(token: string, folderId: number): Promise<AxiosResponse | AxiosError> {
  return await apiInstance.delete(`/api/folder/id/${folderId}`, {
    headers: {
      Token: token,
    },
  });
}

export async function createFolder(folderName: string, token: string) {
  const response = await apiInstance.post(
    '/api/folder',
    {
      name: folderName,
      description: 'Folder created by automated test',
      visible: 'Y',
      visible_on_mobile: 'N',
      include_in_export: 'Y',
    },
    {
      headers: {
        token: token,
      },
    },
  );

  return response;
}

//Add some privillage to the group
export async function addSpecificPrivilegeToGroup(page: Page, groupId: number, privilegeName: string) {
  await page.goto(`${process.env.BASE_URL}/editor/group/${groupId}#privileges`);

  const addPrivilegeButton = page.getByRole('button', { name: 'Privilege', exact: true });
  await addPrivilegeButton.waitFor({ state: 'visible' });
  await addPrivilegeButton.click();

  const searchPlaceholder = page
    .locator('[data-test="popup_p_grid_popup_userGroupPrivilegeGrid"]')
    .getByPlaceholder('Search');
  await searchPlaceholder.waitFor({ state: 'visible' });
  await searchPlaceholder.click();
  await searchPlaceholder.fill(privilegeName);

  const selectAllcheckbox = page.getByLabel('Select All');

  await selectAllcheckbox.check();

  const savePopUpButton = await page.locator('[data-test="popup_p_grid_popup_userGroupPrivilegeGrid_ok_button"]');

  await savePopUpButton.click();
}
