// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../api/axios';
import { loginUser as apiLogin, registerUser as apiRegister } from '../api/auth';


const AuthContext = createContext();

/**
 * Safer AuthProvider:
 * - Avoids useNavigate during initialization (use window.location for redirect)
 * - Keeps axios header in sync
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('edupay_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('edupay_token') || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // keep axios header in sync whenever token changes
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const resp = await apiLogin({ email, password });
      const t = resp?.data?.token || resp?.data?.accessToken || resp?.data?.jwt;
      if (!t) {
        const msg = resp?.data?.message || 'Token missing in response';
        throw new Error(msg);
      }

      const u = resp?.data?.user || resp?.data?.userInfo || null;

      // persist
      localStorage.setItem('edupay_token', t);
      setToken(t);
      setAuthToken(t);

      if (u) {
        localStorage.setItem('edupay_user', JSON.stringify(u));
        setUser(u);
      }

      return { ok: true };
    } catch (err) {
      console.error('Auth login error', err);
      return { ok: false, error: err?.response?.data?.message || err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const resp = await apiRegister(payload);
      const t = resp?.data?.token || resp?.data?.accessToken || resp?.data?.jwt;
      if (t) {
        localStorage.setItem('edupay_token', t);
        setToken(t);
        setAuthToken(t);
      }
      const u = resp?.data?.user || null;
      if (u) {
        localStorage.setItem('edupay_user', JSON.stringify(u));
        setUser(u);
      }
      return { ok: true };
    } catch (err) {
      console.error('Auth register error', err);
      return { ok: false, error: err?.response?.data?.message || err?.message || 'Register failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // clear local state + axios header
    setToken(null);
    setUser(null);
    localStorage.removeItem('edupay_token');
    localStorage.removeItem('edupay_user');
    setAuthToken(null);

    // redirect to login (use window.location to avoid router timing issues)
    try {
      window.location.href = '/login';
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
