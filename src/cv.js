import { getData } from './store.js';

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderCV() {
  const container = document.getElementById('cvPreview');
  if (!container) return;
  const d = getData();

  if (!d.fullName && d.skills.length === 0 && d.experience.length === 0) {
    container.innerHTML = `
      <div class="cv-empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>Your CV will appear here</h3>
        <p>Fill in your details in the form to see a live preview</p>
      </div>`;
    return;
  }

  const name = d.fullName || 'Your Name';
  const title = d.professionalTitle || 'Professional Title';

  const contact = [];
  if (d.email) contact.push(`<span>${escapeHtml(d.email)}</span>`);
  if (d.phone) contact.push(`<span>${escapeHtml(d.phone)}</span>`);
  if (d.location) contact.push(`<span>${escapeHtml(d.location)}</span>`);
  if (d.linkedin) contact.push(`<span>${escapeHtml(d.linkedin)}</span>`);
  if (d.portfolio) contact.push(`<span>${escapeHtml(d.portfolio)}</span>`);

  const photoHtml = d.photo
    ? `<img class="cv-header-photo" src="${d.photo}" alt="Photo">`
    : '';

  const skillsHtml = d.skills.length > 0
    ? `<div class="cv-section"><h2>Skills</h2><div class="cv-skills-list">${d.skills.map(s => `<span class="cv-skill-item">${escapeHtml(s)}</span>`).join('')}</div></div>`
    : '';

  const summaryHtml = d.careerSummary
    ? `<div class="cv-section"><h2>Professional Summary</h2><p>${escapeHtml(d.careerSummary)}</p></div>`
    : '';

  const educationHtml = d.education.length > 0
    ? `<div class="cv-section"><h2>Education</h2>${d.education.map(edu =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(edu.degree)}</div>
          <div class="cv-item-title">${escapeHtml(edu.institution)}</div>
          <div class="cv-item-date">${escapeHtml(edu.year)}</div>
        </div>`
      ).join('')}</div>`
    : '';

  const experienceHtml = d.experience.length > 0
    ? `<div class="cv-section"><h2>Work Experience</h2>${d.experience.map(exp =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(exp.title)}</div>
          <div class="cv-item-title">${escapeHtml(exp.company)}</div>
          <div class="cv-item-date">${escapeHtml(exp.startDate)}${exp.endDate ? ' - ' + escapeHtml(exp.endDate) : ''}</div>
          ${exp.responsibilities ? `<div class="cv-item-desc">${escapeHtml(exp.responsibilities)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const projectsHtml = d.projects.length > 0
    ? `<div class="cv-section"><h2>Projects</h2>${d.projects.map(proj =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(proj.name)}</div>
          ${proj.technologies ? `<div class="cv-item-date">${escapeHtml(proj.technologies)}</div>` : ''}
          ${proj.description ? `<div class="cv-item-desc">${escapeHtml(proj.description)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const referencesHtml = d.references.length > 0
    ? `<div class="cv-section"><h2>References</h2>${d.references.map(ref =>
        `<div class="cv-item">
          <div class="cv-item-subtitle">${escapeHtml(ref.name)}</div>
          <div class="cv-item-title">${escapeHtml(ref.position)}</div>
          ${ref.contact ? `<div class="cv-item-date">${escapeHtml(ref.contact)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const templateClass = `cv-template-${d.template}`;

  if (d.template === 'modern') {
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
  } else if (d.template === 'professional') {
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
