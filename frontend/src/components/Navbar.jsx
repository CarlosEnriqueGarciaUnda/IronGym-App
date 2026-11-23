import { Dumbbell, LogOut, UserCircle2 } from 'lucide-react';
import Button from './Button';

/**
 * Navbar común para el área privada.
 * La identidad y el rol vienen de Spring Boot mediante AuthContext.
 */
export default function Navbar({ user, role, onLogout, loggingOut = false }) {
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const visibleRole = role || roles.join(', ') || 'Sin rol';

  return (
    <header className="app-header ig-navbar">
      <div className="ig-navbar__brand">
        <Dumbbell size={19} aria-hidden="true" />
        <span>IRON GYM</span>
        <span className="ig-navbar__role">{visibleRole}</span>
      </div>

      <div className="header-user ig-navbar__user">
        <UserCircle2 size={32} aria-hidden="true" />
        <div className="ig-navbar__identity">
          <strong>{user?.name || 'Usuario'}</strong>
          <small>{user?.email || 'Sin correo'}</small>
        </div>
        {onLogout && (
          <Button
            variant="secondary"
            size="small"
            onClick={onLogout}
            loading={loggingOut}
            aria-label="Cerrar sesión"
          >
            {!loggingOut && <LogOut size={16} aria-hidden="true" />}
            {loggingOut ? 'Saliendo...' : 'Salir'}
          </Button>
        )}
      </div>
    </header>
  );
}
