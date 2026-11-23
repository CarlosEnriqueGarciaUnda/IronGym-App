import { useEffect, useMemo, useState } from 'react';
import { api, apiErrorMessage } from '../services/api';
import FormInput from './FormInput';
import SelectField from './SelectField';
import SocioPicker from './SocioPicker';
import Button from './Button';
import { money } from '../utils/format';

const ROLE_OPTIONS = ['ADMIN', 'ENTRENADOR', 'SOCIO'].map((value) => ({ value, label: value }));
const METHOD_OPTIONS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].map((value) => ({ value, label: value }));
const MEMBERSHIP_STATES = ['ACTIVA', 'VENCIDA', 'CANCELADA'].map((value) => ({ value, label: value }));
const dateToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

function initialValues(module, target) {
  switch (module) {
    case 'socios':
    case 'usuarios':
      return {
        name: target?.name || '', email: target?.email || '', phone: target?.phone || '',
        password: '', active: target?.active ?? true,
        role: target?.roles?.[0] || (module === 'socios' ? 'SOCIO' : ''),
      };
    case 'planes':
      return { name: target?.name || '', price: target?.price ?? '', durationDays: target?.durationDays ?? 30, active: target?.active ?? true };
    case 'mensualidades':
      return { userId: target?.userId || '', planId: target?.planId || '', startDate: target?.startDate || dateToday(), status: target?.status || 'ACTIVA' };
    case 'cobros':
      return { userId: target?.userId || '', membershipId: target?.membershipId || '', amount: target?.amount || '', method: target?.method || 'EFECTIVO' };
    case 'asistencias':
      return { userId: target?.userId || '' };
    default:
      return {};
  }
}

/** Misma validación visible bajo los campos; el backend vuelve a validar todo. */
function validate(module, form, editing) {
  const errors = {};
  if (['usuarios', 'socios'].includes(module)) {
    if (form.name.trim().length < 3) errors.name = 'Escribe al menos tres caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Introduce un correo válido.';
    if (form.phone && form.phone.replace(/\D/g, '').length < 10) errors.phone = 'El teléfono debe tener al menos 10 dígitos.';
    if (!editing && !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
      errors.password = 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.';
    }
    if (!editing && !form.role) errors.role = 'Selecciona el rol.';
  }
  if (module === 'planes') {
    if (!form.name.trim()) errors.name = 'Escribe el nombre del plan.';
    if (!(Number(form.price) > 0)) errors.price = 'El precio debe ser mayor a cero.';
    if (!Number.isInteger(Number(form.durationDays)) || Number(form.durationDays) < 1 || Number(form.durationDays) > 730) errors.durationDays = 'Duración entre 1 y 730 días.';
  }
  if (['mensualidades', 'cobros', 'asistencias'].includes(module) && !form.userId) errors.userId = 'Selecciona un socio.';
  if (module === 'mensualidades') {
    if (!form.planId) errors.planId = 'Selecciona un plan.';
    if (!form.startDate) errors.startDate = 'Indica la fecha de inicio.';
  }
  if (module === 'cobros') {
    if (!(Number(form.amount) > 0)) errors.amount = 'Introduce un monto válido.';
    if (!form.method) errors.method = 'Selecciona un método de pago.';
  }
  return errors;
}

