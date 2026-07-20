/*
  Run this once to set up your Supabase tables.
  Usage: node server/db/setup.js

  Or paste the SQL below into your Supabase SQL Editor.
*/

const SQL = `
-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  ai_usage_today INT DEFAULT 0,
  ai_usage_date DATE DEFAULT CURRENT_DATE,
  cv_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscribers (lead capture)
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'unknown',
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(uid UUID)
RETURNS INT AS $$
DECLARE
  current_count INT;
  today DATE := CURRENT_DATE;
BEGIN
  UPDATE user_profiles
  SET ai_usage_today = CASE
    WHEN ai_usage_date = today THEN ai_usage_today + 1
    ELSE 1
  END,
  ai_usage_date = today,
  updated_at = NOW()
  WHERE id = uid
  RETURNING ai_usage_today INTO current_count;

  RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

console.log('Paste the following SQL into your Supabase SQL Editor:\n');
console.log(SQL);
console.log('\nOr run: node server/db/setup.js --print to copy it.');
if (process.argv.includes('--print')) {
  process.stdout.write(SQL);
}
