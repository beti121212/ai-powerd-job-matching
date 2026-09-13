import { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';
import { clearActiveSession, persistSession, readStoredUser } from '../utils/authSession';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  login: async () => null,
  setSession: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return readStoredUser();
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }) => {
    const { data } = await API.post('/login', { email, password });
    const session = { token: data.token, user: data.user };
    persistSession(session);
    setToken(session.token);
    setUser(session.user);
    return session;
  };

  const setSession = (session) => {
    persistSession(session);
    if (session?.token) setToken(session.token);
    if (session?.user) setUser(session.user);
  };

  const logout = () => {
    clearActiveSession();
    setToken(null);
    setUser(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token && !user) {
      // Optional: refresh user data
    }
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);