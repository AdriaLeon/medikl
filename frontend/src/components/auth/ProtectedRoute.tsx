import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

/** Redirects to /login when not authenticated; otherwise renders the nested route. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
