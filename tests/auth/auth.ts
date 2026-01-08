import axios from 'axios';
import { Page } from '@playwright/test';

export const instanceBaseUrl = process.env.BASE_URL;

export const powerId: number = parseInt(process.env.POWER_ID || '0', 10);
export const regularId: number = parseInt(process.env.REGULAR_ID || '0', 10);
export const powerEmail = process.env.POWER_EMAIL;
export const regularEmail = process.env.REGULAR_EMAIL;

export const usernamePower = process.env.USERNAME_POWER;
export const usernameAdmin = process.env.USERNAME_ADMIN;

export const ADMIN = 'admin';
export const POWER = 'power';
export const REGULAR = 'regular';

export const USER_KEYS = [ADMIN, POWER, REGULAR] as const;

export type UserKey = (typeof USER_KEYS)[number];

export const users: { name: UserKey; username: string }[] = [
  { name: ADMIN, username: process.env.USERNAME_ADMIN! },
  { name: POWER, username: process.env.USERNAME_POWER! },
  { name: REGULAR, username: process.env.USERNAME_REGULAR! },
];

export const apiInstance = axios.create({
  baseURL: instanceBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export async function getToken(username: string) {
  const url = `/api/get_token/`;

  const response = await apiInstance.post<{ token: string; expires: string }>(url, {
    application_id: process.env.APPLICATION_ID,
    application_key: process.env.APPLICATION_KEY,
    user: username,
  });

  return response;
}

export async function getTokens() {
  const tokensStorage: Record<UserKey, string> = {} as Record<UserKey, string>;

  for (const user of users) {
    const username = user.username;
    const {
      data: { token },
    } = await getToken(username);

    tokensStorage[user.name] = token;
  }

  return tokensStorage;
}

export async function loginAsAdmin(page: Page) {
  await page.goto(`${process.env.BASE_URL}/login`);
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill(`${process.env.DEFAULT_USERNAME_ADMIN}`);
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill(`${process.env.DEFAULT_PASSWORD_ADMIN}`);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(`${process.env.BASE_URL}/home`, { waitUntil: 'networkidle', });
}
