// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await login({ email: form.email, password: form.password });
      if (!r.ok) {
        setError(r.error || 'Login failed');
        return;
      }
      // success -> redirect to where they intended
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input name="password" value={form.password} onChange={onChange} type="password" className="w-full p-2 border rounded" required />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <Link to="/register" className="text-sm text-gray-600">Create account</Link>
        </div>
      </form>
    </div>
  );
}
