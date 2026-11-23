import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, apiErrorMessage } from '../services/api';
import Button from '../components/Button';
import FormInput from '../components/FormInput';

function validate(form) {
  const errors = {};
  if (form.name.trim().length < 3) errors.name = 'Escribe al menos tres caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Correo electrónico inválido.';
  if (form.phone && form.phone.replace(/\D/g, '').length < 10) errors.phone = 'Teléfono de al menos 10 dígitos.';
  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) errors.password = 'Mínimo 8 caracteres, mayúscula, número y símbolo.';
  if (form.password !== form.confirm) errors.confirm = 'Las contraseñas no coinciden.';
  return errors;
}

export default function RegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/panel" replace />;
  const errors = validate(form);
  const update = (name, value) => { setForm((old) => ({ ...old, [name]: value })); setTouched((old) => ({ ...old, [name]: true })); setError(''); setServerErrors((old) => ({ ...old, [name]: undefined })); };
  const field = (name, label, type = 'text') => (
    <FormInput key={name} label={label} type={type} value={form[name]} required
      error={serverErrors[name] || ((touched[name] || submitted) ? errors[name] : '')}
      onChange={(event) => update(name, event.target.value)}
      onBlur={() => setTouched((old) => ({ ...old, [name]: true }))} />
  );

  async function register(event) {
    event.preventDefault(); setSubmitted(true);
    if (Object.keys(errors).length) return;
    setBusy(true); setError('');
    try {
      await api.post('/auth/register', { name: form.name.trim(), email: form.email.trim(), phone: form.phone, password: form.password });
      navigate('/login', { replace: true, state: { notice: 'Cuenta creada. Ya puedes iniciar sesión.' } });
    } catch (requestError) {
      setServerErrors(requestError.response?.data?.fieldErrors || {});
      setError(apiErrorMessage(requestError));
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-layout ig-register-layout">
      <section className="auth-form-panel">
        <div className="brand"><div className="brand-icon"><Dumbbell size={25} /></div><div><strong>IRON <span>GYM</span></strong><small>FUERZA SIN LÍMITES</small></div></div>
        <div className="auth-content ig-auth-register">
          <p className="eyebrow">ÚNETE A IRON GYM</p><h1>Crear cuenta</h1>
          <p className="subtitle">El registro público crea únicamente cuentas de socio.</p>
          <form onSubmit={register} noValidate>
            {field('name', 'Nombre completo')}{field('email', 'Correo electrónico', 'email')}
            {field('phone', 'Teléfono (opcional)', 'tel')}{field('password', 'Contraseña', 'password')}
            <p className="ig-password-hint">8 caracteres como mínimo · Mayúscula · Número · Símbolo especial</p>
            {field('confirm', 'Confirmar contraseña', 'password')}
            {error && <div className="api-error" role="alert">{error}</div>}
            <Button type="submit" loading={busy}>Crear cuenta</Button>
          </form>
          <p className="ig-auth-links">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
        </div>
      </section>
      <aside className="auth-visual"><div className="visual-art"><Dumbbell size={180} /></div><div className="visual-copy"><p>EMPIEZA HOY</p><h2>TU MEJOR <span>VERSIÓN.</span></h2></div></aside>
    </main>
  );
}
