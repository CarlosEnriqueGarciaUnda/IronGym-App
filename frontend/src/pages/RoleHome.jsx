import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dumbbell, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';

const ROLES = {
  ADMIN: {
    heading: 'AdministraciÃ³n del gimnasio',
    description: 'Gestiona socios, cobros, membresÃ­as y asistencias.',
    items: [
      ['Socios', 'Alta, consulta y ediciÃ³n de socios.'],
      ['Cobros', 'Registrar pagos de membresÃ­as.'],
      ['Mensualidades', 'Controlar planes y vencimientos.'],
      ['Asistencias', 'Registrar entradas al gimnasio.'],
    ],
  },
  ENTRENADOR: {
    heading: 'Panel del entrenador',
    description: 'Consulta socios y registra su asistencia.',
    items: [
      ['Consultar socios', 'Ver informaciÃ³n de socios autorizada por el servidor.'],
      ['Asistencias', 'Registrar entradas de socios.'],
    ],
  },
  SOCIO: {
    heading: 'Mi espacio IRON GYM',
    description: 'Consulta tus datos, pagos y membresÃ­a.',
    items: [
      ['Mi membresÃ­a', 'Conocer el plan y su fecha de vencimiento.'],
      ['Mis pagos', 'Consultar tus pagos registrados.'],
      ['Mis asistencias', 'Ver las visitas que realizaste.'],
    ],
  },
};

/**
 * Vista inicial del Ticket #5. Los mÃ³dulos CRUD se desarrollan
 * en el Ticket #7; por ahora se prueba la navegaciÃ³n por roles.
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
          <div><strong>IRON <span>GYM</span></strong><small>FUERZA SIN LÃMITES</small></div>
        </div>

        <nav className="sidebar-links" aria-label="NavegaciÃ³n por rol">
          <NavLink to="/panel">Inicio</NavLink>
          {hasRole('ADMIN') && <NavLink to="/admin">Administrador</NavLink>}
          {hasRole('ENTRENADOR') && <NavLink to="/entrenador">Entrenador</NavLink>}
          {hasRole('SOCIO') && <NavLink to="/socio">Socio</NavLink>}
        </nav>
        <small className="sidebar-foot">IRON GYM Â· Sistema web</small>
      </aside>

      <div className="main-column">
        <Navbar
          user={user}
          role={role}
          onLogout={exit}
          loggingOut={closing}
        />

        <main className="dashboard-content">
          <p className="eyebrow">GESTIÃ“N Â· IRON GYM</p>
          <h1>{content.heading}</h1>
          <p className="subtitle">{content.description}</p>

          <div className="role-notice">
            <ShieldCheck size={20} />
            <div>
              <strong>SesiÃ³n autenticada correctamente</strong>
              <p>Spring Boot identifica tu cuenta y asigna los permisos de {role}.</p>
            </div>
          </div>

          <div className="module-grid">
            {content.items.map(([title, detail]) => (
              <article className="module-card" key={title}>
                <h2>{title}</h2>
                <p>{detail}</p>
                <small>Se implementarÃ¡ en los Tickets #6 y #7.</small>
              </article>
            ))}
          </div>
          {error && <p className="api-error" role="alert">{error}</p>}
        </main>
      </div>
    </div>
  );
}