/** Formulario real, sin datos de ejemplo; se guarda directamente mediante API REST. */
export default function ManagementForm({ module, target, onClose, onSaved }) {
  const editing = Boolean(target?.id);
  const [form, setForm] = useState(() => initialValues(module, target));
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState('');
  const [serverErrors, setServerErrors] = useState({});
  const [plans, setPlans] = useState([]);
  const [plansError, setPlansError] = useState('');
  const errors = useMemo(() => validate(module, form, editing), [module, form, editing]);

  useEffect(() => {
    if (module !== 'mensualidades') return;
    let active = true;
    api.get('/plans/options').then(({ data }) => { if (active) setPlans(data); })
      .catch((error) => { if (active) setPlansError(apiErrorMessage(error)); });
    return () => { active = false; };
  }, [module]);

  const endpoint = { socios: '/users', usuarios: '/users', planes: '/plans', mensualidades: '/memberships', cobros: '/payments', asistencias: '/attendances' }[module];
  const setField = (key, value) => {
    setForm((old) => ({ ...old, [key]: value }));
    setTouched((old) => ({ ...old, [key]: true }));
    setServerErrors((old) => ({ ...old, [key]: undefined }));
    setApiError('');
  };
  const errorFor = (key) => serverErrors[key] || ((touched[key] || submitted) ? errors[key] : undefined);
  const input = (key, label, type = 'text', more = {}) => (
    <FormInput key={key} label={label} type={type} value={form[key] ?? ''} error={errorFor(key)}
      onChange={(event) => setField(key, event.target.value)}
      onBlur={() => setTouched((old) => ({ ...old, [key]: true }))}
      {...more} />
  );

  async function save(event) {
    event.preventDefault();
    setSubmitted(true);
    setServerErrors({});
    if (Object.keys(errors).length > 0) return;
    const body = { ...form };
    if (['socios', 'usuarios'].includes(module)) {
      if (editing) {
        delete body.password;
        delete body.role;
        body.active = Boolean(body.active);
      } else {
        delete body.active;
        body.role = module === 'socios' ? 'SOCIO' : body.role;
      }
    } else if (module === 'planes') {
      body.price = Number(body.price);
      body.durationDays = Number(body.durationDays);
      body.active = Boolean(body.active);
    } else {
      body.userId = Number(body.userId);
      if (module === 'mensualidades') body.planId = Number(body.planId);
      if (module === 'cobros') {
        body.amount = Number(body.amount);
        body.membershipId = body.membershipId ? Number(body.membershipId) : null;
      }
    }
    setBusy(true);
    setApiError('');
    try {
      if (editing) await api.put(`${endpoint}/${target.id}`, body);
      else await api.post(endpoint, body);
      onSaved();
    } catch (error) {
      const serverFields = error.response?.data?.fieldErrors;
      if (serverFields && typeof serverFields === 'object') {
        setSubmitted(true);
        setServerErrors(serverFields);
        setApiError('Revisa los campos señalados.');
      } else setApiError(apiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const needSocio = ['mensualidades', 'cobros', 'asistencias'].includes(module);
  return (
    <div className="ig-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="ig-form-dialog" role="dialog" aria-modal="true" aria-labelledby="ig-edit-title">
        <div className="ig-form-heading">
          <h2 id="ig-edit-title">{editing ? 'Editar' : 'Registrar'} {({ socios: 'socio', usuarios: 'usuario', planes: 'plan', mensualidades: 'membresía', cobros: 'cobro', asistencias: 'asistencia' })[module]}</h2>
          <button type="button" className="ig-close" aria-label="Cerrar formulario" disabled={busy} onClick={onClose}>×</button>
        </div>
        <form onSubmit={save} noValidate>
          {['socios', 'usuarios'].includes(module) && (
            <>
              {input('name', 'Nombre completo', 'text', { required: true, maxLength: 120 })}
              {input('email', 'Correo electrónico', 'email', { required: true, maxLength: 180 })}
              {input('phone', 'Teléfono', 'tel', { placeholder: '10 dígitos' })}
              {!editing && input('password', 'Contraseña', 'password', { required: true, hint: 'Al menos 8 caracteres, una mayúscula, un número y un símbolo.' })}
              {!editing && module === 'usuarios' && <SelectField label="Rol" value={form.role} onChange={(v) => setField('role', v)} options={ROLE_OPTIONS} error={errorFor('role')} />}
              {editing && <label className="ig-check"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setField('active', event.target.checked)} /> Cuenta activa</label>}
            </>
          )}
          {module === 'planes' && (
            <>{input('name', 'Nombre del plan', 'text', { required: true })}
              {input('price', 'Precio en MXN', 'number', { required: true, min: 0.01, step: 0.01 })}
              {input('durationDays', 'Duración en días', 'number', { required: true, min: 1, max: 730, step: 1 })}
              <label className="ig-check"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setField('active', event.target.checked)} /> Plan activo</label></>
          )}
          {needSocio && <SocioPicker value={form.userId} initialName={target?.userName || ''} onChange={(value) => setField('userId', value)} error={errorFor('userId')} />}
          {module === 'mensualidades' && (
            <>
              <SelectField label="Plan" value={form.planId} onChange={(v) => setField('planId', v)}
                options={plans.map((plan) => ({ value: String(plan.id), label: `${plan.name} — ${money(plan.price)}` }))} error={errorFor('planId')} />
              {plansError && <p className="ig-field__error">{plansError}</p>}
              {input('startDate', 'Fecha de inicio', 'date', { required: true })}
              <SelectField label="Estado" value={form.status} onChange={(v) => setField('status', v)} options={MEMBERSHIP_STATES} />
            </>
          )}
          {module === 'cobros' && (
            <>
              {input('amount', 'Monto (MXN)', 'number', { required: true, min: 0.01, step: 0.01 })}
              <SelectField label="Método de pago" value={form.method} onChange={(v) => setField('method', v)} options={METHOD_OPTIONS} />
              {input('membershipId', 'ID de membresía (opcional)', 'number', { min: 1, step: 1 })}
            </>
          )}
          {apiError && <div className="api-error" role="alert">{apiError}</div>}
          <div className="ig-form-actions">
            <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={busy}>{busy ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
