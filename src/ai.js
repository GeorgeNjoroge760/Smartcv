import { getData } from './store.js';
import { isLoggedIn, isPro, saveCvData } from './auth.js';
import { trackFeatureUse, trackUpgrade } from './analytics.js';
import { api } from './api.js';

// ---- AI Enhancement ----

export async function generateAICV() {
  const d = getData();
  if (!isLoggedIn()) {
    window.renderAuthModal?.();
    return;
  }
  if (!d.fullName) { alert('Please fill in your name and other details first.'); return; }

  try {
    trackFeatureUse('ai_enhance_cv');
    const result = await api.post('/ai/enhance-cv', {
      fullName: d.fullName,
      professionalTitle: d.professionalTitle,
      skills: d.skills,
      experience: d.experience,
      education: d.education,
      projects: d.projects,
    });

    d.careerSummary = result.result;
    document.getElementById('careerSummary').value = result.result;
    document.getElementById('summaryChars').textContent = result.result.length;

    updateUsageBanner(result.usage, result.limit);
    saveCvData(d);
    alert('CV enhanced successfully!');
    return result;
  } catch (err) {
    if (err.upgradeRequired) {
      trackUpgrade('ai_enhance');
      showUpgradePrompt(err.message);
    } else {
      alert('AI enhancement failed: ' + err.message);
    }
  }
}

export async function generateAICoverLetter() {
  const d = getData();
  if (!isLoggedIn()) {
    window.renderAuthModal?.();
    return;
  }
  if (!d.fullName || !d.coverLetter.company || !d.coverLetter.position) {
    alert('Please fill in your name, company name, and job position first.');
    return;
  }

  try {
    trackFeatureUse('ai_cover_letter');
    const result = await api.post('/ai/generate-cover-letter', {
      fullName: d.fullName,
      professionalTitle: d.professionalTitle,
      company: d.coverLetter.company,
      manager: d.coverLetter.manager,
      position: d.coverLetter.position,
      skills: d.skills,
      experience: d.experience,
      notes: d.coverLetter.notes,
    });

    d.coverLetter.notes = 'AI-generated letter below (you may edit):\n\n' + result.result;
    document.getElementById('clNotes').value = d.coverLetter.notes;

    updateUsageBanner(result.usage, result.limit);
    saveCvData(d);
    alert('Cover letter generated successfully! Check the preview.');
    return result;
  } catch (err) {
    if (err.upgradeRequired) {
      trackUpgrade('ai_cover_letter');
      showUpgradePrompt(err.message);
    } else {
      alert('AI generation failed: ' + err.message);
    }
  }
}

function updateUsageBanner(usage, limit) {
  const banner = document.getElementById('usageBanner');
  if (!banner) return;
  if (isPro()) {
    banner.style.display = 'none';
    return;
  }
  if (usage && limit) {
    banner.style.display = 'flex';
    banner.innerHTML = `<i class="fas fa-info-circle"></i> AI uses today: ${usage}/${limit} <button class="btn btn-sm btn-primary" onclick="window.openUpgradeModal?.()">Upgrade to Pro</button>`;
  }
}

