import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, CalendarCheck, CreditCard, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, apiErrorMessage } from '../services/api';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { money, shortDate, statusColor } from '../utils/format';

const SETTINGS = {
  ADMIN: {
    endpoint: '/dashboard/admin', title: 'Resumen del gimnasio',
    subtitle: 'Información actualizada de IRON GYM.',
    quick: [['Administrar socios', '/socios'], ['Registrar cobro', '/cobros'], ['Ver membresías', '/mensualidades']],
    metrics: [
      ['Socios activos', 'sociosActivos', 'personas'],
      ['Ingresos del mes', 'ingresosMes', 'dinero'],
      ['Asistencias hoy', 'asistenciasHoy', 'visitas'],
      ['Por vencer', 'porVencer', 'membresías'],
    ],
  },
  ENTRENADOR: {
    endpoint: '/dashboard/trainer', title: 'Mi panel de entrenamiento',
    subtitle: 'Socios y asistencias del gimnasio.',
    quick: [['Consultar socios', '/socios'], ['Registrar asistencia', '/asistencias']],
    metrics: [['Socios activos', 'sociosActivos', 'personas'], ['Asistencias hoy', 'asistenciasHoy', 'visitas']],
  },
  SOCIO: {
    endpoint: '/dashboard/member', title: 'Mi espacio IRON GYM',
    subtitle: 'Consulta el estado de tu membresía y tus actividades.',
    quick: [['Mi membresía', '/mi-membresia'], ['Mis pagos', '/mis-pagos'], ['Mis asistencias', '/mis-asistencias']],
    metrics: [['Asistencias este mes', 'asistenciasMes', 'visitas']],
  },
};

function MetricCard({ label, value, type }) {
  const Icon = type === 'dinero' ? CreditCard : type === 'personas' ? Users : type === 'membresías' ? CalendarCheck : Activity;
  return (
    <div className="ig-stat-card">
      <span className="ig-stat-label"><Icon size={18} /> {label}</span>
      <strong>{type === 'dinero' ? money(value) : Number(value ?? 0).toLocaleString('es-MX')}</strong>
    </div>
  );
}

export default function DashboardPage() {
  const { hasRole } = useAuth();
  const role = ['ADMIN', 'ENTRENADOR', 'SOCIO'].find(hasRole) || 'SOCIO';
  const settings = SETTINGS[role];
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    api.get(settings.endpoint, { signal: controller.signal })
      .then(({ data: result }) => setData(result))
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(apiErrorMessage(requestError));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [settings.endpoint, retry]);

  return (
    <>
      <PageHeader title={settings.title} subtitle={settings.subtitle} />
      {loading && <p className="ig-info" role="status">Consultando información del gimnasio...</p>}
      {!loading && error && (
        <div className="ig-error-box" role="alert"><p>{error}</p><Button variant="secondary" onClick={() => setRetry((n) => n + 1)}>Reintentar</Button></div>
      )}
      {!loading && data && !error && (
        <>
          <section className="ig-stats-grid" aria-label="Indicadores principales">
            {settings.metrics.map(([label, key, type]) => <MetricCard key={key} label={label} value={data[key]} type={type} />)}
          </section>

          {role === 'SOCIO' && (
            <section className="ig-panel">
              <h2>Mi membresía</h2>
              {data.membresia ? (
                <div className="ig-membership-summary">
                  <div><strong>{data.membresia.planName}</strong><p>Vence el {shortDate(data.membresia.endDate)}</p></div>
                  <span className={`ig-state ig-state--${statusColor(data.membresia.status)}`}>{data.membresia.status}</span>
                </div>
              ) : <p className="ig-muted">Aún no tienes una membresía registrada.</p>}
            </section>
          )}

          {Array.isArray(data.weeklyAttendance) && (
            <section className="ig-panel">
              <h2>Asistencias de los últimos siete días</h2>
              <div className="ig-chart" role="img" aria-label="Asistencias registradas por día">
                {data.weeklyAttendance.map((day, index) => {
                  const highest = Math.max(1, ...data.weeklyAttendance.map((item) => Number(item.count) || 0));
                  return (
                    <div className="ig-chart-column" key={`${day.label}-${index}`}>
                      <span>{day.count}</span>
                      <div className="ig-chart-bar-track"><div className="ig-chart-bar" style={{ height: `${Math.max(6, (Number(day.count) || 0) / highest * 100)}%` }} /></div>
                      <small>{day.label}</small>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
      <section className="ig-panel">
        <h2>Accesos rápidos</h2>
        <div className="ig-shortcuts">
          {settings.quick.map(([label, path]) => <Link key={path} className="ig-shortcut" to={path}>{label} <span aria-hidden="true">→</span></Link>)}
        </div>
      </section>
    </>
  );
}
