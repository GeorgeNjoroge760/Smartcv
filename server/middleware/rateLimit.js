import { supabase } from '../db/supabase.js';

const FREE_TIER_LIMIT = 5;

export async function checkUsageLimit(req, res, next) {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier, ai_usage_today, ai_usage_date')
      .eq('id', req.user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const usage = profile.ai_usage_date === today ? profile.ai_usage_today : 0;

    if (profile.tier === 'free' && usage >= FREE_TIER_LIMIT) {
      return res.status(403).json({
        error: 'Daily AI limit reached',
        message: `Free tier allows ${FREE_TIER_LIMIT} AI uses per day. Upgrade to Pro for unlimited.`,
        usage,
        limit: FREE_TIER_LIMIT,
        upgradeRequired: true,
      });
    }

    req.userProfile = profile;
    req.currentUsage = usage;
    next();
  } catch (err) {
    next(err);
  }
}

export async function incrementUsage(userId) {
  const today = new Date().toISOString().split('T')[0];
  await supabase.rpc('increment_ai_usage', { uid: userId });
}
