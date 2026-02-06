import { test, expect } from '@playwright/test';
import { getTopics, checkRequestById, createTagByUi, deleteTagByUi } from './topic';
import { getDefaultAdminToken, setupUsersAndTokens } from '../users/user';

let firstIdAdmin: number | undefined;
let firstIdPower: number | undefined;
let firstIdRegular: number | undefined;
let users: { id: string; username: string; token: string; type: 'administrator' | 'power' | 'regular' }[] = [];
let adminTokenDefault: string;
let adminToken: string;
let powerToken: string;
let regularToken: string;

const randomNumber = Math.floor(1000 + Math.random() * 9000);
const topicName = `Playwright_Topic_${randomNumber}`;

//npm run test:dev staging topic.spec.ts

test.beforeAll(async () => {

});

test.describe.serial('GET /api/topic', () => {
  test('Create users and get tokens', async () => {
    adminTokenDefault = await getDefaultAdminToken();
    console.log('Successfully retrieved default admin token');

    //Creating Admin / PU / RU
    users = await setupUsersAndTokens(adminTokenDefault);

    adminToken = users.find((user) => user.type === 'administrator')?.token || '';
    powerToken = users.find((user) => user.type === 'power')?.token || '';
    regularToken = users.find((user) => user.type === 'regular')?.token || '';

    expect(adminToken).toBeDefined();
    expect(powerToken).toBeDefined();
    expect(regularToken).toBeDefined();

    console.log(`Successfully created ${users.length} test users`);
  });

  test('Create Tag by UI', async ({ page }) => {
    await createTagByUi(page, topicName);
    await page.close();
  });

  test('Take first tagID from GET request', async () => {
    const responseAdmin = await getTopics(adminToken, 'Admin');

    firstIdAdmin = responseAdmin.data.topics[0].id;

    const responsePower = await getTopics(powerToken, 'Power');

    firstIdPower = responsePower.data.topics[0].id;

    const responseRegular = await getTopics(regularToken, 'Regular');

    firstIdRegular = responseRegular.data.topics[0].id;

    expect([firstIdAdmin, firstIdPower, firstIdRegular]).toBeDefined();
    expect(responseAdmin.status).toBe(200);
    expect(responsePower.status).toBe(200);
    expect(responseRegular.status).toBe(200);

    expect(responseAdmin.data.topics[0]).toHaveProperty('name');
    expect(responsePower.data.topics[0]).toHaveProperty('name');
    expect(responseRegular.data.topics[0]).toHaveProperty('name');
  });

  test('Parallel checkRequestById', async () => {
    const [responseAdmin, responsePower, responseRegular] = await Promise.all([
      checkRequestById('Admin', firstIdAdmin, adminToken),
      checkRequestById('Power', firstIdPower, powerToken),
      checkRequestById('Regular', firstIdRegular, regularToken),
    ]);

    expect(responseAdmin.data).toHaveProperty('topic');
    expect(responseAdmin.data.topic.id).toBe(firstIdAdmin);
    expect(responseAdmin.status).toBe(200);
    expect(responseAdmin.data.topic).toHaveProperty('name');

    expect(responsePower.data).toHaveProperty('topic');
    expect(responsePower.data.topic.id).toBe(firstIdPower);
    expect(responsePower.status).toBe(200);
    expect(responsePower.data.topic).toHaveProperty('name');

    expect(responseRegular.data).toHaveProperty('topic');
    expect(responseRegular.data.topic.id).toBe(firstIdRegular);
    expect(responseRegular.status).toBe(200);
    expect(responseRegular.data.topic).toHaveProperty('name');
  });

  test('Negative case - GET topics with NoToken', async () => {
    const response = await getTopics(``, `Admin`);

    expect(response.status).toBe(401);
    expect(response.data).toHaveProperty('message', 'Unauthorized');

    console.log(response.data, response.status);
  });

  test('Delete Tag by UI', async ({ page }) => {
    await deleteTagByUi(page, topicName);
    await page.close();
  });
});
