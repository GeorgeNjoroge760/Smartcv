/* ====== DATA STORE & PROFILES ====== */
function getDefaultData() {
  return {
    fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '',
    professionalTitle: '', careerSummary: '', photo: '',
    education: [], experience: [], skills: [], projects: [], references: [],
    coverLetter: { company: '', manager: '', position: '', address: '', notes: '' },
    customSkills: [],
    apiKey: '', template: 'modern', clTemplate: 'modern', theme: 'light'
  };
}

let data = getDefaultData();
let currentTab = 'dashboard';
let currentFormSection = 'personal';

/* ====== DOM REFS ====== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ====== PROFILE SYSTEM ====== */
let profiles = {};
let currentProfileId = 'default';

function saveProfiles() {
  try {
    profiles.items[currentProfileId].data = data;
    const clone = JSON.parse(JSON.stringify(profiles));
    Object.values(clone.items).forEach(p => { delete p.data.apiKey; });
    localStorage.setItem('smartcv_profiles', JSON.stringify(clone));
  } catch (e) {
    console.warn('Profiles save error:', e);
  }
}

/* ====== LOCAL STORAGE ====== */
function saveData() {
  saveProfiles();
  showSaveIndicator();
  updateDashboard();
  renderCV();
  renderCoverLetter();
}

/* ====== AUTO-SAVE INDICATOR ====== */
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

function loadData() {
  try {
    const saved = localStorage.getItem('smartcv_profiles');
    const oldData = localStorage.getItem('smartcv_data');

    if (saved) {
      profiles = JSON.parse(saved);
      currentProfileId = profiles.current || 'default';
      if (profiles.items[currentProfileId]) {
        data = profiles.items[currentProfileId].data;
      }
    } else if (oldData) {
      const parsed = JSON.parse(oldData);
      data = { ...getDefaultData(), ...parsed };
      if (parsed.coverLetter) data.coverLetter = { ...data.coverLetter, ...parsed.coverLetter };
      profiles = { current: 'default', items: { 'default': { name: 'Default', data: JSON.parse(JSON.stringify(data)) } } };
      localStorage.removeItem('smartcv_data');
    }

    if (!profiles.items || !profiles.items[currentProfileId]) {
      profiles = { current: 'default', items: { 'default': { name: 'Default', data: getDefaultData() } } };
      currentProfileId = 'default';
      data = profiles.items.default.data;
    }

    // Restore API key from sessionStorage (never persisted to disk)
    const sessionKey = sessionStorage.getItem('smartcv_api_key');
    if (sessionKey) { data.apiKey = sessionKey; }

    const theme = localStorage.getItem('smartcv_theme');
    if (theme) { data.theme = theme; }
    document.documentElement.setAttribute('data-theme', data.theme || 'light');
  } catch (e) {
    console.warn('Load error:', e);
    data = getDefaultData();
  }
}

/* ====== THEME ====== */
function setTheme(theme) {
  data.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('smartcv_theme', theme);
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === theme));
  const btn = document.querySelector('.theme-toggle span');
  if (btn) btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  saveData();
}

/* ====== TAB NAVIGATION ====== */
function switchTab(tab) {
  currentTab = tab;
  $$('.tab-content').forEach(el => el.classList.remove('active'));
  $(`#tab-${tab}`).classList.add('active');
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));

  const titles = { dashboard: 'Dashboard', builder: 'CV Builder', coverletter: 'Cover Letter', settings: 'Settings', jobmatch: 'Job Match' };
  $('#pageTitle').textContent = titles[tab] || 'Dashboard';

  if (tab === 'builder' || tab === 'coverletter') {
    renderCV();
    renderCoverLetter();
  }
  updateDashboard();
}

/* ====== FORM HANDLING ====== */
function bindFormFields() {
  $$('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field === 'skillInput') return;
    el.addEventListener('input', () => {
      if (el.type === 'file') return;
      data[field] = el.value;
      saveData();
    });
    el.addEventListener('change', () => {
      if (el.type === 'file') return;
      data[field] = el.value;
      saveData();
    });
  });

  // Cover letter fields
  ['clCompany', 'clManager', 'clPosition', 'clAddress', 'clNotes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const key = id.replace('cl', '').toLowerCase();
        data.coverLetter[key] = el.value;
        saveData();
      });
    }
  });

  // Summary char count
  const summary = document.getElementById('careerSummary');
  if (summary) {
    summary.addEventListener('input', () => {
      document.getElementById('summaryChars').textContent = summary.value.length;
    });
  }

  // API key (session-only — never persisted to localStorage)
  const apiKey = document.getElementById('apiKey');
  if (apiKey) {
    apiKey.addEventListener('input', () => {
      data.apiKey = apiKey.value;
      try { sessionStorage.setItem('smartcv_api_key', apiKey.value); } catch (e) { /* ignore */ }
      showSaveIndicator();
    });
  }
}

function restoreFormFields() {
  $$('[data-field]').forEach(el => {
    const field = el.dataset.field;
    if (field === 'skillInput') return;
    if (data[field] !== undefined) el.value = data[field];
  });

  document.getElementById('clCompany').value = data.coverLetter.company || '';
  document.getElementById('clManager').value = data.coverLetter.manager || '';
  document.getElementById('clPosition').value = data.coverLetter.position || '';
  document.getElementById('clAddress').value = data.coverLetter.address || '';
  document.getElementById('clNotes').value = data.coverLetter.notes || '';
  document.getElementById('apiKey').value = data.apiKey || '';

  const summary = document.getElementById('careerSummary');
  if (summary) document.getElementById('summaryChars').textContent = summary.value.length;

  if (data.photo) {
    const preview = document.getElementById('photoPreview');
    preview.src = data.photo;
    preview.style.display = 'block';
    document.querySelector('.photo-placeholder').style.display = 'none';
    document.getElementById('photoRemove').style.display = 'inline-flex';
  }
}

/* ====== FORM SECTION NAVIGATION ====== */
$$('.form-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    currentFormSection = section;
    $$('.form-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.form-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');
  });
});

/* ====== PHOTO UPLOAD ====== */
function setupPhotoUpload() {
  const upload = document.getElementById('photoUpload');
  const input = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');
  const placeholder = document.querySelector('.photo-placeholder');
  const removeBtn = document.getElementById('photoRemove');

  upload.addEventListener('click', (e) => {
    if (e.target.closest('.photo-remove')) return;
    input.click();
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePhotoFile(file);
  });

  // Drag & drop
  upload.addEventListener('dragover', (e) => {
    e.preventDefault();
    upload.classList.add('drag-over');
  });
  upload.addEventListener('dragleave', () => {
    upload.classList.remove('drag-over');
  });
  upload.addEventListener('drop', (e) => {
    e.preventDefault();
    upload.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handlePhotoFile(file);
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    data.photo = '';
    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    input.value = '';
    saveData();
  });
}

