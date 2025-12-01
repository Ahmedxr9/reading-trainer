# Database Schema Design

## Tables

### 1. users (Supabase auth.users - managed by Supabase)
- id (UUID, PK)
- email (TEXT, UNIQUE)
- encrypted_password (TEXT)
- email_confirmed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### 2. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  age INTEGER CHECK (age >= 6 AND age <= 18),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'parent', 'admin')),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_activity_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. reading_texts
```sql
CREATE TABLE reading_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  word_count INTEGER NOT NULL CHECK (word_count > 0),
  category TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 4. reading_results
```sql
CREATE TABLE reading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id UUID NOT NULL REFERENCES reading_texts(id) ON DELETE RESTRICT,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  wer DECIMAL(5,4) NOT NULL CHECK (wer >= 0 AND wer <= 1),
  levenshtein_distance INTEGER NOT NULL CHECK (levenshtein_distance >= 0),
  substitutions INTEGER NOT NULL DEFAULT 0 CHECK (substitutions >= 0),
  insertions INTEGER NOT NULL DEFAULT 0 CHECK (insertions >= 0),
  deletions INTEGER NOT NULL DEFAULT 0 CHECK (deletions >= 0),
  transcript TEXT NOT NULL,
  reference TEXT NOT NULL,
  audio_duration_seconds DECIMAL(10,2),
  processing_time_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 5. sessions
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  total_texts_read INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2),
  total_xp_gained INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
);
```

### 6. badges
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  criteria_type TEXT NOT NULL CHECK (criteria_type IN ('score', 'streak', 'total_sessions', 'level', 'custom')),
  criteria_value INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 7. user_badges
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### 8. analytics_daily
```sql
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_texts_read INTEGER NOT NULL DEFAULT 0,
  average_score DECIMAL(5,2),
  total_xp_gained INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);
```

### 9. audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_reading_texts_difficulty ON reading_texts(difficulty);
CREATE INDEX idx_reading_texts_category ON reading_texts(category);
CREATE INDEX idx_reading_texts_is_active ON reading_texts(is_active);
CREATE INDEX idx_reading_results_user_id ON reading_results(user_id);
CREATE INDEX idx_reading_results_text_id ON reading_results(text_id);
CREATE INDEX idx_reading_results_created_at ON reading_results(created_at DESC);
CREATE INDEX idx_reading_results_score ON reading_results(score);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_analytics_daily_user_date ON analytics_daily(user_id, date DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

## Foreign Key Constraints

- All foreign keys have appropriate ON DELETE actions
- CASCADE for user-related data
- RESTRICT for critical references (texts)

## Triggers

```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_texts_updated_at BEFORE UPDATE ON reading_texts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Seed Data

- Default badges (First Read, Perfect Score, Streak Master, etc.)
- Sample reading texts (already in data/texts.json)
- Admin user (optional)

