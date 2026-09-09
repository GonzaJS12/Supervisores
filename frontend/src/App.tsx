import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AgentesPage from './pages/agentes/AgentesPage';
import DetalleAgentePage from './pages/agentes/DetalleAgentePage';
import NuevaSupervisionPage from './pages/supervisiones/NuevaSupervisionPage';
import SupervisionesPage from './pages/supervisiones/SupervisionesPage';
import DetalleSupervisionPage from './pages/supervisiones/DetalleSupervisionPage';
import UsuariosPage from './pages/admin/UsuariosPage';
import BloquesPage from './pages/admin/BloquesPage';
import CriteriosPage from './pages/admin/CriteriosPage';
import NuevoUsuarioPage from './pages/admin/NuevoUsuarioPage';
import DetalleUsuarioPage from './pages/admin/DetalleUsuarioPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* RUTA PÚBLICA */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* USUARIOS AUTENTICADOS */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* AGENTES */}

            <Route
              path="/agentes"
              element={<AgentesPage />}
            />

            <Route
              path="/agentes/:id"
              element={<DetalleAgentePage />}
            />

            {/* SUPERVISIONES */}

            <Route
              path="/supervisiones/nueva"
              element={<NuevaSupervisionPage />}
            />

            <Route
              path="/supervisiones"
              element={<SupervisionesPage />}
            />

            <Route
              path="/supervisiones/:id"
              element={<DetalleSupervisionPage />}
            />

            {/* SOLO ADMIN */}

            <Route element={<AdminRoute />}>

              <Route
                path="/admin/usuarios"
                element={<UsuariosPage />}
              />

              <Route
                path="/admin/usuarios/nuevo"
                element={<NuevoUsuarioPage />}
              />

              <Route
                path="/admin/usuarios/:id"
                element={<DetalleUsuarioPage />}
              />

              <Route
                path="/admin/bloques"
                element={<BloquesPage />}
              />

              <Route
                path="/admin/criterios"
                element={<CriteriosPage />}
              />

            </Route>

          </Route>
        </Route>

        {/* RUTA NO ENCONTRADA */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;