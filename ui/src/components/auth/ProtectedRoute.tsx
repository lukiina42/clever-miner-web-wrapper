import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import useSessionTokens from '@/hook/useGetSession';
import { refreshAccessToken, verifyToken } from '@/api/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { tokens, updateTokens } = useSessionTokens();
  const isRunning = useRef(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (isRunning.current) return;
      isRunning.current = true;
      // If no tokens exist, redirect to login
      if (!tokens) {
        navigate({ to: '/auth/' });
        return;
      }

      // Verify the access token
      const isValid = await verifyToken(tokens.accessToken);

      if (isValid) {
        // Token is valid, allow access
      } else {
        // Token is invalid, try to refresh
        const refreshedTokens = await refreshAccessToken(tokens);

        if (refreshedTokens) {
          // Successfully refreshed, update tokens and allow access
          updateTokens(refreshedTokens);
        } else {
          // Refresh failed, redirect to login
          updateTokens(null);
          navigate({ to: '/auth/' });
        }
      }

      isRunning.current = false;
    };

    checkAuthentication();

    // Set up periodic token verification
    const intervalId = setInterval(
      async () => {
        checkAuthentication();
      },
      2 * 60 * 1000
    ); // 2 minutes

    return () => {
      clearInterval(intervalId);
    };
  }, [tokens, navigate, updateTokens]);

  if (!tokens) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
