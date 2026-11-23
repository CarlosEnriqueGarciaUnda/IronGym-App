import { money, shortDate, timestamp, statusColor } from '../utils/format';

const state = (value) => (
  <span className={`ig-state ig-state--${statusColor(value)}`}>{value || '—'}</span>
);
const text = (key, title) => ({ key, title });

/** Los nombres de propiedades coinciden con los DTOs Views.java de Spring Boot. */
export const MODULES = {
  socios: {
    title: 'Socios', subtitle: 'Consulta y administra a los socios inscritos.',
    endpoint: '/users', role: 'SOCIO', button: 'Nuevo socio',
    columns: [text('name', 'Nombre'), text('email', 'Correo'), text('phone', 'Teléfono'),
      { key: 'active', title: 'Estado', render: (row) => state(row.active ? 'Activo' : 'Inactivo') }],
  },
  usuarios: {
    title: 'Usuarios y roles', subtitle: 'Control de acceso de administradores, entrenadores y socios.',
    endpoint: '/users', button: 'Nuevo usuario',
    columns: [text('name', 'Nombre'), text('email', 'Correo'),
      { key: 'roles', title: 'Roles', render: (row) => row.roles?.join(', ') || '—' },
      { key: 'active', title: 'Estado', render: (row) => state(row.active ? 'Activo' : 'Inactivo') }],
  },
  cobros: {
    title: 'Cobros', subtitle: 'Registra pagos y consulta los movimientos.',
    endpoint: '/payments', button: 'Registrar cobro',
    columns: [text('userName', 'Socio'), { key: 'amount', title: 'Monto', render: (row) => money(row.amount) },
      text('method', 'Método'), { key: 'paidAt', title: 'Fecha', render: (row) => timestamp(row.paidAt) },
      { key: 'status', title: 'Estado', render: (row) => state(row.status) }],
  },
  asistencias: {
    title: 'Asistencias', subtitle: 'Control de entradas al gimnasio.',
    endpoint: '/attendances', button: 'Registrar entrada',
    columns: [text('userName', 'Socio'),
      { key: 'checkIn', title: 'Fecha y hora', render: (row) => timestamp(row.checkIn) },
      text('recordedBy', 'Registró')],
  },
  mensualidades: {
    title: 'Mensualidades', subtitle: 'Controla fechas de inicio, renovación y vencimiento.',
    endpoint: '/memberships', button: 'Nueva membresía',
    columns: [text('userName', 'Socio'), text('planName', 'Plan'),
      { key: 'startDate', title: 'Inicio', render: (row) => shortDate(row.startDate) },
      { key: 'endDate', title: 'Vencimiento', render: (row) => shortDate(row.endDate) },
      { key: 'status', title: 'Estado', render: (row) => state(row.status) }],
  },
  planes: {
    title: 'Planes', subtitle: 'Precios y duración de las membresías.',
    endpoint: '/plans', button: 'Nuevo plan',
    columns: [text('name', 'Plan'), { key: 'price', title: 'Precio', render: (row) => money(row.price) },
      text('durationDays', 'Duración (días)'),
      { key: 'active', title: 'Estado', render: (row) => state(row.active ? 'Activo' : 'Inactivo') }],
  },
};
