import { useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../services/api';

const EMPTY = { content: [], number: 0, totalPages: 0, totalElements: 0 };

/**
 * Paginación real: Spring Boot recibe q, page y size.
 * React no descarga todo el listado ni lo filtra localmente.
 */
export function useServerPage(endpoint, query = '', { role = '', searchable = true } = {}) {
  const [pageNumber, setPageNumber] = useState(0);
  const [page, setPage] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const [search, setSearch] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(query), 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => setPageNumber(0), [search, endpoint, role]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = { page: pageNumber, size: 10 };
        if (searchable && search) params.q = search;
        if (role) params.role = role;
        const response = await api.get(endpoint, { params, signal: controller.signal });
        setPage(response.data);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setPage(EMPTY);
        setError(apiErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [endpoint, pageNumber, refreshCount, role, search, searchable]);

  return {
    page, pageNumber, setPageNumber, loading, error,
    reload: () => setRefreshCount((count) => count + 1),
  };
}
