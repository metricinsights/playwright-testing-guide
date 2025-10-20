import { apiInstance } from './auth';
import axios from 'axios';
import crypto from 'crypto';

export async function getGlossaryTerm(token: string, id?: string, baseUrl: string = `/api/glossary_term`) {
  const url = id ? `${baseUrl}/id/${id}` : baseUrl;

  const response = await apiInstance.get(url, {
    headers: {
      Token: token,
    },
  });

  return response;
}

export async function postGlossaryTerm(token: string, glossarySectionName: string) {
  const glossaryName = `Playwright_Glossary_${crypto.randomBytes(6).toString('hex')}`;
  try {
    const response = await apiInstance.post(
      '/api/glossary_term',
      {
        name: glossaryName,
        glossary_section: glossarySectionName,
        definition: '',
        business_owner: '',
        data_steward: '',
        technical_owner: '',
      },
      {
        headers: {
          Token: token,
        },
      },
    );

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Some error:', error.message, error.response?.data, error.response?.status);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

export async function deleteGlossaryTerm(token: string, id: number) {
  try {
    const response = await apiInstance.delete(`/api/glossary_term/id/${id}`, {
      headers: {
        Token: token,
      },
    });

    return response;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.warn(`Glossary term with ID ${id} already deleted. Skipping.`);

      return null;
    }

    throw error;
  }
}
