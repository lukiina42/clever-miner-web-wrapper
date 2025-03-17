import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import useSessionTokens from './useGetSession';
import { refreshAccessToken, verifyToken } from '@/api/auth';

/**
 * Hook to handle authentication verification and token refreshing
 * @param redirectToLogin - Whether to redirect to login page if authentication fails
 * @returns Object containing authentication state
 */
const useAuthProtection = (redirectToLogin = true) => {
  const navigate = useNavigate();
  const { tokens, updateTokens } = useSessionTokens();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsVerifying(true);

      // If no tokens exist, redirect to login if specified
      if (!tokens) {
        if (redirectToLogin) {
          navigate({ to: '/auth/' });
        }
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // Verify the access token
      const isValid = await verifyToken(tokens.accessToken);

      if (isValid) {
        // Token is valid, allow access
        setIsAuthenticated(true);
        setIsVerifying(false);
      } else {
        // Token is invalid, try to refresh
        const refreshedTokens = await refreshAccessToken(tokens);

        if (refreshedTokens) {
          // Successfully refreshed, update tokens and allow access
          updateTokens(refreshedTokens);
          setIsAuthenticated(true);
          setIsVerifying(false);
        } else {
          // Refresh failed, redirect to login if specified
          updateTokens(null);
          setIsAuthenticated(false);
          if (redirectToLogin) {
            navigate({ to: '/auth/' });
          }
          setIsVerifying(false);
        }
      }
    };

    checkAuthentication();
  }, [tokens, navigate, updateTokens, redirectToLogin]);

  /**
   * Manually verify and refresh the token
   * @returns Promise<boolean> - True if authenticated, false otherwise
   */
  const verifyAndRefreshToken = async (): Promise<boolean> => {
    if (!tokens) {
      return false;
    }

    // Verify the access token
    const isValid = await verifyToken(tokens.accessToken);

    if (isValid) {
      return true;
    }

    // Token is invalid, try to refresh
    const refreshedTokens = await refreshAccessToken(tokens);

    if (refreshedTokens) {
      // Successfully refreshed, update tokens
      updateTokens(refreshedTokens);
      return true;
    }

    // Refresh failed
    updateTokens(null);
    if (redirectToLogin) {
      navigate({ to: '/auth/' });
    }
    return false;
  };

  return {
    isVerifying,
    isAuthenticated,
    verifyAndRefreshToken,
  };
};

export default useAuthProtection;
