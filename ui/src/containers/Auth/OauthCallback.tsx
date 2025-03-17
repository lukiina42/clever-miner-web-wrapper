import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { exchangeCodeForTokens } from '@/api/auth.ts';
import useSessionTokens from '@/hook/useGetSession.ts';
import { Button } from '@/components/ui/button.tsx';

export default function OauthCallback() {
  const navigate = useNavigate();
  const { updateTokens } = useSessionTokens();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: exchangeCodeForTokens,
    onSuccess: (data) => {
      updateTokens(data);

      // Redirect to home or dashboard
      navigate({ to: '/' });
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

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Failed to complete authentication'}
          </p>
          <Link to="/auth">
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