function showUpgradePrompt(message) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'upgradeModal';
  modal.innerHTML = `
    <div class="modal glass">
      <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">&times;</button>
      <div class="upgrade-content">
        <div class="upgrade-icon"><i class="fas fa-crown"></i></div>
        <h3>Upgrade to Pro</h3>
        <p>${message || 'Unlock unlimited AI features, all templates, and more.'}</p>
        <ul class="upgrade-features">
          <li><i class="fas fa-check"></i> Unlimited AI generations</li>
          <li><i class="fas fa-check"></i> All premium templates</li>
          <li><i class="fas fa-check"></i> No watermarks on exports</li>
          <li><i class="fas fa-check"></i> Cloud save & sync</li>
          <li><i class="fas fa-check"></i> Priority support</li>
        </ul>
        <div class="upgrade-pricing">
          <div class="price-card">
            <span class="price-label">Monthly</span>
            <span class="price-amount">$5</span>
            <span class="price-period">/month</span>
          </div>
          <div class="price-card popular">
            <span class="price-popular-badge">Save 33%</span>
            <span class="price-label">Yearly</span>
            <span class="price-amount">$40</span>
            <span class="price-period">/year</span>
          </div>
        </div>
        <button class="btn btn-primary btn-block" id="upgradeBtn">Upgrade Now</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById('upgradeBtn').addEventListener('click', async () => {
    try {
      const result = await api.post('/payments/create-checkout', {});
      if (result.url) window.location.href = result.url;
    } catch (err) {
      alert('Payment setup failed: ' + err.message);
    }
  });
}

// ---- Job Match ----

const jobMatchSkills = {
  'JavaScript': ['javascript', 'js', 'ecmascript', 'es6', 'es2015', 'es2020'],
  'TypeScript': ['typescript', 'ts'],
  'React': ['react', 'reactjs', 'react.js'],
  'Angular': ['angular', 'angularjs', 'angular.js'],
  'Vue.js': ['vue', 'vuejs', 'vue.js'],
  'Svelte': ['svelte'],
  'Node.js': ['node', 'nodejs', 'node.js', 'express'],
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
  'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
  'Azure': ['azure', 'microsoft azure'],
  'GCP': ['gcp', 'google cloud'],
  'Docker': ['docker', 'container'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'CI/CD': ['ci/cd', 'ci cd', 'jenkins', 'github actions'],
  'Git': ['git', 'github', 'gitlab', 'version control'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3', 'scss', 'sass', 'tailwind', 'bootstrap'],
  'REST API': ['rest', 'rest api', 'restful', 'api'],
  'GraphQL': ['graphql', 'gql'],
  'Agile': ['agile', 'scrum', 'kanban', 'sprint'],
  'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural network', 'ai'],
  'Data Science': ['data science', 'data analysis', 'analytics', 'statistics'],
  'React Native': ['react native'],
  'Flutter': ['flutter', 'dart'],
  'iOS': ['ios', 'swift', 'objective-c'],
  'Android': ['android', 'kotlin'],
  'Figma': ['figma', 'ui design'],
  'Linux': ['linux', 'unix', 'bash', 'shell'],
  'Testing': ['testing', 'jest', 'mocha', 'cypress', 'playwright', 'selenium'],
  'Leadership': ['leadership', 'lead', 'manager', 'management', 'team lead'],
  'Communication': ['communication', 'presentation', 'stakeholder'],
};

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
      requiredYears = p.label === 'range' ? parseInt(match[2]) : parseInt(match[1]);
      break;
    }
  }

  const d = getData();
  const userExpYears = d.experience.reduce((sum, exp) => {
    if (!exp.startDate) return sum;
    const start = parseInt(exp.startDate.match(/\d{4}/)?.[0]);
    const end = exp.endDate && exp.endDate.toLowerCase() !== 'present'
      ? parseInt(exp.endDate.match(/\d{4}/)?.[0])
      : new Date().getFullYear();
    if (start) return sum + Math.max(end - start, 0);
    return sum;
  }, 0);

  return { required: requiredYears, user: userExpYears };
}

export function analyzeJobMatch() {
  const jobDesc = document.getElementById('jobDescription')?.value;
  if (!jobDesc?.trim()) {
    alert('Please paste a job description first.');
    return;
  }

  trackFeatureUse('job_match');

  const lowerJobDesc = jobDesc.toLowerCase();
  const matchedSkills = [];
  const missingSkills = [];
  const d = getData();
  const userSkillLower = d.skills.map(s => s.toLowerCase());

  const mergedSkills = { ...jobMatchSkills };
  (d.customSkills || []).forEach(cs => {
    if (cs.name && cs.keywords?.length > 0) {
      mergedSkills[cs.name] = cs.keywords;
    }
  });

  for (const [skill, keywords] of Object.entries(mergedSkills)) {
    const foundInJob = keywords.some(k => lowerJobDesc.includes(k));
    if (!foundInJob) continue;
    const userHas = userSkillLower.some(us =>
      us === skill.toLowerCase() || keywords.some(k => us.includes(k))
    );
    if (userHas) matchedSkills.push(skill);
    else missingSkills.push(skill);
  }

  const totalRequired = matchedSkills.length + missingSkills.length;
  const score = totalRequired > 0 ? Math.round((matchedSkills.length / totalRequired) * 100) : 0;
  const expMatch = checkExperienceMatch(jobDesc);

  displayJobMatchResult({ score, matchedSkills, missingSkills, totalRequired, expMatch });
}

function displayJobMatchResult(result) {
  const container = document.getElementById('jobMatchResults');
  if (!container) return;

  const scoreColor = result.score >= 70 ? '#10b981' : result.score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = result.score >= 70 ? 'Strong Match' : result.score >= 40 ? 'Moderate Match' : 'Weak Match';

  const matchedHtml = result.matchedSkills.map(s =>
    `<span class="jm-match-tag jm-match-tag-yes"><i class="fas fa-check-circle"></i> ${s}</span>`
  ).join('');

  const missingHtml = result.missingSkills.map(s =>
    `<span class="jm-match-tag jm-match-tag-no"><i class="fas fa-plus-circle"></i> ${s}</span>`
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
