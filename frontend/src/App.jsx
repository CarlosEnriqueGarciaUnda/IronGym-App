import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RoleHome from './pages/RoleHome';

function StartPage() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div className="screen-status">Cargando IRON GYM...</div>;
  }

  return <Navigate to={user ? '/panel' : '/login'} replace />;
}

function AccessDenied() {
  return (
    <main className="simple-message">
      <h1>Acceso no autorizado</h1>
      <p>Tu cuenta no tiene permiso para consultar esta sección.</p>
      <a href="/panel">Volver al panel</a>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sin-acceso" element={<AccessDenied />} />

      {/* Sólo usuarios autenticados pueden entrar al sistema. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/panel" element={<RoleHome />} />
      </Route>

      {/* Cada pantalla comprueba además el rol correspondiente. */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<RoleHome requestedRole="ADMIN" />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ENTRENADOR']} />}>
        <Route
          path="/entrenador"
          element={<RoleHome requestedRole="ENTRENADOR" />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['SOCIO']} />}>
        <Route path="/socio" element={<RoleHome requestedRole="SOCIO" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
