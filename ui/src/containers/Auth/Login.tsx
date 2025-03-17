import { Button } from '@/components/ui/button';
import { authConstants } from '@/utils/authConstants';
import GoogleIcon from '@/components/icon/GoogleIcon.tsx';

export default function Login() {
  const handleGoogleLogin = async () => {
    window.location.href = authConstants.googleSignInUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-3rem)] w-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">CleverMiner</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to CleverMiner. Please sign in to continue.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="flex items-center justify-center w-full py-6 border-gray-300"
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </Button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>CleverMiner - Data Mining Made Simple</p>
        <p className="mt-1">© {new Date().getFullYear()} CleverMiner. All rights reserved.</p>
      </div>
    </div>
  );
}
