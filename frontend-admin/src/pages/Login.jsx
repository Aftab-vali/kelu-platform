import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.login(email, password);
      localStorage.setItem('kelu_admin_token', res.token);
      localStorage.setItem('kelu_admin_role', res.role);
      nav('/');
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white shadow-sm border border-gray-100 rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-kelu-ink mb-1">Kelu Insights</h1>
        <p className="text-sm text-gray-400 mb-6">Private admin &amp; analytics portal</p>
        <input className="input mb-3" type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input mb-3" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <button className="w-full bg-kelu-teal text-white py-2 rounded-lg font-semibold">Sign in</button>
      </form>
    </div>
  );
}
