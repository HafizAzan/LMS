import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth-context.tsx';
import Text from './ui/text.tsx';

function homePath(role?: string) {
  return role === 'instructor' ? '/instructor' : '/my-learning';
}

function AuthLoading() {
  return (
    <div className="flex h-svh items-center justify-center bg-background">
      <Text muted>Loading...</Text>
    </div>
  );
}

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function GuestOnly() {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={homePath(user?.role)} replace />;
  return <Outlet />;
}

export function RequireInstructor() {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user?.role !== 'instructor') return <Navigate to="/my-learning" replace />;
  return <Outlet />;
}
