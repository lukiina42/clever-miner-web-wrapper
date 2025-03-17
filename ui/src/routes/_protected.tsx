import { createFileRoute, Outlet } from '@tanstack/react-router';
import ProtectedRoute from '@/components/auth/ProtectedRoute.tsx';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  // Render the child routes
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
