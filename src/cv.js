import { getData } from './store.js';

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sortReverseChronological(items, dateKey) {
  return [...items].sort((a, b) => {
    const parseDate = (val) => {
      if (!val) return 0;
      const d = new Date(val);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    };
    return parseDate(b[dateKey]) - parseDate(a[dateKey]);
  });
}

export function renderCV() {
  const container = document.getElementById('cvPreview');
  if (!container) return;
  const d = getData();

  if (!d.fullName && d.skills.length === 0 && d.experience.length === 0 && d.education.length === 0) {
    container.innerHTML = `
      <div class="cv-empty-state">
        <i class="fas fa-file-alt"></i>
        <h3>Your CV will appear here</h3>
        <p>Fill in your details in the form to see a live preview</p>
      </div>`;
    return;
  }

  const name = d.fullName || 'Your Name';
  const title = d.professionalTitle || '';

  const contact = [];
  if (d.email) contact.push(`<span>${escapeHtml(d.email)}</span>`);
  if (d.phone) contact.push(`<span>${escapeHtml(d.phone)}</span>`);
  if (d.location) contact.push(`<span>${escapeHtml(d.location)}</span>`);
  if (d.linkedin) contact.push(`<span>${escapeHtml(d.linkedin)}</span>`);
  if (d.portfolio) contact.push(`<span>${escapeHtml(d.portfolio)}</span>`);

  const photoHtml = d.photo
    ? `<img class="cv-header-photo" src="${d.photo}" alt="Photo">`
    : '';

  const summaryHtml = d.careerSummary
    ? `<div class="cv-section"><h2>Professional Summary</h2><p>${escapeHtml(d.careerSummary)}</p></div>`
    : '';

  const skillsHtml = d.skills.length > 0
    ? `<div class="cv-section"><h2>Skills</h2><div class="cv-skills-list">${d.skills.map(s => `<span class="cv-skill-item">${escapeHtml(s)}</span>`).join('')}</div></div>`
    : '';

  const sortedExp = sortReverseChronological(d.experience, 'startDate');
  const experienceHtml = sortedExp.length > 0
    ? `<div class="cv-section"><h2>Professional Experience</h2>${sortedExp.map(exp =>
        `<div class="cv-item">
          <div class="cv-item-title">${escapeHtml(exp.title)}</div>
          <div class="cv-item-subtitle">${escapeHtml(exp.company)}</div>
          <div class="cv-item-date">${escapeHtml(exp.startDate)}${exp.endDate ? ' - ' + escapeHtml(exp.endDate) : ''}</div>
          ${exp.responsibilities ? `<div class="cv-item-desc">${escapeHtml(exp.responsibilities)}</div>` : ''}
        </div>`
      ).join('')}</div>`
    : '';

  const sortedEdu = sortReverseChronological(d.education, 'year');
  const educationHtml = sortedEdu.length > 0
    ? `<div class="cv-section"><h2>Education</h2>${sortedEdu.map(edu =>
        `<div class="cv-item">
          <div class="cv-item-title">${escapeHtml(edu.degree)}</div>
          <div class="cv-item-subtitle">${escapeHtml(edu.institution)}</div>
          <div class="cv-item-date">${escapeHtml(edu.year)}</div>
        </div>`
      ).join('')}</div>`
    : '';

  const additionalHtml = buildAdditionalSections(d);

  const templateClass = `cv-template-${d.template}`;

  if (d.template === 'modern') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
          <div class="cv-contact">${contact.join('')}</div>
        </div>
      </div>
      <div class="cv-body">
        <div class="cv-sidebar">
          ${skillsHtml}
          ${educationHtml}
          ${additionalHtml}
        </div>
        <div class="cv-main">
          ${summaryHtml}
          ${experienceHtml}
        </div>
      </div>
    </div>`;
  } else if (d.template === 'professional') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml ? `<div>${photoHtml}</div>` : ''}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
          <div class="cv-contact">${contact.join(' | ')}</div>
        </div>
      </div>
      <div class="cv-body">
        ${summaryHtml}
        ${skillsHtml}
        ${experienceHtml}
        ${educationHtml}
        ${additionalHtml}
      </div>
    </div>`;
  } else if (d.template === 'executive') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-body">
        <div class="cv-sidebar">
          <div class="cv-sidebar-top">
            ${photoHtml}
            <h1>${escapeHtml(name)}</h1>
            ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
          </div>
          <div class="cv-contact">${contact.join('<br>')}</div>
          ${skillsHtml}
          ${educationHtml}
          ${additionalHtml}
        </div>
        <div class="cv-main">
          ${summaryHtml}
          ${experienceHtml}
        </div>
      </div>
    </div>`;
  } else if (d.template === 'creative') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
          <div class="cv-contact">${contact.join(' · ')}</div>
        </div>
        ${photoHtml}
      </div>
      <div class="cv-body">
        <div class="cv-main">
          ${summaryHtml}
          ${experienceHtml}
        </div>
        <div class="cv-sidebar">
          ${skillsHtml}
          ${educationHtml}
          ${additionalHtml}
        </div>
      </div>
    </div>`;
  } else if (d.template === 'technical') {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        <div class="cv-header-left">
          <h1>${escapeHtml(name)}</h1>
          ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
        </div>
        <div class="cv-header-right">
          ${photoHtml}
          <div class="cv-contact">${contact.join('<br>')}</div>
        </div>
      </div>
      <div class="cv-body">
        ${summaryHtml}
        ${skillsHtml}
        ${experienceHtml}
        ${educationHtml}
        ${additionalHtml}
      </div>
    </div>`;
  } else {
    container.innerHTML = `<div class="cv-content ${templateClass}">
      <div class="cv-header">
        ${photoHtml}
        <div class="cv-header-info">
          <h1>${escapeHtml(name)}</h1>
          ${title ? `<div class="cv-title">${escapeHtml(title)}</div>` : ''}
          <div class="cv-contact">${contact.join(' / ')}</div>
        </div>
      </div>
      <div class="cv-body">
        ${summaryHtml}
        ${skillsHtml}
        ${experienceHtml}
        ${educationHtml}
        ${additionalHtml}
      </div>
    </div>`;
  }
}

function buildAdditionalSections(d) {
  const sections = [];

  if (d.certifications && d.certifications.length > 0) {
    sections.push(`<div class="cv-item-group">
      <h3>Certifications</h3>
      ${d.certifications.map(c => `<div class="cv-item">
        <div class="cv-item-title">${escapeHtml(c.name)}</div>
        ${c.issuer ? `<div class="cv-item-subtitle">${escapeHtml(c.issuer)}</div>` : ''}
        ${c.date ? `<div class="cv-item-date">${escapeHtml(c.date)}</div>` : ''}
      </div>`).join('')}
    </div>`);
  }

  if (d.languages && d.languages.length > 0) {
    sections.push(`<div class="cv-item-group">
      <h3>Languages</h3>
      ${d.languages.map(l => `<div class="cv-item">
        <div class="cv-item-title">${escapeHtml(l.name)}</div>
        ${l.level ? `<div class="cv-item-date">${escapeHtml(l.level)}</div>` : ''}
      </div>`).join('')}
    </div>`);
  }

  if (d.publications && d.publications.length > 0) {
    sections.push(`<div class="cv-item-group">
      <h3>Publications</h3>
      ${d.publications.map(p => `<div class="cv-item">
        <div class="cv-item-title">${escapeHtml(p.title)}</div>
        ${p.publisher ? `<div class="cv-item-subtitle">${escapeHtml(p.publisher)}</div>` : ''}
        ${p.date ? `<div class="cv-item-date">${escapeHtml(p.date)}</div>` : ''}
        ${p.url ? `<div class="cv-item-date">${escapeHtml(p.url)}</div>` : ''}
      </div>`).join('')}
    </div>`);
  }

  if (d.volunteerWork && d.volunteerWork.length > 0) {
    sections.push(`<div class="cv-item-group">
      <h3>Volunteer Work</h3>
      ${d.volunteerWork.map(v => `<div class="cv-item">
        <div class="cv-item-title">${escapeHtml(v.role)}</div>
        ${v.organization ? `<div class="cv-item-subtitle">${escapeHtml(v.organization)}</div>` : ''}
        ${v.date ? `<div class="cv-item-date">${escapeHtml(v.date)}</div>` : ''}
        ${v.description ? `<div class="cv-item-desc">${escapeHtml(v.description)}</div>` : ''}
      </div>`).join('')}
    </div>`);
  }

  if (d.refereesAvailableUponRequest) {
    sections.push(`<div class="cv-item-group">
      <h3>Referees</h3>
      <p class="cv-item-desc">Available upon request</p>
    </div>`);
  } else if (d.referees && d.referees.length > 0) {
    sections.push(`<div class="cv-item-group">
      <h3>Referees</h3>
      ${d.referees.map(r => `<div class="cv-item">
        <div class="cv-item-title">${escapeHtml(r.name)}</div>
        ${r.title ? `<div class="cv-item-subtitle">${escapeHtml(r.title)}</div>` : ''}
        ${r.organization ? `<div class="cv-item-desc">${escapeHtml(r.organization)}</div>` : ''}
        ${r.email ? `<div class="cv-item-date">${escapeHtml(r.email)}</div>` : ''}
        ${r.phone ? `<div class="cv-item-date">${escapeHtml(r.phone)}</div>` : ''}
      </div>`).join('')}
    </div>`);
  }

  return sections.join('');
}
