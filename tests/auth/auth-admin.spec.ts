import { test, expect } from '@playwright/test';
import { getToken } from '../utils/auth';

test('should retrieve Admin token successfully', async () => {
  const {
    data: { token },
    status,
  } = await getToken(process.env.DEFAULT_USERNAME_ADMIN!);

  expect(token).not.toBeNull();
  expect(status).toBe(200);
  console.log('Successfully retrieved token for admin');
});