function handlePhotoFile(file) {
  if (!file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    data.photo = e.target.result;
    const preview = document.getElementById('photoPreview');
    preview.src = data.photo;
    preview.style.display = 'block';
    document.querySelector('.photo-placeholder').style.display = 'none';
    document.getElementById('photoRemove').style.display = 'inline-flex';
    saveData();
  };
  reader.readAsDataURL(file);
}

/* ====== SKILLS ====== */
function addSkill() {
  const input = document.getElementById('skillInput');
  const skill = input.value.trim();
  if (!skill) return;
  if (data.skills.includes(skill)) return;
  data.skills.push(skill);
  input.value = '';
  renderSkills();
  saveData();
}

function removeSkill(index) {
  data.skills.splice(index, 1);
  renderSkills();
  saveData();
}

function renderSkills() {
  const container = document.getElementById('skillsContainer');
  container.innerHTML = data.skills.map((skill, i) =>
    `<span class="skill-tag">${skill} <i class="fas fa-times" onclick="removeSkill(${i})"></i></span>`
  ).join('');
}

// Enter key for skills
document.addEventListener('DOMContentLoaded', () => {
  const skillInput = document.getElementById('skillInput');
  if (skillInput) {
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    });
  }
});

/* ====== EDUCATION ====== */
function addEducation(edu) {
  edu = edu || { institution: '', degree: '', year: '' };
  const i = data.education.length;
  data.education.push(edu);
  renderEducation();
  saveData();
}

function removeEducation(index) {
  data.education.splice(index, 1);
  renderEducation();
  saveData();
}

function renderEducation() {
  const container = document.getElementById('educationContainer');
  if (data.education.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No education entries yet. Click "Add" to begin.</p>';
    return;
  }
  container.innerHTML = data.education.map((edu, i) => `
    <div class="entry-card">
      <div class="entry-header">
        <h4><i class="fas fa-graduation-cap"></i> Education #${i + 1}</h4>
        <button class="entry-remove" onclick="removeEducation(${i})"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" value="${escapeHtml(edu.institution)}" oninput="data.education[${i}].institution=this.value;saveData();renderCV();" placeholder="University name">
      </div>
      <div class="form-group">
        <label>Degree/Course</label>
        <input type="text" value="${escapeHtml(edu.degree)}" oninput="data.education[${i}].degree=this.value;saveData();renderCV();" placeholder="e.g. B.Sc. Computer Science">
      </div>
      <div class="form-group">
        <label>Graduation Year</label>
        <input type="text" value="${escapeHtml(edu.year)}" oninput="data.education[${i}].year=this.value;saveData();renderCV();" placeholder="e.g. 2024">
      </div>
    </div>
  `).join('');
}

/* ====== EXPERIENCE ====== */
function addExperience(exp) {
  exp = exp || { company: '', title: '', startDate: '', endDate: '', responsibilities: '' };
  data.experience.push(exp);
  renderExperience();
  saveData();
}

function removeExperience(index) {
  data.experience.splice(index, 1);
  renderExperience();
  saveData();
}

function renderExperience() {
  const container = document.getElementById('experienceContainer');
  if (data.experience.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No experience entries yet. Click "Add" to begin.</p>';
    return;
  }
  container.innerHTML = data.experience.map((exp, i) => `
    <div class="entry-card">
      <div class="entry-header">
        <h4><i class="fas fa-briefcase"></i> Experience #${i + 1}</h4>
        <button class="entry-remove" onclick="removeExperience(${i})"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" value="${escapeHtml(exp.company)}" oninput="data.experience[${i}].company=this.value;saveData();renderCV();" placeholder="Company name">
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" value="${escapeHtml(exp.title)}" oninput="data.experience[${i}].title=this.value;saveData();renderCV();" placeholder="e.g. Software Engineer">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Start Date</label>
          <input type="text" value="${escapeHtml(exp.startDate)}" oninput="data.experience[${i}].startDate=this.value;saveData();renderCV();" placeholder="e.g. Jan 2022">
        </div>
        <div class="form-group">
          <label>End Date</label>
          <input type="text" value="${escapeHtml(exp.endDate)}" oninput="data.experience[${i}].endDate=this.value;saveData();renderCV();" placeholder="e.g. Present">
        </div>
      </div>
      <div class="form-group">
        <label>Responsibilities</label>
        <textarea rows="3" oninput="data.experience[${i}].responsibilities=this.value;saveData();renderCV();" placeholder="Describe your key responsibilities and achievements...">${escapeHtml(exp.responsibilities)}</textarea>
      </div>
    </div>
  `).join('');
}

/* ====== PROJECTS ====== */
function addProject(proj) {
  proj = proj || { name: '', description: '', technologies: '' };
  data.projects.push(proj);
  renderProjects();
  saveData();
}

function removeProject(index) {
  data.projects.splice(index, 1);
  renderProjects();
  saveData();
}

function renderProjects() {
  const container = document.getElementById('projectsContainer');
  if (data.projects.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No projects yet. Click "Add" to begin.</p>';
    return;
  }
  container.innerHTML = data.projects.map((proj, i) => `
    <div class="entry-card">
      <div class="entry-header">
        <h4><i class="fas fa-folder"></i> Project #${i + 1}</h4>
        <button class="entry-remove" onclick="removeProject(${i})"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" value="${escapeHtml(proj.name)}" oninput="data.projects[${i}].name=this.value;saveData();renderCV();" placeholder="Project name">
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea rows="3" oninput="data.projects[${i}].description=this.value;saveData();renderCV();" placeholder="Brief description of the project...">${escapeHtml(proj.description)}</textarea>
      </div>
      <div class="form-group">
        <label>Technologies Used</label>
        <input type="text" value="${escapeHtml(proj.technologies)}" oninput="data.projects[${i}].technologies=this.value;saveData();renderCV();" placeholder="e.g. React, Node.js, MongoDB">
      </div>
    </div>
  `).join('');
}

/* ====== REFERENCES ====== */
function addReference(ref) {
  ref = ref || { name: '', position: '', contact: '' };
  data.references.push(ref);
  renderReferences();
  saveData();
}

function removeReference(index) {
  data.references.splice(index, 1);
  renderReferences();
  saveData();
}

