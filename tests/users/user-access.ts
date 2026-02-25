import { apiInstance, powerId } from '../auth/auth';
import * as crypto from 'crypto';
import { AxiosResponse } from 'axios';

let metricId: number;

// Function to users access to metrics
export async function accessToMetric(token: string, elementId: number = metricId, userId: number = powerId) {
  const endpoint = `/api/user_element`;
  const headers = {
    token: token,
  };
  const accessToMetric = {
    element_id: elementId,
    user_id: userId,
  };

  const responseAccessToMetricForPower = await apiInstance.post<{
    user_element: { id: number; element_id: number; user_id: number };
  }>(endpoint, accessToMetric, { headers });

  return responseAccessToMetricForPower;
}

// Function to give power user access to the Dimension
export async function accessToDimension(token: string, dimensionId: number, userId: number = powerId) {
  const endpoint = `/api/user_dimension`;
  const headers = {
    token: token,
  };

  const accessToDimensionForPower = {
    dimension: dimensionId,
    scope_of_access: 'All Dimension Values',
    user: userId,
  };

  const responseAccessToDimensionForPower = await apiInstance.post<{
    user_dimension: { id: number; dimension: number; user: number };
  }>(endpoint, accessToDimensionForPower, { headers });

  return responseAccessToDimensionForPower;
}

export interface GroupMemberResponse {
  response: AxiosResponse;
  memberId: number;
}

export async function addingUserToGroup(token: string, user: number, group: number): Promise<GroupMemberResponse> {
  try {
    const response = await apiInstance.post(
      '/api/user_group_member/',
      {
        user: user,
        group: group,
      },
      {
        headers: {
          Token: token,
        },
      },
    );

    const memberId = response.data?.user_group_member?.id || 0;

    return { response, memberId };
  } catch (error: any) {
    // Handle 400 error (user might already be in the group)
    if (error.response?.status === 400) {
      console.log(`User ${user} may already be in group ${group} - continuing`);
      return { response: error.response, memberId: 0 };
    }
    throw error;
  }
}

export async function deleteUserFromGroup(token: string, id: number) {
  const response = await apiInstance.delete(`/api/user_group_member/id/${id}`, {
    headers: {
      Token: token,
    },
  });

  return response;
}

export async function createGroup(token: string, allAccess: string = 'no'): Promise<AxiosResponse> {
  const groupName = `Playwright_Group_${crypto.randomBytes(2).toString('hex')}`;

  const response = await apiInstance.post(
    '/api/user_group/',
    {
      name: groupName,
      all_access_group: allAccess,
      description: 'Group no priv and elements',
    },
    {
      headers: {
        Token: token,
      },
    },
  );

  return response;
}

export async function deleteGroup(token: string, Id: number) {
  const response = await apiInstance.delete(`/api/user_group/id/${Id}`, {
    headers: {
      Token: token,
    },
  });

  return response;
}
