import { getData, setData, getDefaultData, saveToLocal, loadFromLocal, undo, redo } from './store.js';
import { initAuth, updateAuthUI, renderAuthModal } from './auth.js';
import { renderCV } from './cv.js';
import { renderCoverLetter } from './coverLetter.js';
import { downloadCVPdf, downloadCoverLetterPDF, printCV, printCoverLetter, downloadCVDocx, downloadCoverLetterDocx, exportJSON, importJSON } from './export.js';
import { analyzeJobMatch } from './ai.js';
import { initAnalytics, trackEvent, trackFeatureUse } from './analytics.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let currentTab = 'dashboard';
let currentFormSection = 'personal';

// ---- Initialization ----

function init() {
  initAnalytics();
  loadFromLocal();

  initAuth().then(() => updateAuthUI());

  bindFormFields();
  setupPhotoUpload();
  setupMobileNav();
  setupKeyboardShortcuts();
  renderAll();
  restoreFormFields();
  setupNavListeners();
  setupThemeToggle();
  setupProfileSelector();
  renderProfileList();

  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === getData().template));
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === getData().clTemplate));
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === getData().theme));

  console.log('SmartCV AI initialized');
}

function renderAll() {
  renderCV();
  renderCoverLetter();
  updateDashboard();
  renderSkills();
  renderEducation();
  renderExperience();
  renderCertifications();
  renderLanguages();
  renderPublications();
  renderVolunteerWork();
  renderCustomSkills();
  renderProfileList();
  updateProfileSelector();
}

// ---- Tab Navigation ----

function switchTab(tab) {
  currentTab = tab;
  $$('.tab-content').forEach(el => el.classList.remove('active'));
  $(`#tab-${tab}`)?.classList.add('active');
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));

  const titles = { dashboard: 'Dashboard', builder: 'CV Builder', coverletter: 'Cover Letter', settings: 'Settings', jobmatch: 'Job Match', share: 'Share' };
  const titleEl = $('#pageTitle');
  if (titleEl) titleEl.textContent = titles[tab] || 'Dashboard';

  if (tab === 'builder' || tab === 'coverletter') {
    renderCV();
    renderCoverLetter();
  }
  updateDashboard();
  trackEvent('tab_view', { tab });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Nav Listeners ----

function setupNavListeners() {
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  $$('.form-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFormSection = btn.dataset.section;
      $$('.form-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      $$('.form-section').forEach(s => s.classList.remove('active'));
      $(`#section-${currentFormSection}`)?.classList.add('active');
    });
  });
}

// ---- Form Handling ----

function bindFormFields() {
  $$('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field === 'skillInput' || field === 'apiKey') return;
    el.addEventListener('input', () => {
      const d = getData();
      d[field] = el.value;
      saveLocal();
      scheduleRender();
    });
  });

  ['clCompany', 'clManager', 'clPosition', 'clAddress', 'clNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const d = getData();
        const key = id.replace('cl', '').toLowerCase();
        d.coverLetter[key] = el.value;
        saveLocal();
        scheduleRender();
      });
    }
  });

  const summary = document.getElementById('careerSummary');
  if (summary) {
    summary.addEventListener('input', () => {
      const sc = document.getElementById('summaryChars');
      if (sc) sc.textContent = summary.value.length;
    });
  }
}

let renderTimeout = null;
function scheduleRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderCV();
    renderCoverLetter();
    updateDashboard();
  }, 100);
}

function saveLocal() {
  saveToLocal();
  showSaveIndicator();
}

function restoreFormFields() {
  const d = getData();
  $$('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field === 'skillInput' || field === 'apiKey') return;
    if (d[field] !== undefined) el.value = d[field];
  });

  const clFields = { clCompany: 'company', clManager: 'manager', clPosition: 'position', clAddress: 'address', clNotes: 'notes' };
  for (const [id, key] of Object.entries(clFields)) {
    const el = document.getElementById(id);
    if (el) el.value = d.coverLetter?.[key] || '';
  }

  const summary = document.getElementById('careerSummary');
  const sc = document.getElementById('summaryChars');
  if (summary && sc) sc.textContent = summary.value.length;

  if (d.photo) {
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.src = d.photo;
      preview.style.display = 'block';
    }
    const ph = document.querySelector('.photo-placeholder');
    if (ph) ph.style.display = 'none';
    const rm = document.getElementById('photoRemove');
    if (rm) rm.style.display = 'inline-flex';
  }
}

