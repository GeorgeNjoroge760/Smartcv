import { describe, it, expect } from 'vitest';

// Extract the job match logic for testing
function calculateJobMatch(jobDesc, userSkills, customSkills = []) {
  const jobMatchSkills = {
    'JavaScript': ['javascript', 'js', 'ecmascript', 'es6'],
    'TypeScript': ['typescript', 'ts'],
    'React': ['react', 'reactjs'],
    'Node.js': ['node', 'nodejs', 'node.js', 'express'],
    'Python': ['python'],
    'SQL': ['sql', 'mysql', 'postgresql', 'database'],
    'Docker': ['docker', 'container'],
    'AWS': ['aws', 'amazon web services'],
    'Git': ['git', 'github', 'gitlab', 'version control'],
    'CSS': ['css', 'css3', 'scss', 'sass', 'tailwind', 'bootstrap'],
    'HTML': ['html', 'html5'],
    'Leadership': ['leadership', 'lead', 'manager', 'management'],
  };

  const lowerJobDesc = jobDesc.toLowerCase();
  const matchedSkills = [];
  const missingSkills = [];
  const userSkillLower = userSkills.map(s => s.toLowerCase());

  const mergedSkills = { ...jobMatchSkills };
  customSkills.forEach(cs => {
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

  return { score, matchedSkills, missingSkills, totalRequired };
}

describe('Job Match Algorithm', () => {
  it('returns 0 when no skills match', () => {
    const result = calculateJobMatch(
      'Looking for a Ruby developer',
      ['JavaScript', 'React']
    );
    expect(result.score).toBe(0);
    expect(result.matchedSkills).toEqual([]);
  });

  it('returns 100 when all required skills are present', () => {
    const result = calculateJobMatch(
      'We need JavaScript, React, and Node.js experience',
      ['JavaScript', 'React', 'Node.js']
    );
    expect(result.score).toBe(100);
    expect(result.matchedSkills).toContain('JavaScript');
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.missingSkills).toEqual([]);
  });

  it('returns partial score for mixed skills', () => {
    const result = calculateJobMatch(
      'We need JavaScript, Python, and Docker',
      ['JavaScript', 'Docker']
    );
    expect(result.score).toBe(67);
    expect(result.matchedSkills).toContain('JavaScript');
    expect(result.matchedSkills).toContain('Docker');
    expect(result.missingSkills).toContain('Python');
  });

  it('handles custom skills', () => {
    const result = calculateJobMatch(
      'We need Kubernetes and Terraform',
      ['Kubernetes', 'Terraform'],
      [{ name: 'Kubernetes', keywords: ['kubernetes', 'k8s'] },
       { name: 'Terraform', keywords: ['terraform', 'iac'] }]
    );
    expect(result.score).toBe(100);
  });

  it('handles case-insensitive matching', () => {
    const result = calculateJobMatch(
      'Looking for JAVASCRIPT and react experience',
      ['javascript', 'React']
    );
    expect(result.matchedSkills).toContain('JavaScript');
    expect(result.matchedSkills).toContain('React');
  });

  it('returns 0 score when no relevant skills found in job', () => {
    const result = calculateJobMatch(
      'Looking for a chef who can cook Italian food',
      ['JavaScript', 'React']
    );
    expect(result.score).toBe(0);
    expect(result.totalRequired).toBe(0);
  });
});
