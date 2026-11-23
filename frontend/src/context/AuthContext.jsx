import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

/**
 * Centraliza la sesión y los roles para evitar repetir la lógica
 * de autenticación en cada pantalla.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) setInitializing(false);
        return;
      }

      try {
        // Confirma el token ante el servidor y recupera los roles actuales.
        const { data } = await api.get('/auth/me');
        if (active) setUser(data);
      } catch (error) {
        // Un token expirado o revocado no debe continuar autenticado.
        if (error.response?.status === 401 || error.response?.status === 403) {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (active) setInitializing(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    // POST /api/auth/login devuelve { token, user }.
    const { data } = await api.post('/auth/login', { email, password });

    if (!data?.token || !data?.user) {
      throw new Error('El servidor no devolvió una sesión válida.');
    }

    sessionStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  /**
   * Actualiza el perfil en Spring Boot y sincroniza la barra de usuario.
   * El servidor es la fuente de verdad: nunca cambiamos roles desde React.
   */
  async function saveProfile(profile) {
    const { data } = await api.put('/users/me', {
      name: profile.name.trim(),
      phone: profile.phone,
      email: user.email,
      active: Boolean(user.active),
    });
    setUser(data);
    return data;
  }

  async function logout() {
    try {
      // Spring Boot revoca el token en su tabla de tokens invalidados.
      if (sessionStorage.getItem(TOKEN_KEY)) {
        await api.post('/auth/logout');
      }
    } finally {
      // Cerramos la sesión local incluso si se perdió la conexión.
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }

  function hasRole(role) {
    return Array.isArray(user?.roles) && user.roles.includes(role);
  }

  const value = useMemo(
    () => ({ user, initializing, login, logout, hasRole, saveProfile }),
    // Las funciones leen siempre el estado actual del usuario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