// ---- Save Indicator ----

let saveTimeout = null;
function showSaveIndicator() {
  const el = document.getElementById('saveIndicator');
  if (!el) return;
  clearTimeout(saveTimeout);
  el.className = 'save-indicator saving';
  el.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Saving...</span>';
  saveTimeout = setTimeout(() => {
    el.className = 'save-indicator saved';
    el.innerHTML = '<i class="fas fa-check-circle"></i><span>Saved</span>';
    setTimeout(() => { el.className = 'save-indicator'; el.innerHTML = ''; }, 2500);
  }, 400);
}

// ---- Dashboard ----

function updateDashboard() {
  const d = getData();
  let filled = 0;
  if (d.fullName) filled++;
  if (d.email) filled++;
  if (d.phone) filled++;
  if (d.location) filled++;
  if (d.professionalTitle) filled++;
  if (d.careerSummary) filled++;

  const eduScore = Math.min(d.education.length, 3);
  const expScore = Math.min(d.experience.length, 3);
  const certScore = Math.min((d.certifications || []).length, 2);
  const langScore = Math.min((d.languages || []).length, 2);
  const skillScore = Math.min(d.skills.length, 5);
  const photoScore = d.photo ? 0.5 : 0;

  const totalPossible = 6 + 0.5 + 3 + 3 + 2 + 2 + 5;
  const currentScore = filled + photoScore + eduScore + expScore + certScore + langScore + skillScore;
  const percent = Math.min(Math.round((currentScore / totalPossible) * 100), 100);

  const ce = document.getElementById('completionPercent');
  const cf = document.getElementById('completionFill');
  const sc = document.getElementById('skillCount');
  const ec = document.getElementById('expCount');
  const pc = document.getElementById('projectCount');

  if (ce) ce.textContent = percent + '%';
  if (cf) cf.style.width = percent + '%';
  if (sc) sc.textContent = d.skills.length;
  if (ec) ec.textContent = d.experience.length;
  if (pc) pc.textContent = (d.education || []).length;

  renderTips();
}

function renderTips() {
  const container = document.getElementById('dashboardTips');
  if (!container) return;
  const d = getData();
  const tips = [];

  if (!d.fullName) tips.push({ icon: 'fa-user', text: 'Add your full name so employers know who you are.', action: 'builder', priority: 1 });
  if (!d.email) tips.push({ icon: 'fa-envelope', text: 'Add an email address so employers can contact you.', action: 'builder', priority: 1 });
  if (!d.phone) tips.push({ icon: 'fa-phone', text: 'Add a phone number for employers to reach you.', action: 'builder', priority: 1 });
  if (!d.professionalTitle) tips.push({ icon: 'fa-briefcase', text: 'Add a professional title to immediately communicate your role.', action: 'builder', priority: 1 });
  if (!d.careerSummary) tips.push({ icon: 'fa-pen', text: 'Write a career summary to highlight your key achievements.', action: 'builder', priority: 1 });
  if (d.experience.length === 0) tips.push({ icon: 'fa-briefcase', text: 'Add work experience to strengthen your CV.', action: 'builder', priority: 1 });
  if (d.skills.length < 3) tips.push({ icon: 'fa-code', text: 'Add more skills — aim for at least 5 relevant skills.', action: 'builder', priority: 2 });
  if (d.education.length === 0) tips.push({ icon: 'fa-graduation-cap', text: 'Add your education background.', action: 'builder', priority: 2 });
  if ((d.certifications || []).length === 0) tips.push({ icon: 'fa-certificate', text: 'Add certifications to strengthen your profile.', action: 'builder', priority: 3 });

  tips.sort((a, b) => a.priority - b.priority);
  const showTips = tips.slice(0, 5);

  if (showTips.length === 0) {
    container.innerHTML = `<div class="tips-card glass tips-complete"><i class="fas fa-check-circle"></i><span>Your CV looks great!</span></div>`;
    return;
  }

  container.innerHTML = `<div class="tips-card glass">
    <div class="tips-header"><i class="fas fa-lightbulb"></i><h4>Tips to Improve</h4><span class="tips-count">${showTips.length} of ${tips.length}</span></div>
    <div class="tips-list">
      ${showTips.map(t => `
        <div class="tip-item" data-action="${t.action}">
          <div class="tip-icon"><i class="fas ${t.icon}"></i></div>
          <span class="tip-text">${t.text}</span>
          <i class="fas fa-chevron-right tip-arrow"></i>
        </div>
      `).join('')}
    </div>
  </div>`;

  container.querySelectorAll('.tip-item').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.action));
  });
}

