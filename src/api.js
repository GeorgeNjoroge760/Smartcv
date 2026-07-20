// Pure client-side — no backend. All data lives in localStorage.
const STORAGE_KEY = 'smartcv_data';

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch { return null; }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
