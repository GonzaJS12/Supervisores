import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../context/useAuth';

export default function ProtectedRoute() {
  const { estaAutenticado } = useAuth();

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}