# CleverMiner Web UI Authentication System

This document explains how the authentication system works in the CleverMiner Web UI.

## Overview

The authentication system uses JWT (JSON Web Tokens) for secure authentication. It includes:

1. **Token Management**: Storing and refreshing access and refresh tokens
2. **Protected Routes**: Routes that require authentication
3. **Automatic Token Verification**: Verifying tokens periodically
4. **Automatic Token Refresh**: Refreshing tokens when they expire

## Route Structure

The application uses TanStack Router with a nested route structure:

- `__root.tsx`: The root route that contains all other routes
  - `_protected.tsx`: A layout route that wraps all protected routes
    - `_protected._fourft.tsx`: The 4FT miner layout route
      - `_protected._fourft.fourft.index.tsx`: The 4FT miner index page
      - `_protected._fourft.fourft.create.index.tsx`: The 4FT miner create page
      - `_protected._fourft.fourft.$fourftId.index.tsx`: The 4FT miner detail page
      - `_protected._fourft.fourft.$fourftId.rules.$ruleId.index.tsx`: The 4FT miner rule detail page
    - `_protected._dataset.datasets.tsx`: The datasets page
  - `index.tsx`: The home page (not protected)
  - `auth.index.tsx`: The login page (not protected)
  - `oauth-callback.tsx`: The OAuth callback page (not protected)

## Components and Hooks

### ProtectedRoute Component

The `ProtectedRoute` component is used in the `_protected.tsx` layout route to protect all child routes. It:

1. Verifies the access token on component mount
2. If the token is invalid, tries to refresh it
3. If refresh fails, redirects to the login page
4. Sets up periodic token verification (every 2 minutes)

```tsx
// _protected.tsx
import { createFileRoute, Outlet } from '@tanstack/react-router';
import ProtectedRoute from "@/components/auth/ProtectedRoute.tsx";

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
```

### useAuthProtection Hook

The `useAuthProtection` hook can be used in any component to handle authentication. It provides:

1. `isVerifying`: Whether the authentication is being verified
2. `isAuthenticated`: Whether the user is authenticated
3. `verifyAndRefreshToken`: A function to manually verify and refresh the token

```tsx
import useAuthProtection from '@/hook/useAuthProtection';

function MyComponent() {
  const { isVerifying, isAuthenticated, verifyAndRefreshToken } = useAuthProtection();

  // Use isVerifying to show a loading state
  if (isVerifying) {
    return <div>Loading...</div>;
  }

  // Use isAuthenticated to conditionally render content
  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return <div>Protected content</div>;
}
```

### Authentication Utilities

The `authUtils.ts` file provides utilities for working with authentication:

1. `addAuthHeaders`: Adds authentication headers to fetch options
2. `authFetch`: A fetch function that automatically adds authentication headers and handles token refresh
3. `isAuthenticated`: Checks if the user is authenticated
4. `getCurrentUser`: Gets the current user from the session
5. `logout`: Logs out the user by removing tokens

```tsx
import { authFetch, isAuthenticated, logout } from '@/utils/authUtils';

// Use authFetch for authenticated requests
const fetchData = async () => {
  try {
    const response = await authFetch('/api/data');
    return response.json();
  } catch (error) {
    // Handle authentication errors
    if (!isAuthenticated()) {
      // Redirect to login
    }
  }
};

// Logout the user
const handleLogout = () => {
  logout();
  // Redirect to login
};
```

## Authentication Flow

1. **Login**: The user logs in using Google OAuth
2. **Token Exchange**: The frontend exchanges the OAuth code for JWT tokens
3. **Token Storage**: The tokens are stored in localStorage and in the Zustand store
4. **Protected Routes**: Protected routes verify the token and refresh it if needed
5. **API Requests**: API requests include the token in the Authorization header
6. **Token Refresh**: Tokens are refreshed automatically when they expire
7. **Logout**: The user logs out by removing the tokens

## Implementation Details

### Token Storage

Tokens are stored in:

1. **localStorage**: For persistence across page reloads
2. **Zustand Store**: For reactive state management

```tsx
// useGetSession.ts
import { create } from 'zustand';
import { TokenResponseCamelCase } from '@/api/auth.ts';

interface SessionState {
  tokens: TokenResponseCamelCase | null;
  updateTokens: (tokens: TokenResponseCamelCase | null) => void;
}

const useSessionTokens = create<SessionState>((set) => ({
  tokens: JSON.parse(localStorage.getItem('sessionTokens')) || null,
  updateTokens: (newTokens) => {
    if (newTokens) {
      localStorage.setItem('sessionTokens', JSON.stringify(newTokens));
      set({ tokens: newTokens });
    } else {
      localStorage.removeItem('sessionTokens');
      set({ tokens: null });
    }
  },
}));

export default useSessionTokens;
```

### Token Verification and Refresh

Tokens are verified and refreshed using the following functions:

```tsx
// auth.ts
export const verifyToken = async (accessToken: string): Promise<boolean> => {
  // Implementation details
};

export const refreshAccessToken = async (sessionState: TokenResponseCamelCase): Promise<TokenResponseCamelCase | null> => {
  // Implementation details
};
```

## API Integration

API requests include the access token in the Authorization header:

```tsx
// Example API request
const response = await fetch(apiUrl, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${tokens.accessToken}`,
  },
});
```

The `authFetch` utility simplifies this:

```tsx
// Using authFetch
const response = await authFetch(apiUrl);
``` 