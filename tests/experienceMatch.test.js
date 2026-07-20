import { describe, it, expect } from 'vitest';

// Extract the experience matching logic for testing
function checkExperienceMatch(jobDesc, experience) {
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

  const userExpYears = experience.reduce((sum, exp) => {
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

describe('Experience Match', () => {
  it('extracts years from "5+ years of experience"', () => {
    const result = checkExperienceMatch('Requires 5+ years of experience', []);
    expect(result.required).toBe(5);
  });

  it('extracts years from range "3-5 years"', () => {
    const result = checkExperienceMatch('Looking for 3-5 years experience', []);
    expect(result.required).toBe(5);
  });

  it('calculates user years from experience entries', () => {
    const experience = [
      { startDate: 'Jan 2020', endDate: 'Dec 2022' },
      { startDate: 'Jan 2023', endDate: 'Present' },
    ];
    const result = checkExperienceMatch('5+ years experience', experience);
    expect(result.user).toBeGreaterThanOrEqual(4);
  });

  it('returns 0 required when no years mentioned', () => {
    const result = checkExperienceMatch('Looking for a developer', []);
    expect(result.required).toBe(0);
  });

  it('handles missing startDate gracefully', () => {
    const experience = [
      { startDate: '', endDate: '' },
      { startDate: '2021', endDate: '2023' },
    ];
    const result = checkExperienceMatch('5+ years experience', experience);
    expect(result.user).toBeGreaterThanOrEqual(1);
  });
});
