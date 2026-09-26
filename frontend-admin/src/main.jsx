import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import './index.css';

function RequireAuth({ children }) {
  const token = localStorage.getItem('kelu_admin_token');
  return token ? children : <Navigate to="/login" replace />;
}

function Shell({ children }) {
  const logout = () => { localStorage.removeItem('kelu_admin_token'); window.location.href = '/login'; };
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-kelu-ink text-white p-6 flex flex-col">
        <h1 className="font-bold text-lg mb-8">Kelu Insights</h1>
        <a href="/" className="py-2 opacity-90 hover:opacity-100">Dashboard</a>
        <a href="/issues" className="py-2 opacity-90 hover:opacity-100">Issues</a>
        <button onClick={logout} className="mt-auto text-sm opacity-70 hover:opacity-100 text-left">Log out</button>
      </aside>
      <div className="flex-1 bg-gray-50">{children}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Shell><Dashboard /></Shell></RequireAuth>} />
        <Route path="/issues" element={<RequireAuth><Shell><Issues /></Shell></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