function renderReferences() {
  const container = document.getElementById('referencesContainer');
  if (data.references.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted)">No references yet. Click "Add" to begin.</p>';
    return;
  }
  container.innerHTML = data.references.map((ref, i) => `
    <div class="entry-card">
      <div class="entry-header">
        <h4><i class="fas fa-user"></i> Reference #${i + 1}</h4>
        <button class="entry-remove" onclick="removeReference(${i})"><i class="fas fa-trash-alt"></i> Remove</button>
      </div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" value="${escapeHtml(ref.name)}" oninput="data.references[${i}].name=this.value;saveData();renderCV();" placeholder="Reference name">
      </div>
      <div class="form-group">
        <label>Position</label>
        <input type="text" value="${escapeHtml(ref.position)}" oninput="data.references[${i}].position=this.value;saveData();renderCV();" placeholder="e.g. Senior Manager">
      </div>
      <div class="form-group">
        <label>Contact Information</label>
        <input type="text" value="${escapeHtml(ref.contact)}" oninput="data.references[${i}].contact=this.value;saveData();renderCV();" placeholder="Email or phone">
      </div>
    </div>
  `).join('');
}

/* ====== ESCAPE HTML ====== */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ====== TEMPLATE ====== */
function setTemplate(template) {
  data.template = template;
  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === template));
  renderCV();
  saveData();
}

/* ====== CV RENDER ====== */
function renderCV() {
  const container = document.getElementById('cvPreview');
  const name = data.fullName || 'Your Name';
  const title = data.professionalTitle || 'Professional Title';
  const summary = data.careerSummary || '';

  if (!data.fullName && data.skills.length === 0 && data.experience.length === 0) {
    container.innerHTML = `
      <div class="cv-empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>Your CV will appear here</h3>
        <p>Fill in your details in the form to see a live preview</p>
      </div>`;
    return;
  }

  const contact = [];
  if (data.email) contact.push(`<span>${escapeHtml(data.email)}</span>`);
  if (data.phone) contact.push(`<span>${escapeHtml(data.phone)}</span>`);
  if (data.location) contact.push(`<span>${escapeHtml(data.location)}</span>`);
  if (data.linkedin) contact.push(`<span>${escapeHtml(data.linkedin)}</span>`);
  if (data.portfolio) contact.push(`<span>${escapeHtml(data.portfolio)}</span>`);

  const photoHtml = data.photo
    ? `<img class="cv-header-photo" src="${data.photo}" alt="Photo">`
    : '';

  const skillsHtml = data.skills.length > 0
    ? `<div class="cv-section"><h2>Skills</h2><div class="cv-skills-list">${data.skills.map(s => `<span class="cv-skill-item">${escapeHtml(s)}</span>`).join('')}</div></div>`
    : '';

  const summaryHtml = summary
    ? `<div class="cv-section"><h2>Professional Summary</h2><p>${escapeHtml(summary)}</p></div>`
    : '';

  const educationHtml = data.education.length > 0
    ? `<div class="cv-section"><h2>Education</h2>${data.education.map(edu =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(edu.degree)}</div>
          <div class="cv-item-title">${escapeHtml(edu.institution)}</div>
          <div class="cv-item-date">${escapeHtml(edu.year)}</div>
        </div>`
      ).join('')}</div>`
    : '';

  const experienceHtml = data.experience.length > 0
    ? `<div class="cv-section"><h2>Work Experience</h2>${data.experience.map(exp =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(exp.title)}</div>
          <div class="cv-item-title">${escapeHtml(exp.company)}</div>
          <div class="cv-item-date">${escapeHtml(exp.startDate)}${exp.endDate ? ' - ' + escapeHtml(exp.endDate) : ''}</div>
          ${exp.responsibilities ? `<div class="cv-item-desc">${escapeHtml(exp.responsibilities)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const projectsHtml = data.projects.length > 0
    ? `<div class="cv-section"><h2>Projects</h2>${data.projects.map(proj =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(proj.name)}</div>
          ${proj.technologies ? `<div class="cv-item-date">${escapeHtml(proj.technologies)}</div>` : ''}
          ${proj.description ? `<div class="cv-item-desc">${escapeHtml(proj.description)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const referencesHtml = data.references.length > 0
    ? `<div class="cv-section"><h2>References</h2>${data.references.map(ref =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(ref.name)}</div>
          <div class="cv-item-title">${escapeHtml(ref.position)}</div>
          ${ref.contact ? `<div class="cv-item-date">${escapeHtml(ref.contact)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const templateClass = `cv-template-${data.template}`;

  if (data.template === 'modern') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          <div class="cv-title">${escapeHtml(title)}</div>
          <div class="cv-contact">${contact.join('')}</div>
        </div>
      </div>
      <div class="cv-body">
        <div class="cv-sidebar">
          ${skillsHtml}
          ${educationHtml}
          ${referencesHtml}
        </div>
        <div class="cv-main">
          ${summaryHtml}
          ${experienceHtml}
          ${projectsHtml}
        </div>
      </div>
    </div>`;
  } else if (data.template === 'professional') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml ? `<div>${photoHtml}</div>` : ''}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          <div class="cv-title">${escapeHtml(title)}</div>
          <div class="cv-contact">${contact.join(' | ')}</div>
        </div>
      </div>
      <div class="cv-body">
        ${summaryHtml}
        ${skillsHtml}
        ${experienceHtml}
        ${educationHtml}
        ${projectsHtml}
        ${referencesHtml}
      </div>
    </div>`;
  } else {
    // Minimal
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          <div class="cv-title">${escapeHtml(title)}</div>
          <div class="cv-contact">${contact.join(' / ')}</div>
        </div>
      </div>
      <div class="cv-body">
        ${summaryHtml}
        ${skillsHtml}
        ${educationHtml}
        ${experienceHtml}
        ${projectsHtml}
        ${referencesHtml}
      </div>
    </div>`;
  }
}

/* ====== COVER LETTER TEMPLATE ====== */
function setClTemplate(template) {
  data.clTemplate = template;
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === template));
  renderCoverLetter();
  saveData();
}