// ---- Skills ----

function renderSkills() {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  const d = getData();
  container.innerHTML = d.skills.map((skill, i) =>
    `<span class="skill-tag">${escapeAttr(skill)} <i class="fas fa-times" data-remove-skill="${i}"></i></span>`
  ).join('');

  container.querySelectorAll('[data-remove-skill]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.skills.splice(parseInt(btn.dataset.removeSkill), 1);
      renderSkills();
      saveLocal();
      renderCV();
    });
  });
}

function addSkill() {
  const input = document.getElementById('skillInput');
  const skill = input.value.trim();
  if (!skill) return;
  const d = getData();
  if (d.skills.includes(skill)) return;
  d.skills.push(skill);
  input.value = '';
  renderSkills();
  renderCV();
  saveLocal();
}

// ---- Education ----

function renderEducation() {
  const container = document.getElementById('educationContainer');
  if (!container) return;
  const d = getData();
  if (d.education.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No education entries yet.</p>';
    return;
  }
  container.innerHTML = d.education.map((edu, i) => `
    <div class="entry-card" data-edu-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-graduation-cap"></i> Education #${i + 1}</h4>
        <button class="entry-remove" data-remove-edu="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" value="${escapeAttr(edu.institution)}" data-edu-field="institution" data-edu-idx="${i}" placeholder="University name">
      </div>
      <div class="form-group">
        <label>Degree/Course</label>
        <input type="text" value="${escapeAttr(edu.degree)}" data-edu-field="degree" data-edu-idx="${i}" placeholder="e.g. B.Sc. Computer Science">
      </div>
      <div class="form-group">
        <label>Graduation Year</label>
        <input type="text" value="${escapeAttr(edu.year)}" data-edu-field="year" data-edu-idx="${i}" placeholder="e.g. 2024">
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-edu]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.education.splice(parseInt(btn.dataset.removeEdu), 1);
      renderEducation();
      saveLocal();
      renderCV();
    });
  });

  container.querySelectorAll('[data-edu-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.eduIdx);
      d.education[idx][input.dataset.eduField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Experience ----

function renderExperience() {
  const container = document.getElementById('experienceContainer');
  if (!container) return;
  const d = getData();
  if (d.experience.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No experience entries yet.</p>';
    return;
  }
  container.innerHTML = d.experience.map((exp, i) => `
    <div class="entry-card" data-exp-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-briefcase"></i> Experience #${i + 1}</h4>
        <button class="entry-remove" data-remove-exp="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" value="${escapeAttr(exp.company)}" data-exp-field="company" data-exp-idx="${i}" placeholder="Company name">
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" value="${escapeAttr(exp.title)}" data-exp-field="title" data-exp-idx="${i}" placeholder="e.g. Software Engineer">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Date</label>
          <input type="text" value="${escapeAttr(exp.startDate)}" data-exp-field="startDate" data-exp-idx="${i}" placeholder="e.g. Jan 2022">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="text" value="${escapeAttr(exp.endDate)}" data-exp-field="endDate" data-exp-idx="${i}" placeholder="e.g. Present">
        </div>
      </div>
      <div class="form-group">
        <label>Responsibilities</label>
        <textarea rows="3" data-exp-field="responsibilities" data-exp-idx="${i}" placeholder="Describe your key responsibilities...">${escapeAttr(exp.responsibilities)}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-exp]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.experience.splice(parseInt(btn.dataset.removeExp), 1);
      renderExperience();
      saveLocal();
      renderCV();
    });
  });

  container.querySelectorAll('[data-exp-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.expIdx);
      d.experience[idx][input.dataset.expField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Certifications ----

function renderCertifications() {
  const container = document.getElementById('certificationsContainer');
  if (!container) return;
  const d = getData();
  if ((d.certifications || []).length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No certifications yet.</p>';
    return;
  }
  container.innerHTML = d.certifications.map((cert, i) => `
    <div class="entry-card" data-cert-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-certificate"></i> Certification #${i + 1}</h4>
        <button class="entry-remove" data-remove-cert="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Certification Name</label>
        <input type="text" value="${escapeAttr(cert.name)}" data-cert-field="name" data-cert-idx="${i}" placeholder="e.g. AWS Solutions Architect">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Issuing Organization</label>
          <input type="text" value="${escapeAttr(cert.issuer)}" data-cert-field="issuer" data-cert-idx="${i}" placeholder="e.g. Amazon Web Services">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="text" value="${escapeAttr(cert.date)}" data-cert-field="date" data-cert-idx="${i}" placeholder="e.g. 2024">
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-cert]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.certifications.splice(parseInt(btn.dataset.removeCert), 1);
      renderCertifications();
      saveLocal();
      renderCV();
    });
  });
  container.querySelectorAll('[data-cert-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.certIdx);
      d.certifications[idx][input.dataset.certField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Languages ----

function renderLanguages() {
  const container = document.getElementById('languagesContainer');
  if (!container) return;
  const d = getData();
  if ((d.languages || []).length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No languages yet.</p>';
    return;
  }
  container.innerHTML = d.languages.map((lang, i) => `
    <div class="entry-card" data-lang-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-globe"></i> Language #${i + 1}</h4>
        <button class="entry-remove" data-remove-lang="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Language</label>
          <input type="text" value="${escapeAttr(lang.name)}" data-lang-field="name" data-lang-idx="${i}" placeholder="e.g. Spanish">
        </div>
        <div class="form-group">
          <label>Proficiency Level</label>
          <select data-lang-field="level" data-lang-idx="${i}" class="form-control">
            <option value="" ${!lang.level ? 'selected' : ''}>Select level</option>
            <option value="Native" ${lang.level === 'Native' ? 'selected' : ''}>Native</option>
            <option value="Fluent" ${lang.level === 'Fluent' ? 'selected' : ''}>Fluent</option>
            <option value="Advanced" ${lang.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Intermediate" ${lang.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Beginner" ${lang.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
          </select>
        </div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.languages.splice(parseInt(btn.dataset.removeLang), 1);
      renderLanguages();
      saveLocal();
      renderCV();
    });
  });
  container.querySelectorAll('[data-lang-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.langIdx);
      d.languages[idx][input.dataset.langField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Publications ----

function renderPublications() {
  const container = document.getElementById('publicationsContainer');
  if (!container) return;
  const d = getData();
  if ((d.publications || []).length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No publications yet.</p>';
    return;
  }
  container.innerHTML = d.publications.map((pub, i) => `
    <div class="entry-card" data-pub-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-book"></i> Publication #${i + 1}</h4>
        <button class="entry-remove" data-remove-pub="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" value="${escapeAttr(pub.title)}" data-pub-field="title" data-pub-idx="${i}" placeholder="Publication title">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Publisher / Journal</label>
          <input type="text" value="${escapeAttr(pub.publisher)}" data-pub-field="publisher" data-pub-idx="${i}" placeholder="e.g. IEEE, Nature">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="text" value="${escapeAttr(pub.date)}" data-pub-field="date" data-pub-idx="${i}" placeholder="e.g. 2024">
        </div>
      </div>
      <div class="form-group">
        <label>URL (optional)</label>
        <input type="url" value="${escapeAttr(pub.url)}" data-pub-field="url" data-pub-idx="${i}" placeholder="https://...">
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-pub]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.publications.splice(parseInt(btn.dataset.removePub), 1);
      renderPublications();
      saveLocal();
      renderCV();
    });
  });
  container.querySelectorAll('[data-pub-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.pubIdx);
      d.publications[idx][input.dataset.pubField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Volunteer Work ----

function renderVolunteerWork() {
  const container = document.getElementById('volunteerWorkContainer');
  if (!container) return;
  const d = getData();
  if ((d.volunteerWork || []).length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No volunteer work yet.</p>';
    return;
  }
  container.innerHTML = d.volunteerWork.map((vol, i) => `
    <div class="entry-card" data-vol-index="${i}">
      <div class="entry-header">
        <h4><i class="fas fa-hand-holding-heart"></i> Volunteer #${i + 1}</h4>
        <button class="entry-remove" data-remove-vol="${i}"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Role</label>
        <input type="text" value="${escapeAttr(vol.role)}" data-vol-field="role" data-vol-idx="${i}" placeholder="e.g. Volunteer Coordinator">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Organization</label>
          <input type="text" value="${escapeAttr(vol.organization)}" data-vol-field="organization" data-vol-idx="${i}" placeholder="e.g. Red Cross">
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="text" value="${escapeAttr(vol.date)}" data-vol-field="date" data-vol-idx="${i}" placeholder="e.g. 2023 - Present">
        </div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea rows="2" data-vol-field="description" data-vol-idx="${i}" placeholder="Describe your contributions...">${escapeAttr(vol.description)}</textarea>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-vol]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.volunteerWork.splice(parseInt(btn.dataset.removeVol), 1);
      renderVolunteerWork();
      saveLocal();
      renderCV();
    });
  });
  container.querySelectorAll('[data-vol-field]').forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.dataset.volIdx);
      d.volunteerWork[idx][input.dataset.volField] = input.value;
      saveLocal();
      scheduleRender();
    });
  });
}

