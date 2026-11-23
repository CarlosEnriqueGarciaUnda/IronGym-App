import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';

const ROLES = {
  ADMIN: {
    heading: 'Administración del gimnasio',
    description: 'Gestiona socios, cobros, membresías y asistencias.',
    items: [
      ['Socios', 'Alta, consulta y edición de socios.'],
      ['Cobros', 'Registrar pagos de membresías.'],
      ['Mensualidades', 'Controlar planes y vencimientos.'],
      ['Asistencias', 'Registrar entradas al gimnasio.'],
    ],
  },
  ENTRENADOR: {
    heading: 'Panel del entrenador',
    description: 'Consulta socios y registra su asistencia.',
    items: [
      ['Consultar socios', 'Ver información de socios autorizada por el servidor.'],
      ['Asistencias', 'Registrar entradas de socios.'],
    ],
  },
  SOCIO: {
    heading: 'Mi espacio IRON GYM',
    description: 'Consulta tus datos, pagos y membresía.',
    items: [
      ['Mi membresía', 'Conocer el plan y su fecha de vencimiento.'],
      ['Mis pagos', 'Consultar tus pagos registrados.'],
      ['Mis asistencias', 'Ver las visitas que realizaste.'],
    ],
  },
};

/**
 * Vista inicial del Ticket #5. Los módulos CRUD se desarrollan
 * en el Ticket #7; por ahora se prueba la navegación por roles.
 */
export default function RoleHome({ requestedRole }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');

  const role = requestedRole ||
    ['ADMIN', 'ENTRENADOR', 'SOCIO'].find((value) => hasRole(value)) || 'SOCIO';
  const content = ROLES[role];

  async function exit() {
    setClosing(true);
    setError('');

    try {
      await logout();
    } catch (requestError) {
      // logout() elimina el token local incluso si el servidor no responde.
      setError(apiErrorMessage(requestError));
    } finally {
      setClosing(false);
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand brand-small">
          <div className="brand-icon"><Dumbbell size={20} /></div>
          <div><strong>IRON <span>GYM</span></strong><small>FUERZA SIN LÍMITES</small></div>
        </div>

        <nav className="sidebar-links" aria-label="Navegación por rol">
          <NavLink to="/panel">Inicio</NavLink>
          {hasRole('ADMIN') && <NavLink to="/admin">Administrador</NavLink>}
          {hasRole('ENTRENADOR') && <NavLink to="/entrenador">Entrenador</NavLink>}
          {hasRole('SOCIO') && <NavLink to="/socio">Socio</NavLink>}
        </nav>
        <small className="sidebar-foot">IRON GYM · Sistema web</small>
      </aside>

      <div className="main-column">
        <header className="app-header">
          <div className="header-title">IRON GYM / {role}</div>
          <div className="header-user">
            <UserCircle2 size={30} />
            <div><strong>{user.name}</strong><small>{user.email}</small></div>
            <button onClick={exit} type="button" disabled={closing}>
              <LogOut size={17} /> {closing ? 'Saliendo...' : 'Salir'}
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <p className="eyebrow">GESTIÓN · IRON GYM</p>
          <h1>{content.heading}</h1>
          <p className="subtitle">{content.description}</p>

          <div className="role-notice">
            <ShieldCheck size={20} />
            <div>
              <strong>Sesión autenticada correctamente</strong>
              <p>Spring Boot identifica tu cuenta y asigna los permisos de {role}.</p>
            </div>
          </div>

          <div className="module-grid">
            {content.items.map(([title, detail]) => (
              <article className="module-card" key={title}>
                <h2>{title}</h2>
                <p>{detail}</p>
                <small>Se implementará en los Tickets #6 y #7.</small>
              </article>
            ))}
          </div>

          <p className="footer-note">
            Vista inicial del Ticket #5: el backend aplica las restricciones reales
            a los endpoints protegidos.
          </p>
          {error && <p className="api-error" role="alert">{error}</p>}
        </main>
      </div>
    </div>
  );
}
