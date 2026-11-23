import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';
import Navbar from '../components/Navbar';

const NAVIGATION = {
  ADMIN: [
    ['/panel', 'Panel'], ['/socios', 'Socios'], ['/cobros', 'Cobros'],
    ['/asistencias', 'Asistencias'], ['/mensualidades', 'Mensualidades'],
    ['/planes', 'Planes'], ['/usuarios', 'Usuarios'], ['/perfil', 'Mi perfil'],
  ],
  ENTRENADOR: [
    ['/panel', 'Panel'], ['/socios', 'Socios'],
    ['/asistencias', 'Asistencias'], ['/perfil', 'Mi perfil'],
  ],
  SOCIO: [
    ['/panel', 'Mi panel'], ['/mi-membresia', 'Mi membresía'],
    ['/mis-pagos', 'Mis pagos'], ['/mis-asistencias', 'Mis asistencias'],
    ['/perfil', 'Mi perfil'],
  ],
};

/** Menú y barra superior presentes en toda el área privada. */
export default function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  const role = ['ADMIN', 'ENTRENADOR', 'SOCIO'].find(hasRole) || 'SOCIO';

  async function exit() {
    setLoggingOut(true);
    setError('');
    try {
      await logout();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoggingOut(false);
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="app-shell ig-app-shell">
      <aside className="sidebar ig-sidebar">
        <NavLink to="/panel" className="brand brand-small ig-brand-link">
          <span className="brand-icon"><Dumbbell size={21} /></span>
          <span><strong>IRON <span>GYM</span></strong><small>FUERZA SIN LÍMITES</small></span>
        </NavLink>
        <nav className="sidebar-links" aria-label="Menú principal">
          {NAVIGATION[role].map(([path, label]) => (
            <NavLink key={path} to={path} end={path === '/panel'}>{label}</NavLink>
          ))}
        </nav>
        <small className="sidebar-foot">IRON GYM · Gestión deportiva</small>
      </aside>
      <div className="main-column">
        <Navbar user={user} role={role} onLogout={exit} loggingOut={loggingOut} />
        {error && <p className="api-error ig-shell-error" role="alert">{error}</p>}
        <main className="dashboard-content ig-main"><Outlet /></main>
      </div>
    </div>
  );
}
