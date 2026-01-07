import { test, expect } from '@playwright/test';
import { ADMIN, POWER, REGULAR } from '../auth/auth';
import { getDefaultAdminToken, setupUsersAndTokens, cleanupUsers, getUserToken, getUserTokenWithoutAuth } from '../users/user';

//npm run test:dev stg70 user.spec.ts

let adminToken: string;
let users: { id: string; username: string; token: string; type: 'administrator' | 'power' | 'regular' }[] = [];
let tokens: {
  admin: string;
  power: string;
  regular: string;
};

test.describe.configure({ mode: 'serial' });

test.describe('User API tests', () => {
  test.beforeAll(async () => {
    test.setTimeout(60000);

    try {
      console.log('Fetching admin token...');
      adminToken = await getDefaultAdminToken();

      console.log('Setting up users and tokens...');
      users = await setupUsersAndTokens(adminToken);

      tokens = {
        admin: users.find((user) => user.type === 'administrator')?.token || '',
        power: users.find((user) => user.type === 'power')?.token || '',
        regular: users.find((user) => user.type === 'regular')?.token || '',
      };

      console.log(`Successfully created ${users.length} users`);
    } catch (error) {
      console.error('Failed to setup test users:', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    test.setTimeout(60000);

    try {
      console.log('Cleaning up test users...');
      await cleanupUsers(adminToken, users);
    } catch (error) {
      console.error('Failed to cleanup test users:', error);
      throw error;
    }
  });

  test('should create users and get tokens', async () => {
    expect(users).toBeDefined();
    expect(users.length).toBe(3);

    for (const user of users) {
      expect(user.token).toBeDefined();
    }
  });

  test.describe('Get Token API Tests', () => {
    test('All user types should receive tokens when logged in', async () => {
      const userTypes = [ADMIN, POWER, REGULAR] as const;

      for (const userType of userTypes) {
        const response = await getUserToken(tokens[userType]);

        expect(response.success).toBe(true);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data).toHaveProperty('token');
        expect(typeof response.data!.token).toBe('string');
        expect(response.data!.token.length).toBeGreaterThan(0);

        console.log(`${userType} user successfully received token`);
      }
    });

    test('Request without authentication should return empty data', async () => {
      const response = await getUserTokenWithoutAuth();

      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);

      console.log('Unauthenticated request properly returned empty data');
    });

    test('Verify returned token is valid and usable', async () => {
      const response = await getUserToken(tokens.admin);

      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      // Use the returned token to make another request
      const secondResponse = await getUserToken(response.data!.token);

      expect(secondResponse.success).toBe(true);
      expect(secondResponse.status).toBe(200);
      expect(secondResponse.data).toBeDefined();
      expect(secondResponse.data).toHaveProperty('token');

      console.log('Returned token is valid and usable for subsequent requests');
    });
  });
});
