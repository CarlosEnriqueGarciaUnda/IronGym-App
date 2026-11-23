import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Restringe las rutas de React según autenticación y roles.
 * La seguridad definitiva también debe validarse en Spring Boot.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="screen-status">Verificando tu sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const permitted =
    allowedRoles.length === 0 ||
    allowedRoles.some((role) => user.roles?.includes(role));

  if (!permitted) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
}
