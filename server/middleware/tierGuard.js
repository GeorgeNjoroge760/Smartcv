import { supabase } from '../db/supabase.js';

export function tierGuard(requiredTier = 'pro') {
  return async (req, res, next) => {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', req.user.id)
        .single();

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      if (requiredTier === 'pro' && profile.tier !== 'pro') {
        return res.status(403).json({
          error: 'Pro subscription required',
          upgradeRequired: true,
        });
      }

      req.userProfile = profile;
      next();
    } catch (err) {
      next(err);
    }
  };
}
