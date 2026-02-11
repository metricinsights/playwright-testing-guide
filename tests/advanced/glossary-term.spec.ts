import { test, expect } from '@playwright/test';
import { cleanupUsers, createUser, getToken, deleteUser } from '../users/user';
import {
  getGlossaryTerm,
  postGlossaryTerm,
  deleteGlossaryTerm,
  getOrCreateGlossarySection,
  deleteGlossarySectionByUi,
} from './glossary-term';
import { initializeTestUsersWithGroup, testLogger } from '../utils/test-helpers';

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
  test.beforeAll(async ({ browser }) => {
    // Get users and tokens with group
    const userSetup = await initializeTestUsersWithGroup(1);

    adminTokenDefault = userSetup.adminTokenDefault;
    adminToken = userSetup.adminToken;
    powerToken = userSetup.powerToken;
    regularToken = userSetup.regularToken;
    users = userSetup.users;

    const powerId = userSetup.powerId;
    const regularId = userSetup.regularId;

    testLogger.info(`Power User ID: ${powerId}, Regular User ID: ${regularId}`);

    userTokens = [
      { token: adminToken, userType: 'Admin' },
      { token: powerToken, userType: 'Power User' },
      { token: regularToken, userType: 'Regular User' },
    ];

    // Setup glossary section (create via UI if needed)
    const glossarySectionSetupPage = await browser.newPage();

    try {
      const glossarySectionResult = await getOrCreateGlossarySection(glossarySectionSetupPage, adminToken);

      if (!glossarySectionResult) {
        throw new Error('Failed to get or create glossary section');
      }

      glossarySection = glossarySectionResult;
      testLogger.info(`Using glossary section: ${glossarySection}`);

      // Check if we created a new section (for cleanup)
      const glossaryTermsResponse = await getGlossaryTerm(adminToken);

      if (glossaryTermsResponse.data.terms.length === 0) {
        createdSectionName = glossarySection;
        testLogger.info(`Created new section "${createdSectionName}" - will be cleaned up after tests`);
      }
    } finally {
      await glossarySectionSetupPage.close();
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

      testLogger.info(`${userType} can access glossary term`, `ID: ${firstGlossaryId}`);
    }

    // Cleanup the test term
    await deleteGlossaryTerm(adminToken, testTermId);
  });

  test('post - Create glossaryTerm as Admin', async () => {
    const res = await postGlossaryTerm(adminToken, glossarySection);

    expect(res.status).toBe(201);

    createdGlossaryTermAdminId = res.data.term.id;

    testLogger.success('Admin created glossary term', createdGlossaryTermAdminId);
  });

  test('check that created glossaryTerm at the list by Admin', async () => {
    const res = await getGlossaryTerm(adminToken);

    expect(res.status).toBe(200);

    const glossaryTermInList = res.data.terms.some((term: { id: number }) => term.id === createdGlossaryTermAdminId);

    expect(glossaryTermInList).toBe(true);
  });

  test('post - Create glossaryTerm as POWER with Privilege ', async () => {
    const res = await postGlossaryTerm(powerToken, glossarySection);

    expect(res.status).toBe(201);

    createdGlossaryTermPowerId = res.data.term.id;

    testLogger.success('Power user created glossary term', createdGlossaryTermPowerId);
  });

  test('check that created glossaryTerm at the list by Power', async () => {
    const res = await getGlossaryTerm(powerToken);

    expect(res.status).toBe(200);

    const glossaryTermInList = res.data.terms.some((term: { id: number }) => term.id === createdGlossaryTermPowerId);

    expect(glossaryTermInList).toBe(true);
  });

  test('delete glossaryTerm as Admin and Power', async () => {
    for (const { token, glossaryTermId, userType } of [
      { token: adminToken, glossaryTermId: createdGlossaryTermAdminId, userType: 'Admin' },
      { token: powerToken, glossaryTermId: createdGlossaryTermPowerId, userType: 'Power' },
    ]) {
      const res = await deleteGlossaryTerm(token, glossaryTermId);

      expect(res?.status).toBe(200);

      testLogger.success(`${userType} deleted glossary term`, glossaryTermId);
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
          expect(error.response.data).toHaveProperty('message', 'You do not have permission to delete a Glossary Term');

          testLogger.info(`${userType} cannot delete glossary term`, '403 Forbidden (expected)');
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
            expect(error.response.data).toHaveProperty(
              'message',
              'You do not have permission to create a Glossary Term',
            );

            testLogger.info(`${userType} cannot create glossary term`, '403 Forbidden (expected)');
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
      const cleanupPage = await browser.newPage();

      try {
        await deleteGlossarySectionByUi(cleanupPage, createdSectionName);
      } catch (error) {
        testLogger.warn(`Failed to delete glossary section: ${error}`);
      } finally {
        await cleanupPage.close();
      }
    }

    // Cleanup users
    if (newPowerId) {
      await deleteUser(adminTokenDefault, newPowerId);
    }
    await cleanupUsers(adminTokenDefault, users);
  });
});
