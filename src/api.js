const BASE = '/api';

let _token = null;
let _backendAvailable = null; // null = unknown, true/false after first check

export function isBackendAvailable() { return _backendAvailable; }

export function setToken(token) {
  _token = token;
  if (token) {
    localStorage.setItem('smartcv_token', token);
  } else {
    localStorage.removeItem('smartcv_token');
  }
}

export function getToken() {
  if (_token) return _token;
  _token = localStorage.getItem('smartcv_token');
  return _token;
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(`${BASE}${path}`, opts);
  } catch (networkErr) {
    _backendAvailable = false;
    const err = new Error('Backend server is not available. Running in offline mode.');
    err.status = 0;
    err.offline = true;
    throw err;
  }

  // Check if response is actually JSON (not HTML from SPA fallback)
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    _backendAvailable = false;
    const err = new Error('Backend server is not available. Running in offline mode.');
    err.status = res.status;
    err.offline = true;
    throw err;
  }

  _backendAvailable = true;
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Request failed');
    err.status = res.status;
    err.upgradeRequired = data.upgradeRequired;
    err.usage = data.usage;
    err.limit = data.limit;
    throw err;
  }

  return data;
}

// Quick health check on load
export async function checkBackend() {
  try {
    const res = await fetch(`${BASE}/health`, { method: 'GET' });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      _backendAvailable = true;
      return true;
    }
  } catch {}
  _backendAvailable = false;
  return false;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};
