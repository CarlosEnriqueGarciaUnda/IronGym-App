import Button from './Button';

/**
 * Tabla para un resultado Page<T> de Spring Boot:
 * { content: [], number: 0, totalPages: 1, totalElements: 10 }
 *
 * IMPORTANTE: no filtra ni pagina los datos en React.
 * onPageChange debe solicitar otra página a la API REST.
 */
export default function TableCustom({
  columns,
  page,
  loading = false,
  error = '',
  onPageChange,
  emptyMessage = 'No hay registros para mostrar.',
  caption = 'Listado',
}) {
  const rows = Array.isArray(page?.content) ? page.content : [];
  const pageNumber = Math.max(Number(page?.number) || 0, 0);
  const totalPages = Math.max(Number(page?.totalPages) || 0, 0);
  const totalElements = Math.max(Number(page?.totalElements) || 0, 0);

  return (
    <section className="ig-table-panel" aria-busy={loading}>
      {error && <p className="ig-table-error" role="alert">{error}</p>}

      <div className="ig-table-scroll">
        <table className="ig-table">
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col">{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr>
                <td className="ig-table-empty" colSpan={Math.max(columns.length, 1)}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && rows.map((row, index) => (
              <tr key={row.id ?? index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : String(row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            {loading && (
              <tr>
                <td className="ig-table-empty" colSpan={Math.max(columns.length, 1)}>
                  Cargando registros...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="ig-table-footer">
        <span role="status" aria-live="polite">
          {totalElements} registros · Página {totalPages ? pageNumber + 1 : 0} de {totalPages}
        </span>
        <div className="ig-table-pages">
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange?.(pageNumber - 1)}
            disabled={loading || pageNumber === 0 || !onPageChange}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => onPageChange?.(pageNumber + 1)}
            disabled={loading || pageNumber + 1 >= totalPages || !onPageChange}
          >
            Siguiente
          </Button>
        </div>
      </footer>
    </section>
  );
}
