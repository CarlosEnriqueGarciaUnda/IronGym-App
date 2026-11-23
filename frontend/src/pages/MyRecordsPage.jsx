import { useMemo } from 'react';
import { useServerPage } from '../hooks/useServerPage';
import TableCustom from '../components/TableCustom';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../config/modules';

/** Muestra solo /mine; el backend identifica al socio con su JWT. */
export default function MyRecordsPage({ module }) {
  const info = useMemo(() => ({
    membresias: { endpoint: '/memberships/mine', config: MODULES.mensualidades, title: 'Mi membresía' },
    pagos: { endpoint: '/payments/mine', config: MODULES.cobros, title: 'Mis pagos' },
    asistencias: { endpoint: '/attendances/mine', config: MODULES.asistencias, title: 'Mis asistencias' },
  }[module]), [module]);
  const { page, loading, error, setPageNumber } = useServerPage(info.endpoint, '', { searchable: false });

  return (
    <>
      <PageHeader title={info.title} subtitle="Consulta tu historial personal en IRON GYM." />
      <TableCustom caption={info.title} columns={info.config.columns} page={page}
        loading={loading} error={error} onPageChange={setPageNumber} />
    </>
  );
}
