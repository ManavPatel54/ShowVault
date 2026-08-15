import { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await getCurrentUser(token);
          if (res.success) {
            setUser(res.data.user);
          } else {
            // Token invalid or expired
            localStorage.removeItem('accessToken');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (data) => {
    const res = await loginUser(data);
    if (res.success && res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await registerUser(data);
    if (res.success && res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};