// ---- Custom Skills ----

function renderCustomSkills() {
  const container = document.getElementById('customSkillsContainer');
  if (!container) return;
  const d = getData();
  const skills = d.customSkills || [];
  if (skills.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px">No custom keyword mappings yet.</p>';
    return;
  }
  container.innerHTML = skills.map((s, i) =>
    `<div class="entry-card" style="padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="flex:1">
        <strong style="font-size:0.85rem">${escapeAttr(s.name)}</strong>
        <span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px">${escapeAttr(s.keywords.join(', '))}</span>
      </div>
      <button class="btn btn-sm btn-danger" data-remove-cskill="${i}" style="padding:4px 8px;font-size:0.7rem"><i class="fas fa-times"></i></button>
    </div>`
  ).join('');

  container.querySelectorAll('[data-remove-cskill]').forEach(btn => {
    btn.addEventListener('click', () => {
      d.customSkills.splice(parseInt(btn.dataset.removeCskill), 1);
      renderCustomSkills();
      saveLocal();
    });
  });
}

function addCustomSkill() {
  const nameEl = document.getElementById('customSkillName');
  const kwEl = document.getElementById('customSkillKeywords');
  const name = nameEl.value.trim();
  const keywords = kwEl.value.trim();
  if (!name || !keywords) { alert('Please enter both a skill name and keywords.'); return; }
  const d = getData();
  if (!d.customSkills) d.customSkills = [];
  d.customSkills.push({ name, keywords: keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) });
  nameEl.value = '';
  kwEl.value = '';
  renderCustomSkills();
  saveLocal();
}

