import { test, expect } from '@playwright/test';
import { ADMIN, getTokens, POWER, REGULAR } from '../utils/auth';
import { getTopics, checkRequestById, createTagByUi, deleteTagByUi } from './topic';

let tokens: Awaited<ReturnType<typeof getTokens>>; // have to be in the each file for getToken
let firstIdAdmin: number | undefined;
let firstIdPower: number | undefined;
let firstIdRegular: number | undefined;

const randomNumber = Math.floor(1000 + Math.random() * 9000);
const topicName = `Playwright_Topic_${randomNumber}`;

//має бути axios npm run test:dev stg70 або npm run test:dev stg70 topic.spec.ts

test.beforeAll(async () => {
  // have to be in the each file for getToken
  tokens = await getTokens();
});

test.describe.serial('GET /api/topic', () => {
  test('Create Tag by UI', async ({ page }) => {
    await createTagByUi(page, topicName);
    await page.close();
  });

  test('Take first tagID from GET request', async () => {
    const responseAdmin = await getTopics(tokens[ADMIN], 'Admin');

    firstIdAdmin = responseAdmin.data.topics[0].id;

    const responsePower = await getTopics(tokens[POWER], 'Power');

    firstIdPower = responsePower.data.topics[0].id;

    const responseRegular = await getTopics(tokens[REGULAR], 'Regular');

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
      checkRequestById('Admin', firstIdAdmin, tokens[ADMIN]),
      checkRequestById('Power', firstIdPower, tokens[POWER]),
      checkRequestById('Regular', firstIdRegular, tokens[REGULAR]),
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
