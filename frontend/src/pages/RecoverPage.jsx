import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { api, apiErrorMessage } from '../services/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

/** Recuperación real mediante token que el backend envía al correo configurado. */
export default function RecoverPage({ resetMode = false }) {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError(''); setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Introduce un correo válido.'); return; }
    if (resetMode && (!token || !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password))) {
      setError('Indica el token y una contraseña de mínimo 8 caracteres, mayúscula, número y símbolo.'); return;
    }
    setBusy(true);
    try {
      if (resetMode) {
        await api.post('/auth/reset-password', { email, token, password });
        navigate('/login', { replace: true, state: { notice: 'Contraseña actualizada. Inicia sesión.' } });
      } else {
        const { data } = await api.post('/auth/forgot-password', { email });
        setNotice(data.message || 'Si el correo existe, recibirás instrucciones.');
      }
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-layout">
      <section className="auth-form-panel">
        <div className="brand"><div className="brand-icon"><Dumbbell size={25} /></div><div><strong>IRON <span>GYM</span></strong><small>FUERZA SIN LÍMITES</small></div></div>
        <div className="auth-content">
          <p className="eyebrow">ACCESO A TU CUENTA</p><h1>{resetMode ? 'Nueva contraseña' : 'Recuperar acceso'}</h1>
          <p className="subtitle">{resetMode ? 'Introduce el enlace de recuperación y tu nueva contraseña.' : 'Enviaremos instrucciones al correo registrado.'}</p>
          <form onSubmit={submit} noValidate>
            <FormInput label="Correo electrónico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            {resetMode && <>
              <FormInput label="Token de recuperación" value={token} onChange={(event) => setToken(event.target.value)} required />
              <FormInput label="Nueva contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required hint="Mínimo 8 caracteres, mayúscula, número y símbolo." />
            </>}
            {error && <div className="api-error" role="alert">{error}</div>}
            {notice && <div className="ig-success" role="status">{notice}</div>}
            <Button type="submit" loading={busy}>{resetMode ? 'Guardar contraseña' : 'Enviar instrucciones'}</Button>
          </form>
          <p className="ig-auth-links"><Link to="/login">Volver a iniciar sesión</Link></p>
        </div>
      </section>
      <aside className="auth-visual"><div className="visual-art"><Dumbbell size={180} /></div><div className="visual-copy"><p>IRON GYM</p><h2>SIEMPRE <span>CONTIGO.</span></h2></div></aside>
    </main>
  );
}
