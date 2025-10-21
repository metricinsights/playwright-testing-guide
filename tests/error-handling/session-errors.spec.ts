import { test, expect } from '@playwright/test';
import axios from 'axios';
import {
  allGet,
  allPost,
  allPut,
  allDelete,
  getRequests,
  postRequests,
  putRequests,
  deleteRequests,
} from './response-errors';

//npm run test:dev stg70 response412and401.spec.ts

test.describe.serial('response 412', () => {
  test('412 response for all GET requests', async () => {
    const failedUrls: string[] = [];
    for (const get of allGet) {
      const response = await getRequests(get);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(412);
          expect(response.response?.data).toHaveProperty('status', 'ERROR');
          expect(response.response?.data).toHaveProperty('message', 'Session expired');
        } catch {
          failedUrls.push(get);
          console.log(`FAILED GET: ${get}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for GET: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('412 response for all POST requests', async () => {
    const failedUrls: string[] = [];
    for (const post of allPost) {
      const response = await postRequests(post);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(412);
          expect(response.response?.data).toHaveProperty('status', 'ERROR');
          expect(response.response?.data).toHaveProperty('message', 'Session expired');
        } catch {
          failedUrls.push(post);
          console.log(`FAILED POST: ${post}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for POST: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('412 response for all PUT requests', async () => {
    const failedUrls: string[] = [];
    for (const put of allPut) {
      const response = await putRequests(put);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(412);
          expect(response.response?.data).toHaveProperty('status', 'ERROR');
          expect(response.response?.data).toHaveProperty('message', 'Session expired');
        } catch {
          failedUrls.push(put);
          console.log(`FAILED PUT: ${put}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for PUT: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('412 response for all DELETE requests', async () => {
    const failedUrls: string[] = [];
    for (const del of allDelete) {
      const response = await deleteRequests(del);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(412);
          expect(response.response?.data).toHaveProperty('status', 'ERROR');
          expect(response.response?.data).toHaveProperty('message', 'Session expired');
        } catch {
          failedUrls.push(del);
          console.log(`FAILED DELETE: ${del}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for DELETE: ${failedUrls.join(', ')}`).toHaveLength(0);
  });
});

test.describe.serial('response 401', () => {
  test('401 response for all GET requests', async () => {
    const failedUrls: string[] = [];
    for (const get of allGet) {
      const response = await getRequests(get, false);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(401);
          expect(response.response?.data).toHaveProperty('message', 'Unauthorized');
        } catch {
          failedUrls.push(get);
          console.log(`FAILED GET: ${get}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for GET: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('401 response for all POST requests', async () => {
    const failedUrls: string[] = [];
    for (const post of allPost) {
      const response = await postRequests(post, false);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(401);
          expect(response.response?.data).toHaveProperty('message', 'Unauthorized');
        } catch {
          failedUrls.push(post);
          console.log(`FAILED POST: ${post}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for POST: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('401 response for all PUT requests', async () => {
    const failedUrls: string[] = [];
    for (const put of allPut) {
      const response = await putRequests(put, false);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(401);
          expect(response.response?.data).toHaveProperty('message', 'Unauthorized');
        } catch {
          failedUrls.push(put);
          console.log(`FAILED PUT: ${put}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for PUT: ${failedUrls.join(', ')}`).toHaveLength(0);
  });

  test('401 response for all DELETE requests', async () => {
    const failedUrls: string[] = [];
    for (const del of allDelete) {
      const response = await deleteRequests(del, false);

      if (axios.isAxiosError(response)) {
        try {
          expect(response.response?.status).toBe(401);
          expect(response.response?.data).toHaveProperty('message', 'Unauthorized');
        } catch {
          failedUrls.push(del);
          console.log(`FAILED DELETE: ${del}\nStatus: ${response.response?.status}\nData:`, response.response?.data);
        }
      }
    }
    expect(failedUrls, `Failed URLs for DELETE: ${failedUrls.join(', ')}`).toHaveLength(0);
  });
});
