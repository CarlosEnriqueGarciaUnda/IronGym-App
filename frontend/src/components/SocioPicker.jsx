import { useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../services/api';

/** Busca socios por API: no descarga todos los usuarios para generar un select. */
export default function SocioPicker({ value, initialName = '', onChange, error }) {
  const [search, setSearch] = useState(initialName);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return undefined;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setBusy(true);
      setMessage('');
      try {
        const { data } = await api.get('/users', {
          params: { q: search.trim(), role: 'SOCIO', size: 6, page: 0 },
          signal: controller.signal,
        });
        setResults(data.content || []);
      } catch (requestError) {
        if (!controller.signal.aborted) setMessage(apiErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 300);
    return () => { controller.abort(); clearTimeout(timeout); };
  }, [opened, search]);

  return (
    <div className="ig-field">
      <label htmlFor="ig-search-socio" className="ig-field__label">Socio *</label>
      <input
        id="ig-search-socio" type="search" autoComplete="off"
        className="ig-select-input" placeholder="Buscar por nombre o correo"
        aria-invalid={Boolean(error)} value={search}
        onChange={(event) => { setSearch(event.target.value); onChange(''); setOpened(true); }}
        onFocus={() => setOpened(true)}
      />
      {opened && (
        <div className="ig-picker-options">
          {busy && <p className="ig-picker-hint">Buscando socios...</p>}
          {message && <p className="ig-field__error">{message}</p>}
          {!busy && !message && results.map((row) => (
            <button type="button" key={row.id} onClick={() => {
              onChange(String(row.id));
              setSearch(`${row.name} · ${row.email}`);
              setOpened(false);
            }}>
              <strong>{row.name}</strong><small>{row.email}</small>
            </button>
          ))}
          {!busy && !message && results.length === 0 && <p className="ig-picker-hint">No se encontraron socios.</p>}
          <button type="button" className="ig-picker-close" onClick={() => setOpened(false)}>Cerrar resultados</button>
        </div>
      )}
      {value && <p className="ig-field__hint">Socio seleccionado correctamente.</p>}
      {error && <p className="ig-field__error" role="alert">{error}</p>}
    </div>
  );
}