// ---- Photo Upload ----

function setupPhotoUpload() {
  const upload = document.getElementById('photoUpload');
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  const placeholder = document.querySelector('.photo-placeholder');
  const removeBtn = document.getElementById('photoRemove');
  if (!upload) return;

  upload.addEventListener('click', (e) => {
    if (e.target.closest('.photo-remove')) return;
    input.click();
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePhotoFile(file);
  });

  upload.addEventListener('dragover', (e) => { e.preventDefault(); upload.classList.add('drag-over'); });
  upload.addEventListener('dragleave', () => upload.classList.remove('drag-over'));
  upload.addEventListener('drop', (e) => {
    e.preventDefault();
    upload.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handlePhotoFile(file);
  });

  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = getData();
    d.photo = '';
    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    input.value = '';
    saveLocal();
    renderCV();
  });
}

function handlePhotoFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const d = getData();
    d.photo = e.target.result;
    const preview = document.getElementById('photoPreview');
    preview.src = d.photo;
    preview.style.display = 'block';
    document.querySelector('.photo-placeholder').style.display = 'none';
    document.getElementById('photoRemove').style.display = 'inline-flex';
    saveLocal();
    renderCV();
  };
  reader.readAsDataURL(file);
}

// ---- Theme ----

function setupThemeToggle() {
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const d = getData();
    const newTheme = d.theme === 'dark' ? 'light' : 'dark';
    d.theme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('smartcv_theme', newTheme);
    $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === newTheme));
    const btn = document.querySelector('.theme-toggle span');
    if (btn) btn.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    saveLocal();
  });
}

