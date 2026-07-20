import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import xss from 'xss';

export const userRouter = Router();

// Get user profile & CV data
userRouter.get('/profile', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Save CV data
userRouter.put('/cv-data', async (req, res, next) => {
  try {
    const { data: cvData } = req.body;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        cv_data: cvData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id);

    if (error) throw error;
    res.json({ message: 'CV data saved' });
  } catch (err) {
    next(err);
  }
});

// Email subscriber (lead capture)
userRouter.post('/subscribe', async (req, res, next) => {
  try {
    const email = xss(String(req.body.email || '').trim());
    const source = xss(String(req.body.source || 'unknown'));

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { error } = await supabase
      .from('email_subscribers')
      .upsert({ email, source }, { onConflict: 'email' });

    if (error) throw error;
    res.json({ message: 'Subscribed successfully' });
  } catch (err) {
    next(err);
  }
});
