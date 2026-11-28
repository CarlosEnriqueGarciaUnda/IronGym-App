export const money = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', maximumFractionDigits: 2,
}).format(Number(value) || 0);

export function shortDate(value) {
  if (!value) return '—';
  const day = String(value).slice(0, 10);
  const [year, month, date] = day.split('-');
  return year && month && date ? `${date}/${month}/${year}` : day;
}

export function timestamp(value) {
  if (!value) return '—';
  const [day, time] = String(value).split('T');
  return `${shortDate(day)} · ${(time || '').slice(0, 5)}`;
}

export function statusColor(value) {
  if (['ACTIVA', 'ACTIVO', 'PAGADO'].includes(String(value).toUpperCase())) return 'good';
  if (['VENCIDA', 'VENCIDO', 'CANCELADA'].includes(String(value).toUpperCase())) return 'bad';
  return 'warn';
}
