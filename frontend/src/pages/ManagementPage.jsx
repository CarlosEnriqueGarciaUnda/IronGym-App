import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, apiErrorMessage } from '../services/api';
import { useServerPage } from '../hooks/useServerPage';
import { MODULES } from '../config/modules';
import Button from '../components/Button';
import TableCustom from '../components/TableCustom';
import PageHeader from '../components/PageHeader';
import ManagementForm from '../components/ManagementForm';
import ModalConfirm from '../components/ModalConfirm';

/**
 * CRUD de administración. Las tablas reciben Page<T> directamente de Java.
 * Solo se muestran acciones que Spring Security permite al rol actual.
 */
export default function ManagementPage({ module }) {
  const settings = MODULES[module];
  const { hasRole } = useAuth();
  const admin = hasRole('ADMIN');
  const canCreate = admin || (module === 'asistencias' && hasRole('ENTRENADOR'));
  const [query, setQuery] = useState('');
  const { page, loading, error, pageNumber, setPageNumber, reload } = useServerPage(
    settings.endpoint, query, { role: settings.role || '' },
  );
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const columns = useMemo(() => {
    if (!admin) return settings.columns;
    return [...settings.columns, {
      key: 'actions', title: 'Acciones', render: (row) => (
        <div className="ig-row-actions">
          <Button size="small" variant="secondary" onClick={() => setEditing({ mode: 'edit', row })}>Editar</Button>
          <Button size="small" variant="danger" onClick={() => setDeleting(row)}>
            {module === 'socios' || module === 'usuarios' ? 'Desactivar' : 'Eliminar'}
          </Button>
        </div>
      ),
    }];
  }, [admin, module, settings.columns]);

  async function confirmDelete() {
    if (!deleting || !admin) return;
    setBusy(true);
    setActionError('');
    try {
      await api.delete(`${settings.endpoint}/${deleting.id}`);
      setNotice(module === 'socios' || module === 'usuarios' ? 'La cuenta fue desactivada.' : 'Registro actualizado correctamente.');
      setDeleting(null);
      reload();
    } catch (requestError) {
      setActionError(apiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title={settings.title} subtitle={settings.subtitle} action={canCreate && (
        <Button onClick={() => { setNotice(''); setEditing({ mode: 'new', row: null }); }}>
          <Plus size={17} /> {settings.button}
        </Button>
      )} />
      {notice && <div className="ig-success" role="status">{notice}</div>}
      <div className="ig-toolbar">
        <label className="ig-search"><Search size={18} />
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPageNumber(0); }}
            placeholder="Buscar por nombre o información" aria-label={`Buscar ${settings.title}`} />
        </label>
        <span className="ig-toolbar-count">Los resultados se consultan desde el servidor</span>
      </div>
      <TableCustom columns={columns} caption={`Listado de ${settings.title.toLowerCase()}`}
        page={page} loading={loading} error={error} onPageChange={setPageNumber} />

      {editing && <ManagementForm key={`${module}-${editing.mode}-${editing.row?.id || 'new'}`}
        module={module} target={editing.row} onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); setNotice('Registro guardado correctamente.'); reload(); }} />}

      <ModalConfirm open={Boolean(deleting)}
        title={module === 'socios' || module === 'usuarios' ? 'Desactivar cuenta' : 'Confirmar acción'}
        description={`¿Deseas continuar con ${deleting?.name || deleting?.userName || deleting?.id || 'este registro'}?`}
        confirmLabel={module === 'socios' || module === 'usuarios' ? 'Desactivar' : 'Confirmar'}
        processing={busy} onConfirm={confirmDelete} onClose={() => { setDeleting(null); setActionError(''); }} />
      {actionError && <p className="ig-error-box" role="alert">{actionError}</p>}
    </>
  );
}
