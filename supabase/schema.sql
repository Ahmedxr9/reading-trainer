-- Полная схема базы данных для Тренажера Чтения
-- Выполни этот SQL в SQL Editor твоего Supabase проекта

-- Включение расширения UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Таблица текстов для чтения
CREATE TABLE IF NOT EXISTS reading_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  word_count INTEGER NOT NULL CHECK (word_count > 0),
  category TEXT,
  language TEXT NOT NULL DEFAULT 'ru',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица результатов чтения
CREATE TABLE IF NOT EXISTS reading_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Может быть UUID пользователя или anon_ID
  text_id UUID NOT NULL REFERENCES reading_texts(id) ON DELETE RESTRICT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  wer DECIMAL(5,4) NOT NULL CHECK (wer >= 0 AND wer <= 1),
  levenshtein_distance INTEGER NOT NULL CHECK (levenshtein_distance >= 0),
  substitutions INTEGER NOT NULL DEFAULT 0 CHECK (substitutions >= 0),
  insertions INTEGER NOT NULL DEFAULT 0 CHECK (insertions >= 0),
  deletions INTEGER NOT NULL DEFAULT 0 CHECK (deletions >= 0),
  transcript TEXT NOT NULL,
  reference TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_reading_texts_difficulty ON reading_texts(difficulty);
CREATE INDEX IF NOT EXISTS idx_reading_texts_is_active ON reading_texts(is_active);
CREATE INDEX IF NOT EXISTS idx_reading_results_user_id ON reading_results(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_results_text_id ON reading_results(text_id);
CREATE INDEX IF NOT EXISTS idx_reading_results_timestamp ON reading_results(timestamp DESC);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_texts_updated_at 
  BEFORE UPDATE ON reading_texts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_results ENABLE ROW LEVEL SECURITY;

-- Политики для user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Политики для reading_texts
CREATE POLICY "Anyone can view active texts"
  ON reading_texts FOR SELECT
  USING (is_active = true);

-- Политики для reading_results
CREATE POLICY "Users can view their own results"
  ON reading_results FOR SELECT
  USING (
    auth.uid()::text = user_id OR 
    user_id LIKE 'anon_%'
  );

CREATE POLICY "Users can insert their own results"
  ON reading_results FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id OR 
    user_id LIKE 'anon_%'
  );

-- Вставка начальных текстов (опционально)
-- Можно выполнить после создания таблиц
INSERT INTO reading_texts (title, content, difficulty, word_count, category, language) VALUES
  ('Счастливый Кот', 'Кот сидел на коврике. Это был счастливый кот. Кот любил играть. Он играл весь день.', 'easy', 24, 'животные', 'ru'),
  ('Моя Собака', 'У меня есть собака. Его зовут Макс. Макс большой и коричневый. Он любит бегать. Мы играем в парке.', 'easy', 25, 'животные', 'ru'),
  ('Красный Мяч', 'Я вижу красный мяч. Он круглый и упругий. Я могу бросить его высоко. Мяч возвращается вниз.', 'easy', 24, 'игрушки', 'ru')
ON CONFLICT DO NOTHING;

