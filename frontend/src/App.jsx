import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RecoverPage from './pages/RecoverPage';
import DashboardPage from './pages/DashboardPage';
import ManagementPage from './pages/ManagementPage';
import MyRecordsPage from './pages/MyRecordsPage';
import ProfilePage from './pages/ProfilePage';
import AppLayout from './layouts/AppLayout';

function Landing() {
  const { user, initializing } = useAuth();
  if (initializing) return <div className="screen-status">Cargando IRON GYM...</div>;
  return <Navigate to={user ? '/panel' : '/login'} replace />;
}

function NotAllowed() {
  return <main className="simple-message"><h1>Acceso restringido</h1><p>Tu cuenta no tiene permisos para esta sección.</p><a href="/panel">Volver al panel</a></main>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/recuperar" element={<RecoverPage />} />
      <Route path="/reset-password" element={<RecoverPage resetMode />} />
      <Route path="/sin-acceso" element={<NotAllowed />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/panel" element={<DashboardPage />} />
          <Route path="/perfil" element={<ProfilePage />} />

          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ENTRENADOR']} />}>
            <Route path="/socios" element={<ManagementPage module="socios" />} />
            <Route path="/asistencias" element={<ManagementPage module="asistencias" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/usuarios" element={<ManagementPage module="usuarios" />} />
            <Route path="/cobros" element={<ManagementPage module="cobros" />} />
            <Route path="/mensualidades" element={<ManagementPage module="mensualidades" />} />
            <Route path="/planes" element={<ManagementPage module="planes" />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SOCIO']} />}>
            <Route path="/mi-membresia" element={<MyRecordsPage module="membresias" />} />
            <Route path="/mis-pagos" element={<MyRecordsPage module="pagos" />} />
            <Route path="/mis-asistencias" element={<MyRecordsPage module="asistencias" />} />
          </Route>
        </Route>
      </Route>

      <Route path="/admin" element={<Navigate to="/panel" replace />} />
      <Route path="/entrenador" element={<Navigate to="/panel" replace />} />
      <Route path="/socio" element={<Navigate to="/panel" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter>;
}
