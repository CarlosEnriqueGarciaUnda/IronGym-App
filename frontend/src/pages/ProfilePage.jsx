import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, apiErrorMessage } from '../services/api';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';

/** PUT /users/me permite actualizar nombre y teléfono; el correo es fijo. */
export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({});
  const nameError = form.name.trim().length < 3 ? 'Escribe al menos tres caracteres.' : '';
  const phoneError = form.phone && form.phone.replace(/\D/g, '').length < 10 ? 'Escribe al menos 10 dígitos.' : '';

  useEffect(() => {
    let active = true;
    api.get('/users/me').then(({ data }) => {
      if (active) setForm({ name: data.name || '', phone: data.phone || '' });
    }).catch((requestError) => { if (active) setError(apiErrorMessage(requestError)); });
    return () => { active = false; };
  }, []);

  async function save(event) {
    event.preventDefault();
    setTouched({ name: true, phone: true });
    if (nameError || phoneError) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api.put('/users/me', {
        name: form.name.trim(), phone: form.phone,
        email: user.email, active: Boolean(user.active),
      });
      setNotice('Tus datos se guardaron correctamente.');
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Mantén actualizados tus datos de contacto." />
      <section className="ig-panel ig-narrow">
        <form onSubmit={save} noValidate>
          <FormInput label="Nombre completo" value={form.name} required error={touched.name ? nameError : ''}
            onBlur={() => setTouched((old) => ({ ...old, name: true }))}
            onChange={(event) => setForm((old) => ({ ...old, name: event.target.value }))} />
          <FormInput label="Correo electrónico" value={user?.email || ''} disabled hint="El correo de acceso no se modifica desde el perfil." />
          <FormInput label="Teléfono" type="tel" value={form.phone} error={touched.phone ? phoneError : ''}
            onBlur={() => setTouched((old) => ({ ...old, phone: true }))}
            onChange={(event) => setForm((old) => ({ ...old, phone: event.target.value }))} />
          {error && <div className="api-error" role="alert">{error}</div>}
          {notice && <div className="ig-success" role="status">{notice}</div>}
          <Button type="submit" loading={busy}>Guardar cambios</Button>
        </form>
      </section>
    </>
  );
}
