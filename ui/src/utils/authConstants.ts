import { baseApiUrl } from '@/utils/constants.ts';

/**
 * Authentication-related constants
 */
export const authConstants = {
  // Routes
  loginRoute: '/auth/',
  callbackRoute: '/oauth-callback',
  googleSignInUrl: `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(
    `${baseApiUrl}/auth/google/callback/`
  )}&prompt=consent&response_type=code&client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&scope=openid%20email%20profile&access_type=offline`,

  // Token-related
  tokenRefreshInterval: 2 * 60 * 1000, // 2 minutes
};
