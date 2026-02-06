import { test, expect } from '@playwright/test';
import { getDefaultAdminToken, setupUsersAndTokens, cleanupUsers, createUser, getToken, deleteUser } from '../users/user';
import {
  getGlossaryTerm,
  postGlossaryTerm,
  deleteGlossaryTerm,
  getOrCreateGlossarySection,
  deleteGlossarySectionByUi,
} from './glossary-term';
import { addingUserToGroup } from '../users/user-access';

import axios from 'axios';

//npm run test:dev staging glossary-term.spec.ts

let users: { id: string; username: string; token: string; type: 'administrator' | 'power' | 'regular' }[] = [];

let adminTokenDefault: string;
let adminToken: string;
let powerToken: string;
let regularToken: string;

let newTokenPower: string;
let newPowerId: string;

let glossarySection: string;
let createdSectionName: string | null = null; // Track if we created the section (for cleanup)
let userTokens: { token: string; userType: string }[] = [];
let createdGlossaryTermAdminId: number;
let createdGlossaryTermPowerId: number;

let puAndRuTokens: { token: string; userType: string }[] = [];

test.describe.serial('Checks', () => {
  test('Create users and get tokens, added default group for this users', async () => {
    adminTokenDefault = await getDefaultAdminToken();
    console.log('Successfully retrieved default admin token');

    //Creating Admin / PU / RU
    users = await setupUsersAndTokens(adminTokenDefault);

    adminToken = users.find((user) => user.type === 'administrator')?.token || '';
    powerToken = users.find((user) => user.type === 'power')?.token || '';
    regularToken = users.find((user) => user.type === 'regular')?.token || '';

    const powerId = Number(users.find((user) => user.type === 'power')?.id || 0);
    const regularId = Number(users.find((user) => user.type === 'regular')?.id || 0);

    console.log(powerId, '- Power User', regularId, '- Regular User');

    expect(adminToken).toBeDefined();
    expect(powerToken).toBeDefined();
    expect(regularToken).toBeDefined();

    console.log(`Successfully created ${users.length} test users`);

    userTokens = [
      { token: adminToken, userType: 'Admin' },
      { token: powerToken, userType: 'Power User' },
      { token: regularToken, userType: 'Regular User' },
    ];

    //Adding group to the created users
    const response1 = await addingUserToGroup(adminToken, powerId, 1);

    console.log(response1.data, 'PU added to the default group');

    const response2 = await addingUserToGroup(adminToken, regularId, 1);

    console.log(response2.data, 'RU added to the default group');
  });

  test('Setup glossary section (create via UI if needed)', async ({ page }) => {
    // Try to get existing section from API, or create one via UI
    glossarySection = await getOrCreateGlossarySection(page, adminToken) || '';

    expect(glossarySection).not.toBeNull();
    console.log(`Using glossary section: ${glossarySection}`);

    // Check if we created a new section (for cleanup)
    const res = await getGlossaryTerm(adminToken);

    if (res.data.terms.length === 0 && glossarySection) {
      createdSectionName = glossarySection;
      console.log(`Created new section "${createdSectionName}" - will be cleaned up after tests`);
    }
  });

  test('get glossaryTerm and glossaryTerm_by_ID as Admin / PU / RU', async () => {
    // First create a term so we have something to test with
    const createRes = await postGlossaryTerm(adminToken, glossarySection);

    expect(createRes.status).toBe(201);

    const testTermId = createRes.data.term.id;

    for (const { token, userType } of userTokens) {
      //Check all glossaryTerm
      const res = await getGlossaryTerm(token);

      expect(res.status).toBe(200);
      expect(res.data.terms.length).toBeGreaterThan(0);

      const firstGlossaryId = res.data.terms[0].id;

      //Check all glossaryTerm_by_ID
      const resById = await getGlossaryTerm(token, firstGlossaryId);

      expect(resById.status).toBe(200);

      console.log('for:', userType, resById.data);
    }

    // Cleanup the test term
    await deleteGlossaryTerm(adminToken, testTermId);
  });

  test('post - Create glossaryTerm as Admin', async () => {
    const res = await postGlossaryTerm(adminToken, glossarySection);

    expect(res.status).toBe(201);

    createdGlossaryTermAdminId = res.data.term.id;

    console.log(res.data, createdGlossaryTermAdminId);
  });

  test('check that created glossaryTerm at the list by Admin', async () => {
    const res = await getGlossaryTerm(adminToken);

    expect(res.status).toBe(200);

    const glossaryTermInList = res.data.terms.some((term: { id: number }) => term.id === createdGlossaryTermAdminId);

    expect(glossaryTermInList).toBe(true);

    //console.log('----------', glossaryTermInList);
  });

  test('post - Create glossaryTerm as POWER with Privilege ', async () => {
    const res = await postGlossaryTerm(powerToken, glossarySection);

    expect(res.status).toBe(201);

    createdGlossaryTermPowerId = res.data.term.id;

    console.log(res.data, createdGlossaryTermPowerId);
  });

  test('check that created glossaryTerm at the list by Power', async () => {
    const res = await getGlossaryTerm(powerToken);

    expect(res.status).toBe(200);

    const glossaryTermInList = res.data.terms.some((term: { id: number }) => term.id === createdGlossaryTermPowerId);

    expect(glossaryTermInList).toBe(true);

    //console.log('----------', glossaryTermInList);
  });

  test('delete glossaryTerm as Admin and Power', async () => {
    for (const { token, glossaryTermId, userType } of [
      { token: adminToken, glossaryTermId: createdGlossaryTermAdminId, userType: 'Admin' },
      { token: powerToken, glossaryTermId: createdGlossaryTermPowerId, userType: 'Power' },
    ]) {
      const res = await deleteGlossaryTerm(token, glossaryTermId);

      expect(res?.status).toBe(200);

      console.log(`Glossary term deleted by ${userType}`);
    }
  });

  test('delete glossary by Power with no Privilege and Regular User', async () => {
    for (const { token, userType } of puAndRuTokens) {
      try {
        const res = await deleteGlossaryTerm(token, createdGlossaryTermPowerId);

        throw new Error(`Expected 403, but received ${res?.status}`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(403);
          expect(error.response.data).toHaveProperty(
            'message',
            'You do not have permission to delete a Glossary Term',
          );

          console.log(error.response.data, `delete is not possible by ${userType}`);
        } else {
          throw error;
        }
      }
    }
  });

  test.describe('Negative cases', () => {
    test('create PU without default group / GET token for this PU', async () => {
      //Create new power user
      const res = await createUser(adminTokenDefault, 'power', '', 'N');

      newPowerId = res.id;

      expect(newPowerId).toBeDefined();

      const username = res.username;

      //getToken for new Power User
      newTokenPower = await getToken(username);

      expect(newTokenPower).toBeDefined();

      puAndRuTokens = [
        { token: newTokenPower, userType: 'Power User' },
        { token: regularToken, userType: 'Regular User' },
      ];
    });

    test('post - Create glossaryTerm as POWER with no Privilege and Regular User', async () => {
      if (!Array.isArray(puAndRuTokens) || puAndRuTokens.length === 0) {
        throw new Error('puAndRuTokens is undefined or empty');
      }

      for (const { token, userType } of puAndRuTokens) {
        try {
          const res = await postGlossaryTerm(token, glossarySection);

          throw new Error(`Expected 403, but received ${res?.status}`);
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            expect(error.response.status).toBe(403);
            expect(error.response.data).toHaveProperty('message', 'You do not have permission to create a Glossary Term');

            console.log(error.response.data, `post is not possible by ${userType}`);
          } else {
            throw error;
          }
        }
      }
    });
  });

  test('check that both created glossaryTerm not at the list after deletion', async () => {
    const res = await getGlossaryTerm(adminToken);

    expect(res.status).toBe(200);

    const termsNotInList = res.data.terms.every(
      (term: { id: number }) => term.id !== createdGlossaryTermPowerId && term.id !== createdGlossaryTermAdminId,
    );

    expect(termsNotInList).toBe(true);
  });

  test.afterAll(async ({ browser }) => {
    // Cleanup glossary terms if they were created
    if (createdGlossaryTermAdminId) {
      await deleteGlossaryTerm(adminToken, createdGlossaryTermAdminId);
    }
    if (createdGlossaryTermPowerId) {
      await deleteGlossaryTerm(powerToken, createdGlossaryTermPowerId);
    }

    // Cleanup the section if we created it
    if (createdSectionName) {
      const page = await browser.newPage();

      try {
        await deleteGlossarySectionByUi(page, createdSectionName);
      } catch (error) {
        console.warn(`Failed to delete glossary section: ${error}`);
      } finally {
        await page.close();
      }
    }

    // Cleanup users
    if (newPowerId) {
      await deleteUser(adminTokenDefault, newPowerId);
    }
    await cleanupUsers(adminTokenDefault, users);
  });
});
