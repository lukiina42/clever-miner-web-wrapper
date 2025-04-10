import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { exchangeCodeForTokens } from '@/api/auth.ts';
import useSessionTokens from '@/hook/useGetSession.ts';
import { Button } from '@/components/ui/button.tsx';

export default function OauthCallback() {
  const navigate = useNavigate();
  const { updateTokens } = useSessionTokens();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: exchangeCodeForTokens,
    onSuccess: (data) => {
      updateTokens(data);

      // Redirect to home or dashboard
      navigate({ to: '/' });
    },
    onError: (err: any) => {
      console.error('Authentication error:', err);
      const errorMessage = err?.message || 'Unknown error';
      setErrorDetails(
        typeof err.response === 'object' ? JSON.stringify(err.response, null, 2) : errorMessage
      );
    },
  });

  useEffect(() => {
    // Get the code from URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      // Exchange code for tokens
      mutate(code);
    } else {
      // Handle missing code error
      setErrorDetails('No authorization code found in the URL');
      navigate({ to: '/auth' });
    }
  }, [mutate, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Processing your login</h2>
          <p className="text-gray-600">Please wait while we complete the authentication...</p>
        </div>
      </div>
    );
  }

  if (isError || errorDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Failed to complete authentication'}
          </p>
          {errorDetails && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md text-left overflow-auto max-w-lg max-h-48">
              <pre className="text-xs">{errorDetails}</pre>
            </div>
          )}
          <Link to="/auth" className="mt-6 block">
            <Button type="button" className="cursor-pointer bg-black hover:bg-gray-800 w-44">
              Return to login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // This will show briefly before the redirect happens
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Login Successful</h2>
        <p className="text-gray-600">Redirecting you to the dashboard...</p>
      </div>
    </div>
  );
}
