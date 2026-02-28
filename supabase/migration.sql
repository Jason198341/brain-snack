-- 뇌간식 DB Schema Migration
-- Supabase (PostgreSQL)

-- 1. Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  question text NOT NULL,
  choices jsonb NOT NULL,
  correct_index int NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  explanation text NOT NULL,
  category text NOT NULL,
  difficulty int NOT NULL CHECK (difficulty >= 1 AND difficulty <= 3),
  published_at date NOT NULL,
  image_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2. Quiz Responses
CREATE TABLE IF NOT EXISTS quiz_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_slug text NOT NULL REFERENCES quizzes(slug),
  user_id uuid REFERENCES auth.users(id),
  anonymous_id text,
  selected_index int NOT NULL CHECK (selected_index >= 0 AND selected_index <= 3),
  is_correct boolean NOT NULL,
  time_spent_ms int,
  responded_at timestamptz DEFAULT now()
);

-- 3. Subscribers
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'unsubscribed')),
  confirm_token text,
  categories jsonb DEFAULT '[]',
  referral_code text,
  referred_by uuid REFERENCES subscribers(id),
  utm_source text,
  consent_at timestamptz,
  subscribed_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_reason text,
  created_at timestamptz DEFAULT now()
);

-- 4. Events (Analytics)
CREATE TABLE IF NOT EXISTS events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  event_date date GENERATED ALWAYS AS (created_at::date) STORED
);

-- 5. Experiments (A/B Testing)
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'archived')),
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. Experiment Variants
CREATE TABLE IF NOT EXISTS experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight int DEFAULT 50,
  config jsonb DEFAULT '{}'
);

-- 7. Experiment Assignments
CREATE TABLE IF NOT EXISTS experiment_assignments (
  user_id uuid NOT NULL,
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES experiment_variants(id),
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, experiment_id)
);

-- 8. Subscriptions (Premium - Phase 2)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  plan_type text CHECK (plan_type IN ('monthly', 'yearly')),
  price int NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  toss_payment_key text,
  started_at timestamptz DEFAULT now(),
  cancelled_at timestamptz,
  cancel_reason text,
  tenure_days int DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_published ON quizzes (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes (slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON quizzes (category);
CREATE INDEX IF NOT EXISTS idx_responses_quiz ON quiz_responses (quiz_slug);
CREATE INDEX IF NOT EXISTS idx_responses_anon ON quiz_responses (anonymous_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_events_name_date ON events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);

-- RLS Policies
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read for quizzes
CREATE POLICY "Quizzes are publicly readable" ON quizzes
  FOR SELECT USING (true);

-- Quiz responses: anyone can insert, only service role can read
CREATE POLICY "Anyone can submit responses" ON quiz_responses
  FOR INSERT WITH CHECK (true);

-- Subscribers: only service role
CREATE POLICY "Service role manages subscribers" ON subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- Events: only service role
CREATE POLICY "Service role manages events" ON events
  FOR ALL USING (auth.role() = 'service_role');
