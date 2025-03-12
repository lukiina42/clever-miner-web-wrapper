import { createFileRoute } from '@tanstack/react-router';
import OauthCallback from '@/containers/Auth/OauthCallback.tsx';

export const Route = createFileRoute('/oauth-callback')({
  component: RouteComponent,
});

function RouteComponent() {
  return <OauthCallback />;
}
