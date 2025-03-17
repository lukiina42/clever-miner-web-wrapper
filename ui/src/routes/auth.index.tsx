import { createFileRoute } from '@tanstack/react-router';
import Login from '@/containers/Auth/Login.tsx';

export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Login />;
}
