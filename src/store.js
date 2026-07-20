let _data = {};
let _undoStack = [];
let _redoStack = [];
const MAX_HISTORY = 50;

export function getData() { return _data; }
export function setData(newData, skipHistory = false) {
  if (!skipHistory) {
    _undoStack.push(JSON.stringify(_data));
    if (_undoStack.length > MAX_HISTORY) _undoStack.shift();
    _redoStack = [];
  }
  _data = newData;
}

export function undo() {
  if (_undoStack.length === 0) return false;
  _redoStack.push(JSON.stringify(_data));
  _data = JSON.parse(_undoStack.pop());
  return true;
}

export function redo() {
  if (_redoStack.length === 0) return false;
  _undoStack.push(JSON.stringify(_data));
  _data = JSON.parse(_redoStack.pop());
  return true;
}

export function canUndo() { return _undoStack.length > 0; }
export function canRedo() { return _redoStack.length > 0; }

export function getDefaultData() {
  return {
    fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
    professionalTitle: '', careerSummary: '', photo: '',
    education: [], experience: [], skills: [],
    certifications: [], languages: [], publications: [], volunteerWork: [],
    coverLetter: { company: '', manager: '', position: '', address: '', notes: '' },
    customSkills: [],
    template: 'modern', clTemplate: 'modern', theme: 'light',
  };
}

export function createEmptyData() {
  setData(getDefaultData(), true);
  return _data;
}

// LocalStorage persistence (legacy / offline fallback)
const STORAGE_KEY = 'smartcv_profiles';

export function saveToLocal() {
  try {
    localStorage.setItem('smartcv_data', JSON.stringify(_data));
  } catch {}
}

export function loadFromLocal() {
  try {
    const saved = localStorage.getItem('smartcv_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setData({ ...getDefaultData(), ...parsed }, true);
      if (parsed.coverLetter) {
        _data.coverLetter = { ...getDefaultData().coverLetter, ...parsed.coverLetter };
      }
      return true;
    }
  } catch {}
  return false;
}
