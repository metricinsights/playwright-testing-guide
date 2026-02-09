import { expect } from '@playwright/test';
import { AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { getDefaultAdminToken, setupUsersAndTokens } from '../users/user';
import { addingUserToGroup } from '../users/user-access';

// Structured logging helper - universal for all tests
export const testLogger = {
  setup: (message: string, data?: string | number) => console.log(`🔧 SETUP: ${message}`, data || ''),
  success: (message: string, id?: number | string) => console.log(`✅ SUCCESS: ${message}${id ? ` (ID: ${id})` : ''}`),
  info: (message: string, details?: string) => console.log(`ℹ️  INFO: ${message}${details ? ` - ${details}` : ''}`),
  cleanup: (message: string, id?: number | string) => console.log(`🧹 CLEANUP: ${message}${id ? ` (ID: ${id})` : ''}`),
  error: (message: string, error: unknown) => console.error(`❌ ERROR: ${message}`, error),
  warn: (message: string, details?: string) => console.warn(`⚠️  WARNING: ${message}${details ? ` - ${details}` : ''}`),
};

// Universal constants for tests
export const TEST_CONSTANTS = {
  NON_EXISTENT_ID: 999999,
  RANDOM_BYTES_LENGTH: 4,
  EXPECTED_STATUS: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  TIMEOUTS: {
    DEFAULT: 60000,
    EXTENDED: 120000,
  },
};

// Universal name generators
export const nameGenerators = {
  dataSource: () =>
    `data source playwright_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  externalReport: () =>
    `Playwright_External_Report_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  externalReportTemplate: (type: string = 'Template') =>
    `Playwright_External_Report_Template_${type}_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  updatedExternalReportTemplate: () =>
    `Updated_Playwright_External_Report_Template_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  metric: () => `Playwright_Metric_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  dataset: () => `Playwright_Dataset_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  category: () => `Playwright_Category_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  glossarySection: () => `Playwright_Section_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  glossaryTerm: () => `Playwright_Glossary_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
  topic: () => `Playwright_Topic_${randomBytes(TEST_CONSTANTS.RANDOM_BYTES_LENGTH).toString('hex')}`,
};

// Universal response validation helpers
export function validateSuccessResponse<T>(
  response: AxiosResponse<T> | AxiosError,
  expectedStatus: number = TEST_CONSTANTS.EXPECTED_STATUS.SUCCESS,
): T {
  if ('data' in response) {
    expect(response.status).toBe(expectedStatus);

    return response.data;
  } else {
    throw new Error(`Expected successful response but got error: ${response.message}`);
  }
}

export function validateErrorResponse(
  error: unknown,
  expectedStatus: number,
  expectedMessageContains: string,
  testDescription: string,
) {
  if (axios.isAxiosError(error)) {
    expect(error.response?.status).toBe(expectedStatus);
    const errorData = error.response?.data as { message?: string };
    expect(errorData?.message || '').toContain(expectedMessageContains);
    testLogger.success(testDescription);
  } else {
    throw new Error(`Expected ${expectedStatus} error for ${testDescription}`);
  }
}

// Universal cleanup helpers
export async function cleanupResource<T extends string | number>(
  deleteFunction: (token: string, id: T) => Promise<AxiosResponse | AxiosError>,
  token: string,
  id: T,
  resourceType: string,
) {
  try {
    const deleteResponse = await deleteFunction(token, id);
    if ('status' in deleteResponse && deleteResponse.status === TEST_CONSTANTS.EXPECTED_STATUS.NO_CONTENT) {
      testLogger.cleanup(`Deleted ${resourceType}`, id);
    }
  } catch (error) {
    testLogger.error(`Failed to delete ${resourceType} ${id}`, error);
  }
}

export async function cleanupResources<T extends string | number>(
  deleteFunction: (token: string, id: T) => Promise<AxiosResponse | AxiosError>,
  token: string,
  ids: T[],
  resourceType: string,
) {
  for (const id of ids) {
    await cleanupResource(deleteFunction, token, id, resourceType);
  }
}

// User setup helpers to reduce code duplication across test suites
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
}

/**
 * Initialize test users - creates Admin, Power, and Regular users with tokens
 * Use this for simple test suites that only need user tokens
 */
export async function initializeTestUsers(): Promise<TestUserTokens> {
  testLogger.setup('Initializing test users');

  const adminTokenDefault = await getDefaultAdminToken();
  testLogger.info('Retrieved default admin token');

  const users = await setupUsersAndTokens(adminTokenDefault);

  const adminToken = users.find((user) => user.type === 'administrator')?.token || '';
  const powerToken = users.find((user) => user.type === 'power')?.token || '';
  const regularToken = users.find((user) => user.type === 'regular')?.token || '';

  expect(adminToken).toBeDefined();
  expect(powerToken).toBeDefined();
  expect(regularToken).toBeDefined();

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
 * Initialize test users with group assignment - creates users, extracts IDs, and adds to default group
 * Use this for test suites that need user IDs and group membership
 */
export async function initializeTestUsersWithGroup(groupId: number = 1): Promise<TestUserTokensWithIds> {
  const baseSetup = await initializeTestUsers();

  const powerId = Number(baseSetup.users.find((user) => user.type === 'power')?.id || 0);
  const regularId = Number(baseSetup.users.find((user) => user.type === 'regular')?.id || 0);

  testLogger.info('Adding users to default group', `Group ID: ${groupId}`);

  await addingUserToGroup(baseSetup.adminToken, powerId, groupId);
  testLogger.info(`Power user added to group ${groupId}:`, `User ID: ${powerId}`);

  await addingUserToGroup(baseSetup.adminToken, regularId, groupId);
  testLogger.info(`Regular user added to group ${groupId}`, `User ID: ${regularId}`);

  return {
    ...baseSetup,
    powerId,
    regularId,
  };
}
