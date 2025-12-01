import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * Полная интеграция с Supabase для аутентификации, базы данных и хранения
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Отсутствуют учетные данные Supabase. Пожалуйста, установите NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в .env.local'
  );
}

// Создаем клиент Supabase с полной функциональностью
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'reading-trainer@1.0.0',
    },
  },
});

// Вспомогательная функция для проверки подключения
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('reading_texts').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Database table schemas (for reference - create these in Supabase):
/*
-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  age INTEGER,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reading results table
CREATE TABLE reading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  text_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  wer DECIMAL NOT NULL,
  levenshtein_distance INTEGER NOT NULL,
  substitutions INTEGER DEFAULT 0,
  insertions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  transcript TEXT NOT NULL,
  reference TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_reading_results_user_id ON reading_results(user_id);
CREATE INDEX idx_reading_results_timestamp ON reading_results(timestamp DESC);
*/


