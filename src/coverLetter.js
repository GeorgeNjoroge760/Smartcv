import { getData } from './store.js';

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function renderCoverLetter() {
  const container = document.getElementById('clPreview');
  if (!container) return;
  const d = getData();

  const cl = d.coverLetter || {};
  const company = cl.company || '[Company Name]';
  const manager = cl.manager || '[Hiring Manager]';
  const position = cl.position || '[Job Position]';
  const name = d.fullName || 'Your Name';

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

  const skillsText = d.skills.length > 0
    ? `I bring expertise in ${d.skills.slice(0, 5).join(', ')}${d.skills.length > 5 ? ', and more' : ''}, which I am eager to apply at ${company}.`
    : '';

  const expText = d.experience.length > 0
    ? `During my tenure at ${d.experience[0].company}, I served as a ${d.experience[0].title}, where ${d.experience[0].responsibilities ? 'I was responsible for ' + d.experience[0].responsibilities.toLowerCase() : 'I developed key skills and delivered impactful results'}.`
    : 'My professional background has equipped me with the skills and determination to excel in this role.';

  const summaryText = d.careerSummary
    ? d.careerSummary
    : `As a dedicated ${d.professionalTitle || 'professional'}, I am excited about the opportunity to contribute to ${company}'s success.`;

  const clTemplateClass = `cl-template-${d.clTemplate || 'modern'}`;

  const letterContent = `<div class="cl-header">
    <div class="cl-sender">${escapeHtml(name)}</div>
    ${d.email ? `<div class="cl-sender-email">${escapeHtml(d.email)}${d.phone ? ' | ' + escapeHtml(d.phone) : ''}</div>` : ''}
    ${d.location ? `<div style="color:#666;font-size:0.85rem;margin-bottom:4px">${escapeHtml(d.location)}</div>` : ''}
  </div>
  <div class="cl-date">${today}</div>
  <div class="cl-recipient">
    <p>${escapeHtml(manager)}</p>
    <p>${escapeHtml(company)}</p>
    ${cl.address ? `<p>${escapeHtml(cl.address)}</p>` : ''}
  </div>
  <div class="cl-greeting">Dear ${escapeHtml(manager)},</div>
  <div class="cl-body">
    <p>I am writing to express my enthusiastic interest in the <strong>${escapeHtml(position)}</strong> position at <strong>${escapeHtml(company)}</strong>. ${escapeHtml(summaryText)}</p>
    <p>${expText}</p>
    ${skillsText ? `<p>${skillsText}</p>` : ''}
    ${cl.notes ? `<p>${escapeHtml(cl.notes)}</p>` : ''}
    <p>I would welcome the opportunity to discuss how my experience and skills align with the needs of ${escapeHtml(company)}. Thank you for your time and consideration.</p>
  </div>
  <div class="cl-closing">
    <p>Sincerely,</p>
    <p><strong>${escapeHtml(name)}</strong></p>
  </div>`;

  container.innerHTML = `<div class="cl-content ${clTemplateClass}">${letterContent}</div>`;
}
