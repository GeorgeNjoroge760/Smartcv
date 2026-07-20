import { Router } from 'express';
import OpenAI from 'openai';
import xss from 'xss';
import { checkUsageLimit, incrementUsage } from '../middleware/rateLimit.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const aiRouter = Router();

function sanitizeInput(obj) {
  if (typeof obj === 'string') return xss(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeInput);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k] = sanitizeInput(v);
    }
    return clean;
  }
  return obj;
}

// Enhance CV with AI
aiRouter.post('/enhance-cv', checkUsageLimit, async (req, res, next) => {
  try {
    const data = sanitizeInput(req.body);

    if (!data.fullName) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const prompt = `You are a Professional CV Writer. Enhance the following CV information by writing a compelling professional summary (2-3 paragraphs) and bullet points for each experience entry.

Name: ${data.fullName}
Title: ${data.professionalTitle || 'N/A'}
Skills: ${(data.skills || []).join(', ') || 'N/A'}
Experience: ${JSON.stringify(data.experience || [], null, 2)}
Education: ${JSON.stringify(data.education || [], null, 2)}
Projects: ${JSON.stringify(data.projects || [], null, 2)}

Return ONLY the enhanced summary text — no extra commentary, no markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const enhanced = completion.choices[0].message.content.trim();
    await incrementUsage(req.user.id);

    res.json({
      result: enhanced,
      usage: req.currentUsage + 1,
      limit: req.userProfile.tier === 'pro' ? null : 5,
    });
  } catch (err) {
    next(err);
  }
});

// Generate cover letter with AI
aiRouter.post('/generate-cover-letter', checkUsageLimit, async (req, res, next) => {
  try {
    const data = sanitizeInput(req.body);

    if (!data.fullName || !data.company || !data.position) {
      return res.status(400).json({ error: 'Name, company, and position are required' });
    }

    const prompt = `You are a Professional Cover Letter Writer. Write a compelling, professional cover letter based on:

Applicant Name: ${data.fullName}
Applicant Title: ${data.professionalTitle || 'Professional'}
Position: ${data.position}
Company: ${data.company}
Hiring Manager: ${data.manager || 'Hiring Manager'}
Skills: ${(data.skills || []).join(', ') || 'N/A'}
Experience: ${JSON.stringify(data.experience || [], null, 2)}
Additional Notes: ${data.notes || ''}

Write a complete, ready-to-send cover letter. Use today's date. Be specific using the details provided. Return ONLY the letter body (no subject line, no meta text). Format it with clear paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const letter = completion.choices[0].message.content.trim();
    await incrementUsage(req.user.id);

    res.json({
      result: letter,
      usage: req.currentUsage + 1,
      limit: req.userProfile.tier === 'pro' ? null : 5,
    });
  } catch (err) {
    next(err);
  }
});

// AI-powered job match analysis (Pro only)
aiRouter.post('/job-analysis', checkUsageLimit, async (req, res, next) => {
  try {
    const { jobDescription, cvData } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description required' });
    }

    const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze how well this CV matches the job description.

Job Description:
${jobDescription}

CV Data:
Name: ${cvData?.fullName || 'N/A'}
Title: ${cvData?.professionalTitle || 'N/A'}
Skills: ${(cvData?.skills || []).join(', ')}
Experience: ${JSON.stringify(cvData?.experience || [], null, 2)}

Provide a JSON response with:
{ "score": <0-100>, "matchedSkills": [...], "missingSkills": [...], "recommendations": [...] }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    await incrementUsage(req.user.id);

    res.json({
      ...result,
      usage: req.currentUsage + 1,
      limit: req.userProfile.tier === 'pro' ? null : 5,
    });
  } catch (err) {
    next(err);
  }
});
