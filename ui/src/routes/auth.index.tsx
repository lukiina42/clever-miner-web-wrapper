import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
});

//TODO MOVE THE COMPONENT TO A SEPARATE FILE

function RouteComponent() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const googleCallbackUri = 'http://localhost:8000/clever-miner/auth/google/callback/';

  const handleGoogleLogin = async () => {
    const googleSignInUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=${encodeURIComponent(googleCallbackUri)}&prompt=consent&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile&access_type=offline`;

    window.location.href = googleSignInUrl;
  };

  return <button onClick={handleGoogleLogin}>Sign in with Google</button>;
}
