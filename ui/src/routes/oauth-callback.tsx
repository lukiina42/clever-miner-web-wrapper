import {createFileRoute, useNavigate } from '@tanstack/react-router'
import {useEffect} from "react";
import {useMutation} from "@tanstack/react-query";

export const Route = createFileRoute('/oauth-callback')({
  component: RouteComponent,
})

// Define the response type
interface TokenResponse {
    access_token: string;
    refresh_token: string;
    user: {
        email: string;
        first_name: string;
        last_name: string;
    };
}

const exchangeCodeForTokens = async (code: string): Promise<TokenResponse> => {
    const response = await fetch('http://localhost:8000/clever-miner/auth/google/login/', {
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

    return response.json();
};

function RouteComponent() {
    const navigate = useNavigate();

    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: exchangeCodeForTokens,
        onSuccess: (data) => {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);

            // You could also store user data if needed
            localStorage.setItem('user', JSON.stringify(data.user));

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
            navigate({ to: '/login', search: { error: 'missing_code' } });
        }
    }, [mutate, navigate]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Processing your login</h2>
                    <p className="text-gray-600">Please wait while we complete the authentication...</p>
                    {/* You could add a spinner here */}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
                    <p className="text-gray-600">
                        {error instanceof Error ? error.message : 'Failed to complete authentication'}
                    </p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => navigate({ to: '/login' })}
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // This will show briefly before the redirect happens
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Login Successful</h2>
                <p className="text-gray-600">Redirecting you to the dashboard...</p>
            </div>
        </div>
    );
}
