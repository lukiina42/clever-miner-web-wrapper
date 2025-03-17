import useSessionTokens from '@/hook/useGetSession';
import { refreshAccessToken, verifyToken } from '@/api/auth';

/**
 * Adds authentication headers to fetch options
 * @param options - Fetch options
 * @returns Fetch options with authentication headers
 */
export const addAuthHeaders = (options: RequestInit = {}): RequestInit => {
  const { tokens } = useSessionTokens.getState();

  if (!tokens) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  };
};

/**
 * Creates an authenticated fetch function
 * @returns A fetch function that automatically adds authentication headers
 */
export const createAuthFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    const authOptions = addAuthHeaders(options);
    return fetch(url, authOptions);
  };
};

/**
 * Authenticated fetch function with automatic token refresh
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Fetch response
 */
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { tokens, updateTokens } = useSessionTokens.getState();

  if (!tokens) {
    throw new Error('No authentication tokens available');
  }

  // First, try with the current token
  const authOptions = addAuthHeaders(options);
  let response = await fetch(url, authOptions);

  // If unauthorized, try to refresh the token and retry
  if (response.status === 401) {
    const isValid = await verifyToken(tokens.accessToken);

    if (!isValid) {
      const refreshedTokens = await refreshAccessToken(tokens);

      if (refreshedTokens) {
        // Update tokens and retry with new token
        updateTokens(refreshedTokens);

        // Retry the request with the new token
        const newAuthOptions = addAuthHeaders(options);
        return fetch(url, newAuthOptions);
      } else {
        // If refresh failed, throw an error
        throw new Error('Authentication failed and token refresh was unsuccessful');
      }
    }
  }

  return response;
};

/**
 * Check if the user is authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const { tokens } = useSessionTokens.getState();
  return !!tokens;
};

/**
 * Get the current user from the session
 * @returns User object or null if not authenticated
 */
export const getCurrentUser = () => {
  const { tokens } = useSessionTokens.getState();
  return tokens?.user || null;
};

/**
 * Logout the user by removing tokens
 */
export const logout = () => {
  const { updateTokens } = useSessionTokens.getState();
  updateTokens(null);
};
