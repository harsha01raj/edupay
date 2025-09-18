// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password || !form.confirm) return 'Email and password are required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirm) return 'Passwords do not match';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }

    setLoading(true);
    try {
      const r = await register({ name: form.name, email: form.email, password: form.password });
      if (!r.ok) {
        setError(r.error || 'Registration failed');
        return;
      }
      // if registration returns token, provider already set it; go to home
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Name (optional)</label>
          <input name="name" value={form.name} onChange={onChange} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input name="password" value={form.password} onChange={onChange} type="password" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm">Confirm Password</label>
          <input name="confirm" value={form.confirm} onChange={onChange} type="password" className="w-full p-2 border rounded" required />
        </div>

        <div className="flex items-center justify-between">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {loading ? 'Creating...' : 'Register'}
          </button>
          <Link to="/login" className="text-sm text-gray-600">Already have an account?</Link>
        </div>
      </form>
    </div>
  );
}
