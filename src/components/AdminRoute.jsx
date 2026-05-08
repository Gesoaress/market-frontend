import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { isAuthenticated, seller } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (seller?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
