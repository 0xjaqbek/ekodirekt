import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * Komponent do zabezpieczania tras, które wymagają autentykacji
 * Opcjonalnie można określić role, które mają dostęp
 */
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Jeśli trwa ładowanie, wyświetl spinner lub placeholder
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  // Jeśli użytkownik nie jest zalogowany, przekieruj do strony logowania
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jeśli określono role i użytkownik nie ma odpowiedniej roli
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Użytkownik jest zalogowany i ma odpowiednią rolę
  return <Outlet />;
};

export default ProtectedRoute;