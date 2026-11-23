import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

function validate(email, password) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Escribe tu correo electrónico.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Introduce un correo válido.';
  }

  if (!password) errors.password = 'Escribe tu contraseña.';
  return errors;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/panel" replace />;

  function changeEmail(value) {
    setEmail(value);
    setErrors((old) => ({ ...old, email: validate(value, password).email }));
    setApiError('');
  }

  function changePassword(value) {
    setPassword(value);
    setErrors((old) => ({ ...old, password: validate(email, value).password }));
    setApiError('');
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(email, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setApiError('');

    try {
      await login(email.trim(), password);
      // Al iniciar sesión, vuelve a la ruta solicitada o abre el panel.
      navigate(location.state?.from?.pathname || '/panel', { replace: true });
    } catch (error) {
      setApiError(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-form-panel">
        <div className="brand">
          <div className="brand-icon"><Dumbbell size={25} /></div>
          <div>
            <strong>IRON <span>GYM</span></strong>
            <small>FUERZA SIN LÍMITES</small>
          </div>
        </div>

        <div className="auth-content">
          <p className="eyebrow">SISTEMA DE GESTIÓN</p>
          <h1>Bienvenido de nuevo</h1>
          <p className="subtitle">Accede a tu cuenta para administrar tu gimnasio.</p>

          <form onSubmit={submit} noValidate>
            <FormInput
              id="email"
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => changeEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              error={errors.email}
            />

            <FormInput
              id="password"
              label="Contraseña"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => changePassword(event.target.value)}
              placeholder="Introduce tu contraseña"
              error={errors.password}
              rightAction={(
                <button
                  type="button"
                  onClick={() => setVisible((old) => !old)}
                  aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
            />

            {apiError && <div className="api-error" role="alert">{apiError}</div>}

            <Button type="submit" loading={submitting}>
              {submitting ? 'Comprobando credenciales...' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="auth-help">
            <ShieldCheck size={16} /> Acceso protegido con JWT y roles de usuario.
          </p>
        </div>
      </section>

      <aside className="auth-visual">
        <div className="visual-art"><Dumbbell size={190} strokeWidth={0.9} /></div>
        <div className="visual-copy">
          <p>LA DISCIPLINA CREA RESULTADOS</p>
          <h2>SUPERA <span>TUS LÍMITES.</span></h2>
          <small>IRON GYM · Administración, entrenadores y socios</small>
        </div>
      </aside>
    </main>
  );
}
