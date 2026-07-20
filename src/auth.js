import { api, setToken } from './api.js';

let currentUser = null;
let currentProfile = null;

export function getUser() { return currentUser; }
export function getProfile() { return currentProfile; }
export function isLoggedIn() { return !!currentUser; }
export function isPro() { return currentProfile?.tier === 'pro'; }

export async function initAuth() {
  const token = getToken();
  if (!token) return;

  try {
    const { user, profile } = await api.get('/auth/me');
    currentUser = user;
    currentProfile = profile;
  } catch {
    setToken(null);
  }
}

function getToken() {
  return localStorage.getItem('smartcv_token');
}

export async function signUp(email, password) {
  const { user, session, message } = await api.post('/auth/signup', { email, password });
  if (session?.access_token) {
    setToken(session.access_token);
    currentUser = user;
    await loadProfile();
  }
  return { user, message };
}

export async function signIn(email, password) {
  const { user, session } = await api.post('/auth/signin', { email, password });
  setToken(session.access_token);
  currentUser = user;
  await loadProfile();
  return user;
}

export async function signOut() {
  try { await api.post('/auth/signout'); } catch {}
  setToken(null);
  currentUser = null;
  currentProfile = null;
}

async function loadProfile() {
  try {
    const data = await api.get('/user/profile');
    currentProfile = data;
  } catch {}
}

export async function getSubscriptionStatus() {
  return api.get('/payments/status');
}

export async function createCheckoutSession(priceId) {
  return api.post('/payments/create-checkout', { priceId });
}

export async function openBillingPortal() {
  return api.post('/payments/portal');
}

export async function saveCvData(cvData) {
  if (!isLoggedIn()) return;
  try {
    await api.put('/user/cv-data', { data: cvData });
  } catch (e) {
    console.warn('Cloud save failed:', e.message);
  }
}

export async function subscribeEmail(email, source = 'web') {
  return api.post('/user/subscribe', { email, source });
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
      <button class="modal-close" onclick="document.getElementById('authModal').remove()">&times;</button>
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
        const result = await signUp(email, password);
        if (!result.user?.id) throw new Error('Signup failed');
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
  const proBadge = document.getElementById('proBadge');
  if (!authBtn) return;

  if (isLoggedIn()) {
    authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Sign Out</span>`;
    authBtn.onclick = async () => {
      await signOut();
      updateAuthUI();
      if (typeof window.onAuthChange === 'function') window.onAuthChange();
    };
  } else {
    authBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i><span>Sign In</span>`;
    authBtn.onclick = () => renderAuthModal();
  }

  if (proBadge) {
    proBadge.style.display = isPro() ? 'inline-flex' : 'none';
  }
}
