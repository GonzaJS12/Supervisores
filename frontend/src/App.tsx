import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AgentesPage from './pages/agentes/AgentesPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import NuevoAgentePage from './pages/agentes/NuevoAgentePage';
import NuevaSupervisionPage from './pages/supervisiones/NuevaSupervisionPage';
import SupervisionesPage from './pages/supervisiones/SupervisionesPage';
import DetalleSupervisionPage from './pages/supervisiones/DetalleSupervisionPage';
import DetalleAgentePage from './pages/agentes/DetalleAgentePage';
import AdminRoute from './routes/AdminRoute';
import UsuariosPage from './pages/admin/UsuariosPage';
import BloquesPage from './pages/admin/BloquesPage';
import CriteriosPage from './pages/admin/CriteriosPage';
import NuevoUsuarioPage from './pages/admin/NuevoUsuarioPage';
import DetalleUsuarioPage from './pages/admin/DetalleUsuarioPage';


function App() {
  return (
    <BrowserRouter>
        <Routes>

        {/* Ruta pública */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Rutas para cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/agentes"
              element={<AgentesPage />}
            />

            <Route
              path="/agentes/nuevo"
              element={<NuevoAgentePage />}
            />

            <Route
              path="/agentes/:id"
              element={<DetalleAgentePage />}
            />

            <Route
              path="/supervisiones"
              element={<SupervisionesPage />}
            />

            <Route
              path="/supervisiones/nueva"
              element={<NuevaSupervisionPage />}
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