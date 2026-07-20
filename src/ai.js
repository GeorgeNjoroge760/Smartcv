import { getData } from './store.js';
import { trackFeatureUse } from './analytics.js';

// ---- Job Match (local, no backend) ----

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
