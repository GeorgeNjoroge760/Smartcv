import { trackEvent } from './analytics.js';

const USERS_KEY = 'smartcv_users';
const SESSION_KEY = 'smartcv_session';

let currentUser = null;

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getUser() { return currentUser; }
export function isLoggedIn() { return !!currentUser; }

export async function initAuth() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session?.email) {
      currentUser = session;
    }
  } catch {}
}

export async function signUp(email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists');
  }
  const hash = await hashPassword(password);
  const user = { id: crypto.randomUUID(), email, passwordHash: hash };
  users.push(user);
  saveUsers(users);
  currentUser = { id: user.id, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
  trackEvent('signup', { method: 'email' });
  return currentUser;
}

export async function signIn(email, password) {
  const users = getUsers();
  const hash = await hashPassword(password);
  const user = users.find(u => u.email === email && u.passwordHash === hash);
  if (!user) throw new Error('Invalid email or password');
  currentUser = { id: user.id, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
  trackEvent('signin', { method: 'email' });
  return currentUser;
}

export function signOut() {
  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
}

// ---- Auth Modal UI ----

export function renderAuthModal() {
  const existing = document.getElementById('authModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal glass">
      <button class="modal-close" id="authModalClose">&times;</button>
      <div class="modal-tabs">
        <button class="modal-tab active" data-auth-tab="signin">Sign In</button>
        <button class="modal-tab" data-auth-tab="signup">Sign Up</button>
      </div>
      <form id="authForm" class="modal-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="authEmail" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="authPassword" placeholder="Min 6 characters" required minlength="6">
        </div>
        <div id="authError" class="auth-error"></div>
        <button type="submit" class="btn btn-primary btn-block" id="authSubmit">Sign In</button>
        <p class="auth-switch">
          <span id="authSwitchText">Don't have an account?</span>
          <a href="#" id="authSwitchLink">Sign Up</a>
        </p>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  let mode = 'signin';
  const tabs = modal.querySelectorAll('.modal-tab');
  const submitBtn = document.getElementById('authSubmit');
  const switchText = document.getElementById('authSwitchText');
  const switchLink = document.getElementById('authSwitchLink');
  const form = document.getElementById('authForm');
  const errorEl = document.getElementById('authError');

  document.getElementById('authModalClose').addEventListener('click', () => modal.remove());

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.authTab;
      tabs.forEach(t => t.classList.toggle('active', t.dataset.authTab === mode));
      submitBtn.textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
      switchText.textContent = mode === 'signin' ? "Don't have an account?" : 'Already have an account?';
      switchLink.textContent = mode === 'signin' ? 'Sign Up' : 'Sign In';
      errorEl.textContent = '';
    });
  });

  switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    tabs.forEach(t => t.classList.toggle('active', t.dataset.authTab === newMode));
    mode = newMode;
    submitBtn.textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
    switchText.textContent = mode === 'signin' ? "Don't have an account?" : 'Already have an account?';
    switchLink.textContent = mode === 'signin' ? 'Sign Up' : 'Sign In';
    errorEl.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';

    try {
      if (mode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      modal.remove();
      updateAuthUI();
      if (typeof window.onAuthChange === 'function') window.onAuthChange();
    } catch (err) {
      errorEl.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = mode === 'signin' ? 'Sign In' : 'Create Account';
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

export function updateAuthUI() {
  const authBtn = document.getElementById('authBtn');
  if (!authBtn) return;

  if (isLoggedIn()) {
    authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Sign Out</span>`;
    authBtn.onclick = () => {
      signOut();
      updateAuthUI();
      if (typeof window.onAuthChange === 'function') window.onAuthChange();
    };
  } else {
    authBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
    authBtn.onclick = () => renderAuthModal();
  }
}