function setTheme(theme) {
  const d = getData();
  d.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('smartcv_theme', theme);
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === theme));
  const btn = document.querySelector('.theme-toggle span');
  if (btn) btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  saveLocal();
}

function setTemplate(template) {
  const d = getData();
  d.template = template;
  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === template));
  renderCV();
  saveLocal();
}

function setClTemplate(template) {
  const d = getData();
  d.clTemplate = template;
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === template));
  renderCoverLetter();
  saveLocal();
}

// ---- Profiles ----

let profiles = { current: 'default', items: { default: { name: 'Default', data: getDefaultData() } } };
let currentProfileId = 'default';

function setupProfileSelector() {
  const sel = document.getElementById('profileSelect');
  if (sel) {
    sel.addEventListener('change', (e) => switchProfile(e.target.value));
  }
}

function updateProfileSelector() {
  const sel = document.getElementById('profileSelect');
  if (!sel) return;
  sel.innerHTML = Object.entries(profiles.items).map(([id, p]) =>
    `<option value="${id}" ${id === currentProfileId ? 'selected' : ''}>${p.name}</option>`
  ).join('');
}

function renderProfileList() {
  const container = document.getElementById('profileList');
  if (!container) return;
  container.innerHTML = Object.entries(profiles.items).map(([id, p]) => `
    <div class="profile-item ${id === currentProfileId ? 'active' : ''}">
      <div class="profile-info">
        <input class="profile-name-input" value="${escapeAttr(p.name)}"
          data-rename-profile="${id}"
          ${id === 'default' ? 'readonly' : ''}
          title="Click to rename">
        <span class="profile-badge">${id === currentProfileId ? 'Active' : ''}</span>
      </div>
      <div class="profile-actions">
        ${id !== 'default' ? `
          <button class="btn btn-sm btn-outline" data-switch-profile="${id}"><i class="fas fa-check"></i> Switch</button>
          <button class="btn btn-sm btn-danger" data-delete-profile="${id}"><i class="fas fa-trash-alt"></i></button>
        ` : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-switch-profile]').forEach(btn => {
    btn.addEventListener('click', () => switchProfile(btn.dataset.switchProfile));
  });
  container.querySelectorAll('[data-delete-profile]').forEach(btn => {
    btn.addEventListener('click', () => deleteProfile(btn.dataset.deleteProfile));
  });
  container.querySelectorAll('[data-rename-profile]').forEach(input => {
    input.addEventListener('change', () => renameProfile(input.dataset.renameProfile, input.value));
  });
}

function switchProfile(id) {
  profiles.items[currentProfileId].data = JSON.parse(JSON.stringify(getData()));
  currentProfileId = id;
  profiles.current = id;
  setData(profiles.items[id].data, true);
  renderAll();
  restoreFormFields();
  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === getData().template));
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === getData().clTemplate));
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === getData().theme));
}

function createProfile(name) {
  if (!name?.trim()) { alert('Please enter a profile name.'); return; }
  const id = 'profile_' + Date.now();
  profiles.items[id] = { name: name.trim(), data: getDefaultData() };
  switchProfile(id);
  renderProfileList();
}

function renameProfile(id, name) {
  if (!name?.trim()) return;
  profiles.items[id].name = name.trim();
  updateProfileSelector();
  renderProfileList();
}

function deleteProfile(id) {
  if (Object.keys(profiles.items).length <= 1) { alert('Cannot delete the last profile.'); return; }
  if (!confirm(`Delete profile "${profiles.items[id].name}"?`)) return;
  delete profiles.items[id];
  if (currentProfileId === id) {
    const keys = Object.keys(profiles.items);
    switchProfile(keys[0]);
  }
  renderProfileList();
}

// ---- Keyboard Shortcuts ----

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key) {
        case 'z': e.preventDefault(); if (undo()) { restoreFormFields(); renderAll(); } break;
        case 'y': e.preventDefault(); if (redo()) { restoreFormFields(); renderAll(); } break;
        case 's': e.preventDefault(); saveLocal(); break;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
      switch (e.key) {
        case 'Z': e.preventDefault(); if (redo()) { restoreFormFields(); renderAll(); } break;
      }
    }
  });
}

// ---- Mobile Nav ----

function setupMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!menuToggle) return;

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- Expose to window ----

Object.assign(window, {
  switchTab, setTheme, setTemplate, setClTemplate,
  addSkill, addEducation: () => { getData().education.push({ institution: '', degree: '', year: '' }); renderEducation(); saveLocal(); renderCV(); },
  addExperience: () => { getData().experience.push({ company: '', title: '', startDate: '', endDate: '', responsibilities: '' }); renderExperience(); saveLocal(); renderCV(); },
  addCertification: () => { if (!getData().certifications) getData().certifications = []; getData().certifications.push({ name: '', issuer: '', date: '' }); renderCertifications(); saveLocal(); renderCV(); },
  addLanguage: () => { if (!getData().languages) getData().languages = []; getData().languages.push({ name: '', level: '' }); renderLanguages(); saveLocal(); renderCV(); },
  addPublication: () => { if (!getData().publications) getData().publications = []; getData().publications.push({ title: '', publisher: '', date: '', url: '' }); renderPublications(); saveLocal(); renderCV(); },
  addVolunteerWork: () => { if (!getData().volunteerWork) getData().volunteerWork = []; getData().volunteerWork.push({ role: '', organization: '', date: '', description: '' }); renderVolunteerWork(); saveLocal(); renderCV(); },
  addCustomSkill,
  regenerateCoverLetter: renderCoverLetter,
  renderAuthModal,
  downloadCVPdf, downloadCoverLetterPDF, printCV, printCoverLetter,
  downloadCVDocx, downloadCoverLetterDocx,
  exportJSON, importJSON: (e) => importJSON(e, (imported) => { const d = getData(); Object.assign(d, imported); if (imported.coverLetter) d.coverLetter = { ...d.coverLetter, ...imported.coverLetter }; saveLocal(); restoreFormFields(); renderAll(); }),
  analyzeJobMatch,
  createProfile: () => createProfile(document.getElementById('newProfileName')?.value),
  clearAllData: () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    Object.assign(getData(), getDefaultData());
    saveLocal();
    restoreFormFields();
    renderAll();
  },
  copyShareLink: () => {
    navigator.clipboard?.writeText('https://smartcv-generator.vercel.app');
    const msg = document.getElementById('shareCopiedMsg');
    if (msg) { msg.classList.add('visible'); setTimeout(() => msg.classList.remove('visible'), 2500); }
  },
  copyEmbedCode: () => {
    const input = document.getElementById('shareEmbedInput');
    if (input) {
      navigator.clipboard?.writeText(input.value);
      const msg = document.getElementById('embedCopiedMsg');
      if (msg) { msg.classList.add('visible'); setTimeout(() => msg.classList.remove('visible'), 2500); }
    }
  },
  shareNative: () => {
    if (navigator.share) {
      navigator.share({ title: 'SmartCV AI', text: 'Build professional CVs and cover letters with SmartCV AI.', url: 'https://smartcv-generator.vercel.app' }).catch(() => {});
    }
  },
  shareOnTwitter: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Build professional CVs with SmartCV AI https://smartcv-generator.vercel.app')}`, '_blank', 'width=600,height=400'),
  shareOnLinkedIn: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://smartcv-generator.vercel.app')}`, '_blank', 'width=600,height=500'),
  shareOnWhatsApp: () => window.open(`https://wa.me/?text=${encodeURIComponent('Build professional CVs with SmartCV AI https://smartcv-generator.vercel.app')}`, '_blank'),
  shareViaEmail: () => window.open(`mailto:?subject=${encodeURIComponent('Check out SmartCV AI')}&body=${encodeURIComponent('Build professional CVs with SmartCV AI https://smartcv-generator.vercel.app')}`),
});

// ---- Boot ----

document.addEventListener('DOMContentLoaded', () => {
  init();
});
