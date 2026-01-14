import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  component: ProtectedRoute,
});

function ProtectedRoute() {
  return <Outlet />;
}