/* ====== COVER LETTER ====== */
function renderCoverLetter() {
  const container = document.getElementById('clPreview');
  const name = data.fullName || 'Your Name';
  const email = data.email || '';
  const phone = data.phone || '';
  const location = data.location || '';
  const title = data.professionalTitle || 'Professional';
  const summary = data.careerSummary || '';

  const cl = data.coverLetter;
  const company = cl.company || '[Company Name]';
  const manager = cl.manager || '[Hiring Manager]';
  const position = cl.position || '[Job Position]';
  const address = cl.address || '';
  const notes = cl.notes || '';

  if (!company && !manager && !position && !name) {
    container.innerHTML = `
      <div class="cv-empty-state">
        <i class="fas fa-envelope-open-text"></i>
        <h3>Your Cover Letter will appear here</h3>
        <p>Enter the company details and click Generate</p>
      </div>`;
    return;
  }

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const skillsText = data.skills.length > 0
    ? `I bring expertise in ${data.skills.slice(0, 5).join(', ')}${data.skills.length > 5 ? `, and more` : ''}, which I am eager to apply at ${company}.`
    : '';

  const expText = data.experience.length > 0
    ? `During my tenure at ${data.experience[0].company}, I served as a ${data.experience[0].title}, where ${data.experience[0].responsibilities ? 'I was responsible for ' + data.experience[0].responsibilities.toLowerCase() : 'I developed key skills and delivered impactful results'}.`
    : 'My professional background has equipped me with the skills and determination to excel in this role.';

  const summaryText = summary
    ? summary
    : `As a dedicated ${title}, I am excited about the opportunity to contribute to ${company}'s success.`;

  const clTemplateClass = `cl-template-${data.clTemplate || 'modern'}`;

  const letterContent = `<div class="cl-header">
    <div class="cl-sender">${escapeHtml(name)}</div>
    ${email ? `<div class="cl-sender-email">${escapeHtml(email)}${phone ? ' | ' + escapeHtml(phone) : ''}</div>` : ''}
    ${location ? `<div style="color:#666;font-size:0.85rem;margin-bottom:4px">${escapeHtml(location)}</div>` : ''}
  </div>
  <div class="cl-date">${today}</div>
  <div class="cl-recipient">
    <p>${escapeHtml(manager)}</p>
    <p>${escapeHtml(company)}</p>
    ${address ? `<p>${escapeHtml(address)}</p>` : ''}
  </div>
  <div class="cl-greeting">Dear ${escapeHtml(manager)},</div>
  <div class="cl-body">
    <p>I am writing to express my enthusiastic interest in the <strong>${escapeHtml(position)}</strong> position at <strong>${escapeHtml(company)}</strong>. ${escapeHtml(summaryText)}</p>
    <p>${expText}</p>
    ${skillsText ? `<p>${skillsText}</p>` : ''}
    ${notes ? `<p>${escapeHtml(notes)}</p>` : ''}
    <p>I would welcome the opportunity to discuss how my experience and skills align with the needs of ${escapeHtml(company)}. Thank you for your time and consideration.</p>
  </div>
  <div class="cl-closing">
    <p>Sincerely,</p>
    <p><strong>${escapeHtml(name)}</strong></p>
  </div>`;

  container.innerHTML = `<div class="cl-content ${clTemplateClass}">${letterContent}</div>`;
}

function regenerateCoverLetter() {
  renderCoverLetter();
}

/* ====== DASHBOARD ====== */
function updateDashboard() {
  let filled = 0;
  if (data.fullName) filled++;
  if (data.email) filled++;
  if (data.phone) filled++;
  if (data.location) filled++;
  if (data.professionalTitle) filled++;
  if (data.careerSummary) filled++;
  const photoScore = data.photo ? 0.5 : 0;

  const eduScore = Math.min(data.education.length, 3);
  const expScore = Math.min(data.experience.length, 3);
  const projScore = Math.min(data.projects.length, 3);
  const skillScore = Math.min(data.skills.length, 5);
  const refScore = Math.min(data.references.length, 2);

  const totalPossible = 6 + 0.5 + 3 + 3 + 3 + 5 + 2;
  const currentScore = filled + photoScore + eduScore + expScore + projScore + skillScore + refScore;
  const percent = Math.min(Math.round((currentScore / totalPossible) * 100), 100);

  document.getElementById('completionPercent').textContent = percent + '%';
  document.getElementById('completionFill').style.width = percent + '%';
  document.getElementById('skillCount').textContent = data.skills.length;
  document.getElementById('expCount').textContent = data.experience.length;
  document.getElementById('projectCount').textContent = data.projects.length;

  renderTips();
}

/* ====== CV TIPS ====== */
function renderTips() {
  const container = document.getElementById('dashboardTips');
  if (!container) return;

  const tips = [];

  if (!data.fullName) tips.push({ icon: 'fa-user', text: 'Add your full name so employers know who you are.', action: 'builder', priority: 1 });
  if (!data.email) tips.push({ icon: 'fa-envelope', text: 'Add an email address so employers can contact you.', action: 'builder', priority: 1 });
  if (!data.phone) tips.push({ icon: 'fa-phone', text: 'Add a phone number for employers to reach you.', action: 'builder', priority: 1 });
  if (!data.location) tips.push({ icon: 'fa-map-marker-alt', text: 'Add your location — many recruiters filter by location.', action: 'builder', priority: 2 });
  if (!data.professionalTitle) tips.push({ icon: 'fa-briefcase', text: 'Add a professional title to immediately communicate your role.', action: 'builder', priority: 1 });
  if (!data.careerSummary) tips.push({ icon: 'fa-pen', text: 'Write a career summary to highlight your key achievements.', action: 'builder', priority: 1 });
  if (data.education.length === 0) tips.push({ icon: 'fa-graduation-cap', text: 'Add your education background.', action: 'builder', priority: 2 });
  if (data.experience.length === 0) tips.push({ icon: 'fa-briefcase', text: 'Add work experience to strengthen your CV.', action: 'builder', priority: 1 });
  if (data.skills.length < 3) tips.push({ icon: 'fa-code', text: 'Add more skills — aim for at least 5 relevant skills.', action: 'builder', priority: 2 });
  if (data.projects.length === 0) tips.push({ icon: 'fa-project-diagram', text: 'Add projects to demonstrate your practical experience.', action: 'builder', priority: 3 });
  if (data.references.length === 0) tips.push({ icon: 'fa-users', text: 'Add references to build trust with employers.', action: 'builder', priority: 3 });

  // Cover letter tips
  if (data.fullName && (!data.coverLetter.company || !data.coverLetter.position)) {
    tips.push({ icon: 'fa-envelope', text: 'Fill in the company name and job position to generate a cover letter.', action: 'coverletter', priority: 2 });
  }

  // Profile tips
  const profileCount = Object.keys(profiles.items || {}).length;
  if (profileCount <= 1 && data.fullName) {
    tips.push({ icon: 'fa-user-circle', text: 'Create multiple CV profiles to tailor your application for different jobs.', action: 'settings', priority: 3 });
  }

  // Sort by priority
  tips.sort((a, b) => a.priority - b.priority);

  // Show top 5
  const showTips = tips.slice(0, 5);

  if (showTips.length === 0) {
    container.innerHTML = `<div class="tips-card glass tips-complete">
      <i class="fas fa-check-circle"></i>
      <span>Your CV looks great! All key sections are filled in.</span>
    </div>`;
    return;
  }

  container.innerHTML = `<div class="tips-card glass">
    <div class="tips-header">
      <i class="fas fa-lightbulb"></i>
      <h4>Tips to Improve Your CV</h4>
      <span class="tips-count">${showTips.length} of ${tips.length}</span>
    </div>
    <div class="tips-list">
      ${showTips.map(t => `
        <div class="tip-item" onclick="switchTab('${t.action}')">
          <div class="tip-icon"><i class="fas ${t.icon}"></i></div>
          <span class="tip-text">${t.text}</span>
          <i class="fas fa-chevron-right tip-arrow"></i>
        </div>
      `).join('')}
    </div>
  </div>`;
}

