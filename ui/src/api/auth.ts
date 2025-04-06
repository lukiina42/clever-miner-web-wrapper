import { baseApiUrl } from '@/utils/constants.ts';
import { z } from 'zod';

const authApiUrl = `${baseApiUrl}/auth/google/login/`;
const tokenRefreshUrl = `${baseApiUrl}/auth/token/refresh/`;
const tokenVerifyUrl = `${baseApiUrl}/auth/token/verify/`;

//zod schema of the interface:
const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: z.object({
    email: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
});

// Schema for token refresh response
const tokenRefreshResponseSchema = z.object({
  access: z.string(),
  refresh: z.string().optional(),
});

export type TokenResponse = z.infer<typeof tokenRefreshResponseSchema>;

export type TokenResponseCamelCase = {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
};

export const exchangeCodeForTokens = async (code: string): Promise<TokenResponseCamelCase> => {
  const response = await fetch(authApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let responseData;
    if (isJson) {
      responseData = await response.json();
    } 

    if (!response.ok) {
      console.error('Error response:', responseData);
      const error = new Error(
        responseData.error_description || 
        responseData.detail || 
        `Failed with status: ${response.status}`
      );
      // @ts-ignore
      error.response = responseData;
      // @ts-ignore
      error.status = response.status;
      throw error;
    }

  const data = tokenResponseSchema.parse(responseData);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: {
      email: data.user.email,
      firstName: data.user.first_name,
      lastName: data.user.last_name,
    },
  };
};

/**
 * Verifies if the current access token is valid
 * @returns Promise<boolean> - True if token is valid, false otherwise
 */
export const verifyToken = async (accessToken: string): Promise<boolean> => {
  if (!accessToken) {
    return false;
  }

  try {
    const response = await fetch(tokenVerifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: accessToken }),
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

/**
 * Refreshes the access token using the refresh token
 * @returns Promise<boolean> - True if refresh was successful, false otherwise
 */
export const refreshAccessToken = async (
  sessionState: TokenResponseCamelCase
): Promise<TokenResponseCamelCase | null> => {
  if (!sessionState?.refreshToken) {
    return null;
  }

  try {
    const response = await fetch(tokenRefreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: sessionState.refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const parsedData = tokenRefreshResponseSchema.parse(data);

    return {
      accessToken: parsedData.access,
      refreshToken: parsedData.refresh || sessionState.refreshToken, // Use the new refresh token if provided, otherwise keep the old one
      user: sessionState.user,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};
