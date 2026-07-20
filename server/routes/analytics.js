import { Router } from 'express';
import xss from 'xss';

export const analyticsRouter = Router();

// Simple event tracking (no auth required for basic events)
analyticsRouter.post('/event', async (req, res) => {
  try {
    const { event, properties } = req.body;
    const cleanEvent = xss(String(event || ''));
    const cleanProps = typeof properties === 'object' ? properties : {};

    // Log to console in dev; in production you'd send to PostHog/Plausible
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${cleanEvent}`, cleanProps);
    }

    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});
