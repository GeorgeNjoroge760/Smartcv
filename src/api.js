const BASE = '/api';

let _token = null;

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

  const res = await fetch(`${BASE}${path}`, opts);
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

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  del: (path) => request('DELETE', path),
};
