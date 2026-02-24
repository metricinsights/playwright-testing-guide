import axios from 'axios';
import * as crypto from 'crypto';
import { addingUserToGroup, createGroup } from './user-access';
import { testLogger } from '../utils/test-helpers';

export const instanceBaseUrl = process.env.BASE_URL;

export const USER_TYPE_ADMIN = 'administrator';
export const USER_TYPE_POWER = 'power';
export const USER_TYPE_REGULAR = 'regular';

export const USER_KEYS = [USER_TYPE_ADMIN, USER_TYPE_POWER, USER_TYPE_REGULAR] as const;

export type UserKey = (typeof USER_KEYS)[number];

export interface User {
  id: string;
  username: string;
  email: string;
  type: UserKey;
  enabled: string;
  ldap: string;
  token?: string;
}

export interface ApiResponse {
  user: User;
}

export const apiInstance = axios.create({
  baseURL: instanceBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const DELAY_MS = 0;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_GET_TOKEN = '/api/get_token/';
const API_USER = '/api/user/';

export async function getDefaultAdminToken(): Promise<string> {
  try {
    const response = await apiInstance.post<{ token: string; expires: string }>(API_GET_TOKEN, {
      application_id: process.env.APPLICATION_ID,
      application_key: process.env.APPLICATION_KEY,
      user: process.env.DEFAULT_USERNAME_ADMIN,
    });

    return response.data.token;
  } catch (error) {
    console.error('Error getting default admin token:', error);
    throw error;
  }
}

async function retryCreateUser(token: string, userType: UserKey, retries = 3): Promise<User> {
  try {
    return await createUser(token, userType, '', 'N'); //user created without groups
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message.includes('Deadlock found when trying to get lock')) {
      if (retries > 0) {
        await delay(DELAY_MS);

        return retryCreateUser(token, userType, retries - 1);
      }
    }
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function createUser(
  token: string,
  userType: UserKey,
  groupId: string = '1',
  groupInd: 'Y' | 'N',
): Promise<User> {
  const uniqueUsername = `Playwright_${userType}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const uniqueEmail = `Playwright_+${crypto.randomBytes(6).toString('hex')}@metricinsights.com`;
  const userPassword = process.env.USER_PASSWORD; //review creation of password for each user

  const requestBody = {
    username: uniqueUsername,
    first_name: '',
    last_name: '',
    email: uniqueEmail,
    password: userPassword,
    type: userType,
    enabled: 'Y',
    copy_from_user_id: '',
    in_group_id: `${groupId}`,
    user_preference_template: '',
    default_group_ind: groupInd,
  };

  try {
    const response = await apiInstance.post<ApiResponse>(API_USER, requestBody, {
      headers: { Token: token },
    });

    return response.data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function getToken(username: string): Promise<string> {
  try {
    const response = await apiInstance.post<{ token: string; expires: string }>(API_GET_TOKEN, {
      application_id: process.env.APPLICATION_ID,
      application_key: process.env.APPLICATION_KEY,
      user: username,
    });

    return response.data.token;
  } catch (error) {
    console.error('Error getting token for user:', error);
    throw error;
  }
}

export async function setupUsersAndTokens(
  adminToken: string,
  userTypes: readonly UserKey[] = USER_KEYS,
): Promise<{ id: string; username: string; email: string; token: string; type: UserKey }[]> {
  const users: { id: string; username: string; email: string; token: string; type: UserKey }[] = [];

  for (const userType of userTypes) {
    const user = await retryCreateUser(adminToken, userType);

    if (user && user.username) {
      await delay(DELAY_MS);

      const token = await getToken(user.username);

      users.push({
        id: user.id,
        username: user.username,
        email: user.email,
        token,
        type: userType,
      });
    }

    await delay(DELAY_MS);
  }

  return users;
}

export async function deleteUser(adminToken: string, userId: string): Promise<void> {
  try {
    await apiInstance.delete(`${API_USER}id/${userId}`, {
      headers: { Token: adminToken },
    });
  } catch (error) {
    console.error(`Error deleting user with id ${userId}:`, error);
    throw error;
  }
}

export async function cleanupUsers(adminToken: string, users: { id: string }[]): Promise<void> {
  if (users) {
    for (const user of users) {
      await deleteUser(adminToken, user.id);
      await delay(DELAY_MS);
    }
  }
}

// Function to get user token for logged-in user via GET /api/get_token
export async function getUserToken(token: string) {
  const endpoint = `/api/get_token`;
  const headers = {
    Token: token,
  };

  try {
    const responseGetUserToken = await apiInstance.get<{ token: string; expires?: string }>(endpoint, { headers });

    return {
      success: true,
      data: responseGetUserToken.data,
      status: responseGetUserToken.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Unknown error',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
}

// Function to get user token without authentication via GET /api/get_token
export async function getUserTokenWithoutAuth() {
  const endpoint = `/api/get_token`;

  try {
    const responseGetUserToken = await apiInstance.get<{ token: string; expires?: string }>(endpoint);

    return {
      success: true,
      data: responseGetUserToken.data,
      status: responseGetUserToken.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Unknown error',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
    };
  }
}

// User setup helpers - interfaces
export interface TestUserTokens {
  adminTokenDefault: string;
  adminToken: string;
  powerToken: string;
  regularToken: string;
  users: Array<{
    id: string;
    username: string;
    token: string;
    type: 'administrator' | 'power' | 'regular';
  }>;
}

export interface TestUserTokensWithIds extends TestUserTokens {
  powerId: number;
  regularId: number;
  groupId: number;
  groupName: string;
}

/**
 * Initialize test users - creates specified user types with tokens
 * @param userTypes - array of user types to create (default: all 3)
 */
export async function initializeTestUsers(
  userTypes: UserKey[] = [USER_TYPE_ADMIN, USER_TYPE_POWER, USER_TYPE_REGULAR],
): Promise<TestUserTokens> {
  testLogger.setup('Initializing test users', `Types: ${userTypes.join(', ')}`);

  const adminTokenDefault = await getDefaultAdminToken();
  testLogger.info('Retrieved default admin token');

  const users = await setupUsersAndTokens(adminTokenDefault, userTypes);

  const adminToken = users.find((user) => user.type === 'administrator')?.token || '';
  const powerToken = users.find((user) => user.type === 'power')?.token || '';
  const regularToken = users.find((user) => user.type === 'regular')?.token || '';

  testLogger.info(`Created ${users.length} test users`);

  return {
    adminTokenDefault,
    adminToken,
    powerToken,
    regularToken,
    users,
  };
}

/**
 * Initialize test users with group assignment - creates users, creates a new group, and adds users to that group
 * @param allAccess - 'yes' for all access group, 'no' for regular group (default: 'no')
 * @param userTypes - array of user types to create (default: all 3)
 */
export async function initializeTestUsersWithGroup(
  allAccess: string = 'no',
  userTypes: UserKey[] = [USER_TYPE_ADMIN, USER_TYPE_POWER, USER_TYPE_REGULAR],
): Promise<TestUserTokensWithIds> {
  const baseSetup = await initializeTestUsers(userTypes);

  const powerId = Number(baseSetup.users.find((user) => user.type === 'power')?.id || 0);
  const regularId = Number(baseSetup.users.find((user) => user.type === 'regular')?.id || 0);

  testLogger.info('Creating new group for test users', `All access: ${allAccess}`);

  const groupResponse = await createGroup(baseSetup.adminToken || baseSetup.adminTokenDefault, allAccess);
  const groupId = groupResponse.data.user_group.id;
  const groupName = groupResponse.data.user_group.name;

  testLogger.info(`Created group: ${groupName}`, `ID: ${groupId}`);

  if (powerId) {
    await addingUserToGroup(baseSetup.adminToken || baseSetup.adminTokenDefault, powerId, groupId);
    testLogger.info(`Power user added to group ${groupId}`, `User ID: ${powerId}`);
  }

  if (regularId) {
    await addingUserToGroup(baseSetup.adminToken || baseSetup.adminTokenDefault, regularId, groupId);
    testLogger.info(`Regular user added to group ${groupId}`, `User ID: ${regularId}`);
  }

  return {
    ...baseSetup,
    powerId,
    regularId,
    groupId,
    groupName,
  };
}
