import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import xss from 'xss';

export const authRouter = Router();

// Sign up
authRouter.post('/signup', async (req, res, next) => {
  try {
    const email = xss(String(req.body.email || '').trim());
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { signup_source: 'web' } },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      user: data.user,
      session: data.session,
      message: data.session ? 'Account created' : 'Check your email to confirm',
    });
  } catch (err) {
    next(err);
  }
});

// Sign in
authRouter.post('/signin', async (req, res, next) => {
  try {
    const email = xss(String(req.body.email || '').trim());
    const password = String(req.body.password || '');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({ user: data.user, session: data.session });
  } catch (err) {
    next(err);
  }
});

// Sign out
authRouter.post('/signout', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7);
      await supabase.auth.admin.signOut(token);
    }
    res.json({ message: 'Signed out' });
  } catch (err) {
    next(err);
  }
});

// Get current user
authRouter.get('/me', async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = header.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({ user, profile });
  } catch (err) {
    next(err);
  }
});
