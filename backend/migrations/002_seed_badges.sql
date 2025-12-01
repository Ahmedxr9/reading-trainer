-- Migration: 002_seed_badges.sql
-- Description: Seed default badges
-- Created: 2024

INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES
  ('First Steps', 'Complete your first reading session', '🎯', 'total_sessions', 1),
  ('Perfect Reader', 'Achieve a perfect score of 100', '⭐', 'score', 100),
  ('Good Job', 'Achieve a score of 90 or higher', '👍', 'score', 90),
  ('Streak Starter', 'Maintain a 3-day reading streak', '🔥', 'streak', 3),
  ('Streak Master', 'Maintain a 7-day reading streak', '🔥🔥', 'streak', 7),
  ('Dedicated Reader', 'Complete 10 reading sessions', '📚', 'total_sessions', 10),
  ('Reading Champion', 'Complete 50 reading sessions', '🏆', 'total_sessions', 50),
  ('Level Up', 'Reach level 5', '⬆️', 'level', 5),
  ('Expert Reader', 'Reach level 10', '👑', 'level', 10),
  ('Consistent Learner', 'Complete 5 sessions in a row', '📖', 'total_sessions', 5)
ON CONFLICT (name) DO NOTHING;