/* ====== PDF EXPORT ====== */
function getPdfOpt(filename) {
  return {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
}

function downloadCVPdf() {
  const el = document.querySelector('#cvPreview .cv-content');
  if (!el || !data.fullName) { alert('Please fill in your details first.'); return; }
  const name = data.fullName.replace(/\s+/g, '_');
  html2pdf().set(getPdfOpt(`${name}_CV.pdf`)).from(el).save();
}

function downloadCoverLetterPDF() {
  const el = document.querySelector('#clPreview .cl-content');
  if (!el || !data.fullName) { alert('Please fill in your details first.'); return; }
  const name = data.fullName.replace(/\s+/g, '_');
  html2pdf().set(getPdfOpt(`${name}_Cover_Letter.pdf`)).from(el).save();
}

function printCV() {
  const el = document.querySelector('#cvPreview .cv-content');
  if (!el || !data.fullName) { alert('Please fill in your details first.'); return; }
  html2pdf().set(getPdfOpt(`CV_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  });
}

function printCoverLetter() {
  const el = document.querySelector('#clPreview .cl-content');
  if (!el || !data.fullName) { alert('Please fill in your details first.'); return; }
  html2pdf().set(getPdfOpt(`Cover_Letter_${Date.now()}.pdf`)).from(el).toPdf().get('pdf').then(pdf => {
    window.open(pdf.output('bloburl'), '_blank');
  });
}

/* ====== DOCX EXPORT ====== */
async function downloadCVDocx() {
  const content = document.querySelector('#cvPreview .cv-content');
  if (!content || !data.fullName) {
    alert('Please fill in your details first to generate a CV.');
    return;
  }
  const docxStyles = getDocxStyles();
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.fullName} - CV</title><style>${docxStyles}</style></head><body>${content.innerHTML}</body></html>`;
  try {
    const blob = await HTMLtoDOCX(fullHtml);
    downloadBlob(blob, `${data.fullName.replace(/\s+/g, '_')}_CV.docx`);
  } catch (e) {
    alert('DOCX generation failed: ' + e.message);
  }
}

async function downloadCoverLetterDocx() {
  const content = document.querySelector('#clPreview .cl-content');
  if (!content || !data.fullName) {
    alert('Please fill in your details first to generate a Cover Letter.');
    return;
  }
  const docxStyles = getDocxStyles();
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${data.fullName} - Cover Letter</title><style>${docxStyles}</style></head><body>${content.innerHTML}</body></html>`;
  try {
    const blob = await HTMLtoDOCX(fullHtml);
    downloadBlob(blob, `${data.fullName.replace(/\s+/g, '_')}_Cover_Letter.docx`);
  } catch (e) {
    alert('DOCX generation failed: ' + e.message);
  }
}

function getDocxStyles() {
  return `
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.5; margin: 1in; background: #fff; }
    h1 { font-size: 18pt; margin-bottom: 2pt; color: #333; }
    h2 { font-size: 13pt; text-transform: uppercase; letter-spacing: 1px; color: #6c5ce7; border-bottom: 1px solid #ddd; padding-bottom: 4pt; margin-top: 14pt; margin-bottom: 8pt; }
    p { margin: 4pt 0; color: #333; }
    .cl-content { background:#fff; color:#333; padding:40px 48px; }
    .cl-sender { font-weight:700; }
    .cl-template-modern .cl-sender { font-size:1.4rem; color:#6c5ce7; }
    .cl-template-professional .cl-sender { font-size:1.6rem; color:#2c3e50; }
    .cl-template-minimal .cl-sender { font-size:1.2rem; color:#222; }
    .cl-sender-email { color:#666; font-size:0.85rem; }
    .cl-date { margin:16px 0; color:#999; font-size:0.85rem; }
    .cl-greeting { margin:14px 0; color:#333; }
    .cl-body p { margin-bottom:12px; color:#333; }
    .cl-recipient p { color:#333; }
    .cl-closing { margin-top:24px; color:#333; }
    .cv-content { background:#fff; color:#333; }
    .cv-header h1 { font-size:18pt; margin-bottom:2pt; color:#333; }
    .cv-title { color:#666; }
    .cv-contact span { margin-right:12pt; color:#555; }
    .cv-section { margin-bottom:10pt; }
    .cv-section h2 { font-size:13pt; text-transform:uppercase; letter-spacing:1px; color:#6c5ce7; border-bottom:1px solid #ddd; padding-bottom:4pt; margin-top:14pt; margin-bottom:8pt; }
    .cv-item { margin-bottom:8pt; }
    .cv-item-title { font-weight:bold; color:#333; }
    .cv-item-subtitle { color:#6c5ce7; }
    .cv-item-date { color:#999; font-size:10pt; }
    .cv-item-desc { margin-top:2pt; color:#555; }
    .cv-skills-list span { display:inline-block; margin:2pt 4pt 2pt 0; padding:2pt 8pt; background:#eee; border-radius:10pt; color:#555; font-size:9pt; }
    .cv-header-photo { width:80px; height:80px; border-radius:50%; object-fit:cover; }
  `;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ====== JSON EXPORT/IMPORT ====== */
function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SmartCV_Data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      data = { ...data, ...imported };
      if (imported.coverLetter) data.coverLetter = { ...data.coverLetter, ...imported.coverLetter };
      saveData();
      restoreFormFields();
      renderSkills();
      renderEducation();
      renderExperience();
      renderProjects();
      renderReferences();
      renderCV();
      renderCoverLetter();
      updateDashboard();
      alert('Data imported successfully!');
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

/* ====== CLEAR DATA ====== */
function clearAllData() {
  if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return;
  data = { ...getDefaultData(), theme: data.theme };
  saveData();
  restoreFormFields();
  renderSkills();
  renderEducation();
  renderExperience();
  renderProjects();
  renderReferences();
  renderCV();
  renderCoverLetter();
  updateDashboard();
}

/* ====== AI PLACEHOLDER FUNCTIONS ====== */
function generateAICV() {
  const apiKey = data.apiKey;
  if (!apiKey) { alert('Please enter your OpenAI API key in Settings first.'); return; }
  if (!data.fullName) { alert('Please fill in your name and other details first.'); return; }

  const prompt = `You are a Professional CV Writer. Enhance the following CV information by writing a compelling professional summary (2-3 paragraphs) and bullet points for each experience entry.

Name: ${data.fullName}
Title: ${data.professionalTitle || 'N/A'}
Skills: ${data.skills.join(', ') || 'N/A'}
Experience: ${JSON.stringify(data.experience, null, 2)}
Education: ${JSON.stringify(data.education, null, 2)}
Projects: ${JSON.stringify(data.projects, null, 2)}

Return ONLY the enhanced summary text — no extra commentary, no markdown formatting.`;

  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  }).then(res => {
    if (!res.ok) return res.json().then(e => { throw new Error(e.error?.message || 'API error') });
    return res.json();
  }).then(res => {
    const enhanced = res.choices[0].message.content.trim();
    data.careerSummary = enhanced;
    document.getElementById('careerSummary').value = enhanced;
    document.getElementById('summaryChars').textContent = enhanced.length;
    saveData();
    renderCV();
    alert('CV enhanced successfully!');
  }).catch(err => alert('AI enhancement failed: ' + err.message));
}

function generateAICoverLetter() {
  const apiKey = data.apiKey;
  if (!apiKey) { alert('Please enter your OpenAI API key in Settings first.'); return; }
  if (!data.fullName || !data.coverLetter.company || !data.coverLetter.position) {
    alert('Please fill in your name, company name, and job position first.');
    return;
  }

  const prompt = `You are a Professional Cover Letter Writer. Write a compelling, professional cover letter based on:

Applicant Name: ${data.fullName}
Applicant Title: ${data.professionalTitle || 'Professional'}
Position: ${data.coverLetter.position}
Company: ${data.coverLetter.company}
Hiring Manager: ${data.coverLetter.manager || 'Hiring Manager'}
Company Address: ${data.coverLetter.address || ''}
Skills: ${data.skills.join(', ') || 'N/A'}
Experience: ${JSON.stringify(data.experience, null, 2)}
Additional Notes: ${data.coverLetter.notes || ''}

Write a complete, ready-to-send cover letter. Use today's date. Be specific using the details provided. Return ONLY the letter body (no subject line, no meta text). Format it with clear paragraphs.`;

  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  }).then(res => {
    if (!res.ok) return res.json().then(e => { throw new Error(e.error?.message || 'API error') });
    return res.json();
  }).then(res => {
    const letter = res.choices[0].message.content.trim();

    // Try to extract company, manager, position from the generated letter
    const lines = letter.split('\n').filter(l => l.trim());
    const companyMatch = letter.match(/(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s+position|\s+role|\s+team|\.|,)/i);
    const managerMatch = letter.match(/Dear\s+(.+?),/i);

    if (managerMatch) data.coverLetter.manager = managerMatch[1].trim();
    // Update form fields
    document.getElementById('clManager').value = data.coverLetter.manager || '';
    document.getElementById('clCompany').value = data.coverLetter.company || '';
    document.getElementById('clPosition').value = data.coverLetter.position || '';

    // Store full letter in notes so user can review
    data.coverLetter.notes = 'AI-generated letter below (you may edit):\n\n' + letter;
    document.getElementById('clNotes').value = data.coverLetter.notes;
    saveData();
    renderCoverLetter();
    alert('Cover letter generated successfully! Check the preview.');
  }).catch(err => alert('AI generation failed: ' + err.message));
}

/* ====== PROFILE MANAGEMENT ====== */
function switchProfile(id) {
  profiles.items[currentProfileId].data = JSON.parse(JSON.stringify(data));
  currentProfileId = id;
  profiles.current = id;
  data = profiles.items[id].data;
  saveProfiles();
  restoreFormFields();
  renderSkills();
  renderEducation();
  renderExperience();
  renderProjects();
  renderReferences();
  renderCV();
  renderCoverLetter();
  updateDashboard();
  updateProfileSelector();
  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === data.template));
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === data.clTemplate));
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === data.theme));
  document.documentElement.setAttribute('data-theme', data.theme || 'light');
  const tl = document.querySelector('.theme-toggle span');
  if (tl) tl.textContent = data.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

function createProfile(name) {
  if (!name.trim()) { alert('Please enter a profile name.'); return; }
  const id = 'profile_' + Date.now();
  profiles.items[id] = { name: name.trim(), data: getDefaultData() };
  saveProfiles();
  switchProfile(id);
  renderProfileList();
}

function renameProfile(id, name) {
  if (!name.trim()) return;
  profiles.items[id].name = name.trim();
  saveProfiles();
  updateProfileSelector();
  renderProfileList();
}

function deleteProfile(id) {
  if (Object.keys(profiles.items).length <= 1) {
    alert('Cannot delete the last profile.');
    return;
  }
  if (!confirm(`Delete profile "${profiles.items[id].name}"? This cannot be undone.`)) return;
  if (currentProfileId === id) {
    const keys = Object.keys(profiles.items).filter(k => k !== id);
    delete profiles.items[id];
    switchProfile(keys[0]);
  } else {
    delete profiles.items[id];
    saveProfiles();
  }
  renderProfileList();
}

function updateProfileSelector() {
  const sel = document.getElementById('profileSelect');
  if (!sel) return;
  sel.innerHTML = Object.entries(profiles.items).map(([id, p]) =>
    `<option value="${id}" ${id === currentProfileId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');
}

function renderProfileList() {
  const container = document.getElementById('profileList');
  if (!container) return;
  container.innerHTML = Object.entries(profiles.items).map(([id, p]) => `
    <div class="profile-item ${id === currentProfileId ? 'active' : ''}">
      <div class="profile-info">
        <input class="profile-name-input" value="${escapeHtml(p.name)}"
          onchange="renameProfile('${id}', this.value)"
          ${id === 'default' ? 'readonly' : ''}
          title="Click to rename">
        <span class="profile-badge">${id === currentProfileId ? 'Active' : ''}</span>
      </div>
      <div class="profile-actions">
        ${id !== 'default' ? `<button class="btn btn-sm btn-outline" onclick="switchProfile('${id}')"><i class="fas fa-check"></i> Switch</button>
        <button class="btn btn-sm btn-danger" onclick="deleteProfile('${id}')"><i class="fas fa-trash-alt"></i></button>` : ''}
      </div>
    </div>
  `).join('');
}

/* ====== CUSTOM SKILLS (for Job Match) ====== */
function addCustomSkill() {
  const nameEl = document.getElementById('customSkillName');
  const kwEl = document.getElementById('customSkillKeywords');
  const name = nameEl.value.trim();
  const keywords = kwEl.value.trim();
  if (!name || !keywords) { alert('Please enter both a skill name and keywords.'); return; }
  if (!data.customSkills) data.customSkills = [];
  const kwList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  data.customSkills.push({ name, keywords: kwList });
  nameEl.value = '';
  kwEl.value = '';
  renderCustomSkills();
  saveData();
}

function removeCustomSkill(index) {
  if (!data.customSkills) return;
  data.customSkills.splice(index, 1);
  renderCustomSkills();
  saveData();
}

function renderCustomSkills() {
  const container = document.getElementById('customSkillsContainer');
  if (!container) return;
  const skills = data.customSkills || [];
  if (skills.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px">No custom keyword mappings yet.</p>';
    return;
  }
  container.innerHTML = skills.map((s, i) =>
    `<div class="entry-card" style="padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="flex:1">
        <strong style="font-size:0.85rem">${escapeHtml(s.name)}</strong>
        <span style="font-size:0.75rem;color:var(--text-muted);margin-left:8px">${s.keywords.join(', ')}</span>
      </div>
      <button class="btn btn-sm btn-danger" onclick="removeCustomSkill(${i})" style="padding:4px 8px;font-size:0.7rem"><i class="fas fa-times"></i></button>
    </div>`
  ).join('');
}

/* ====== JOB MATCH / ATS SCORE ====== */
const jobMatchSkills = {
  'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'es2020'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'react.js', 'react js'],
  'Angular': ['angular', 'angularjs', 'angular.js', 'angular 2'],
  'Vue.js': ['vue', 'vuejs', 'vue.js', 'vue js'],
  'Svelte': ['svelte'],
  'Node.js': ['node', 'nodejs', 'node.js', 'node js', 'express', 'express.js'],
  'Python': ['python'],
  'Java': ['java'],
  'C#': ['c#', 'c sharp'],
  'C++': ['c++', 'cpp'],
  'Go': ['golang', 'go lang'],
  'Rust': ['rust'],
  'Ruby': ['ruby', 'ruby on rails', 'rails'],
  'PHP': ['php', 'laravel', 'symfony'],
  'SQL': ['sql', 'mysql', 'postgresql', 'postgres', 'database'],
  'MongoDB': ['mongodb', 'mongo', 'nosql'],
  'Redis': ['redis'],
  'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'],
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'Docker': ['docker', 'container'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'CI/CD': ['ci/cd', 'ci cd', 'jenkins', 'github actions', 'gitlab ci', 'circleci'],
  'Git': ['git', 'github', 'gitlab', 'version control'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3', 'scss', 'sass', 'less', 'tailwind', 'bootstrap'],
  'REST API': ['rest', 'rest api', 'restful', 'api'],
  'GraphQL': ['graphql', 'gql'],
  'Agile': ['agile', 'scrum', 'kanban', 'sprint'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural network', 'ai'],
  'Data Science': ['data science', 'data analysis', 'analytics', 'statistics'],
  'React Native': ['react native'],
  'Flutter': ['flutter', 'dart'],
  'iOS': ['ios', 'swift', 'objective-c', 'objc'],
  'Android': ['android', 'kotlin', 'java android'],
  'Figma': ['figma', 'ui design', 'design tool'],
  'Jira': ['jira', 'confluence'],
  'Linux': ['linux', 'unix', 'bash', 'shell'],
  'Postman': ['postman', 'insomnia'],
  'Webpack': ['webpack', 'vite', 'esbuild', 'bundler'],
  'Testing': ['testing', 'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium', 'unit test', 'integration test', 'e2e'],
  'Leadership': ['leadership', 'lead', 'manager', 'management', 'team lead', 'tech lead'],
  'Communication': ['communication', 'presentation', 'stakeholder'],
  'Problem Solving': ['problem solving', 'problem-solving', 'analytical'],
};

function analyzeJobMatch() {
  const jobDesc = document.getElementById('jobDescription').value;
  if (!jobDesc.trim()) {
    alert('Please paste a job description first.');
    return;
  }

  const result = calculateJobMatch(jobDesc);
  displayJobMatchResult(result);
}

function calculateJobMatch(jobDesc) {
  const lowerJobDesc = jobDesc.toLowerCase();
  const matchedSkills = [];
  const missingSkills = [];
  const userSkillLower = data.skills.map(s => s.toLowerCase());

  // Merge custom skills into the keyword map
  const mergedSkills = { ...jobMatchSkills };
  (data.customSkills || []).forEach(cs => {
    if (cs.name && cs.keywords.length > 0) {
      mergedSkills[cs.name] = cs.keywords;
    }
  });

  for (const [skill, keywords] of Object.entries(mergedSkills)) {
    const foundInJob = keywords.some(k => lowerJobDesc.includes(k));
    if (!foundInJob) continue;

    const userHas = userSkillLower.some(us =>
      us === skill.toLowerCase() || keywords.some(k => us.includes(k))
    );

    if (userHas) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const totalRequired = matchedSkills.length + missingSkills.length;
  const score = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;

  const sections = ['years of experience', 'bachelor', 'master', 'phd', 'degree', 'certification'];
  const foundSections = sections.filter(s => lowerJobDesc.includes(s));

  const expMatch = checkExperienceMatch(jobDesc);

  return { score, matchedSkills, missingSkills, totalRequired, foundSections, expMatch };
}

function checkExperienceMatch(jobDesc) {
  const lower = jobDesc.toLowerCase();
  const patterns = [
    { regex: /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience/i, label: 'years' },
    { regex: /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i, label: 'range' },
  ];
  let requiredYears = 0;
  for (const p of patterns) {
    const match = lower.match(p.regex);
    if (match) {
      if (p.label === 'range') {
        requiredYears = parseInt(match[2]);
      } else {
        requiredYears = parseInt(match[1]);
      }
      break;
    }
  }

  const userExpYears = data.experience.reduce((sum, exp) => {
    let years = 0;
    if (exp.startDate) {
      const start = parseInt(exp.startDate.match(/\d{4}/)?.[0]);
      const end = exp.endDate && exp.endDate.toLowerCase() !== 'present'
        ? parseInt(exp.endDate.match(/\d{4}/)?.[0])
        : new Date().getFullYear();
      if (start) years = end - start;
    }
    return sum + Math.max(years, 0);
  }, 0);

  return { required: requiredYears, user: userExpYears };
}

function displayJobMatchResult(result) {
  const container = document.getElementById('jobMatchResults');

  const scoreColor = result.score >= 70 ? '#10b981' : result.score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = result.score >= 70 ? 'Strong Match' : result.score >= 40 ? 'Moderate Match' : 'Weak Match';

  const matchedHtml = result.matchedSkills.map(s =>
    `<span class="jm-match-tag jm-match-tag-yes"><i class="fas fa-check-circle"></i> ${escapeHtml(s)}</span>`
  ).join('');

  const missingHtml = result.missingSkills.map(s =>
    `<span class="jm-match-tag jm-match-tag-no"><i class="fas fa-plus-circle"></i> ${escapeHtml(s)}</span>`
  ).join('');

  const expHtml = result.expMatch.required > 0
    ? `<div class="jm-exp-bar">
        <div class="jm-exp-label">${result.expMatch.required}+ years required — you have ${result.expMatch.user} years</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (result.expMatch.user / result.expMatch.required) * 100)}%;background:${result.expMatch.user >= result.expMatch.required ? 'var(--success)' : 'var(--warning)'}"></div></div>
      </div>`
    : '';

  container.innerHTML = `
    <div class="jm-results-card glass">
      <div class="jm-score-section">
        <div class="jm-score-ring" style="background: conic-gradient(${scoreColor} ${result.score * 3.6}deg, #eee ${result.score * 3.6}deg)">
          <div class="jm-score-inner">
            <span class="jm-score-value" style="color:${scoreColor}">${result.score}%</span>
            <span class="jm-score-label">${scoreLabel}</span>
          </div>
        </div>
        <div class="jm-score-details">
          <h4>Match Summary</h4>
          <p>Found <strong>${result.totalRequired}</strong> relevant skills in the job description.</p>
          <p>Your CV matches <strong>${result.matchedSkills.length}</strong> of them.</p>
          ${result.expMatch.required > 0 ? `<p>Experience: <strong>${result.expMatch.user}</strong> years (${result.expMatch.required}+ required)</p>` : ''}
        </div>
      </div>

      ${expHtml}

      <div class="jm-section">
        <h4><i class="fas fa-check-circle" style="color:var(--success)"></i> Matched Skills (${result.matchedSkills.length})</h4>
        <div class="jm-tags">${matchedHtml || '<p class="text-muted">No matching skills found</p>'}</div>
      </div>

      <div class="jm-section">
        <h4><i class="fas fa-plus-circle" style="color:var(--warning)"></i> Missing Skills — Consider Adding (${result.missingSkills.length})</h4>
        <div class="jm-tags">${missingHtml || '<p class="text-muted">Great — no missing skills detected!</p>'}</div>
      </div>

      <div class="jm-tip">
        <i class="fas fa-lightbulb"></i>
        <span>Tip: Add missing skills to your CV if you have experience with them. Tailor your CV for each application to improve your match score.</span>
      </div>
    </div>`;
}

/* ====== SIDEBAR TOGGLE (Mobile) ====== */
function setupMobileNav() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });

  // Nav item click - switch tab & close sidebar on mobile
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      }
    });
  });
}

/* ====== KEYBOARD SHORTCUTS ====== */
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch(e.key) {
      case '1': e.preventDefault(); switchTab('dashboard'); break;
      case '2': e.preventDefault(); switchTab('builder'); break;
      case '3': e.preventDefault(); switchTab('coverletter'); break;
      case '4': e.preventDefault(); switchTab('settings'); break;
      case '5': e.preventDefault(); switchTab('jobmatch'); break;
      case 's': e.preventDefault(); saveData(); break;
    }
  }
});

/* ====== INIT ====== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  restoreFormFields();
  bindFormFields();
  setupPhotoUpload();
  renderSkills();
  renderEducation();
  renderExperience();
  renderProjects();
  renderReferences();
  renderCV();
  renderCoverLetter();
  updateDashboard();
  setupMobileNav();

  // Theme toggle in sidebar
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTheme(data.theme === 'dark' ? 'light' : 'dark');
  });

  // Profile selector
  updateProfileSelector();
  const profileSelect = document.getElementById('profileSelect');
  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => switchProfile(e.target.value));
  }
  renderProfileList();

  // Custom skills
  renderCustomSkills();

  // Set active template button
  $$('.template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === data.template));
  $$('.cl-template-btn').forEach(b => b.classList.toggle('active', b.dataset.template === data.clTemplate));

  // Set theme buttons
  $$('.theme-option').forEach(el => el.classList.toggle('active', el.dataset.theme === data.theme));
  const themeLabel = document.querySelector('.theme-toggle span');
  if (themeLabel) themeLabel.textContent = data.theme === 'dark' ? 'Light Mode' : 'Dark Mode';

  // Activate first form section
  document.getElementById('section-personal').classList.add('active');

  console.log('SmartCV AI initialized successfully.');
  console.log('Keyboard shortcuts: Ctrl+1 Dashboard, Ctrl+2 CV Builder, Ctrl+3 Cover Letter, Ctrl+4 Settings, Ctrl+5 Job Match');
});

// Expose functions globally for onclick handlers in HTML
window.switchTab = switchTab;
window.setTheme = setTheme;
window.addEducation = addEducation;
window.removeEducation = removeEducation;
window.addExperience = addExperience;
window.removeExperience = removeExperience;
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.addProject = addProject;
window.removeProject = removeProject;
window.addReference = addReference;
window.removeReference = removeReference;
window.setTemplate = setTemplate;
window.setClTemplate = setClTemplate;
window.regenerateCoverLetter = regenerateCoverLetter;
window.downloadCVPdf = downloadCVPdf;
window.downloadCVDocx = downloadCVDocx;
window.downloadCoverLetterPDF = downloadCoverLetterPDF;
window.downloadCoverLetterDocx = downloadCoverLetterDocx;
window.printCV = printCV;
window.printCoverLetter = printCoverLetter;
window.exportJSON = exportJSON;
window.importJSON = importJSON;
window.clearAllData = clearAllData;
window.createProfile = createProfile;
window.generateAICV = generateAICV;
window.generateAICoverLetter = generateAICoverLetter;
window.analyzeJobMatch = analyzeJobMatch;
window.addCustomSkill = addCustomSkill;
window.removeCustomSkill = removeCustomSkill;
