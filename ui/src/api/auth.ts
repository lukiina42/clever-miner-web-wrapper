import { baseApiUrl } from '@/utils/constants.ts';
import { z } from 'zod';

const authApiUrl = `${baseApiUrl}/auth/google/login/`;

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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to exchange code for tokens');
  }

  const dataRaw = await response.json();
  const data = tokenResponseSchema.parse(dataRaw);

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
