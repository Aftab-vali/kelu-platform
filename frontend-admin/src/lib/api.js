const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function authHeaders() {
  const token = localStorage.getItem('kelu_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...(options.headers || {}) },
  });
  if (res.status === 401) {
    localStorage.removeItem('kelu_admin_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => req('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => req('/admin/me'),
  summary: () => req('/admin/analytics/summary'),
  issues: (params = {}) => req(`/issues?${new URLSearchParams(params)}`),
  issue: (id) => req(`/issues/${id}`),
  updateIssueStatus: (id, status, note) => req(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  suggestions: () => req('/suggestions'),
  moderateSuggestion: (id, decision) => req(`/suggestions/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ decision }) }),
};
