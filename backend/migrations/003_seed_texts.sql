-- Migration: 003_seed_texts.sql
-- Description: Seed initial reading texts
-- Created: 2024

-- Note: This seeds texts from the existing data/texts.json
-- In production, texts should be managed via admin API

INSERT INTO reading_texts (id, title, content, difficulty, word_count, category, language) VALUES
  (gen_random_uuid(), 'The Happy Cat', 'The cat sat on the mat. It was a happy cat. The cat liked to play. It played all day.', 'easy', 24, 'animals', 'en'),
  (gen_random_uuid(), 'My Dog', 'I have a dog. His name is Max. Max is big and brown. He likes to run. We play in the park.', 'easy', 25, 'animals', 'en'),
  (gen_random_uuid(), 'The Red Ball', 'I see a red ball. It is round and bouncy. I can throw it high. The ball comes back down.', 'easy', 24, 'toys', 'en'),
  (gen_random_uuid(), 'The Magic Garden', 'In the magic garden, flowers bloomed in every color. Butterflies danced from flower to flower. The sun shone brightly, making everything sparkle. It was a beautiful day.', 'medium', 32, 'nature', 'en'),
  (gen_random_uuid(), 'The Brave Explorer', 'Emma was a brave explorer. She loved to discover new places. One day, she found a hidden cave. Inside, she discovered ancient treasures and wonderful stories.', 'medium', 31, 'adventure', 'en'),
  (gen_random_uuid(), 'The Friendly Robot', 'Robo was a friendly robot who helped children learn. He could answer questions and tell stories. Children loved spending time with Robo because he was kind and patient.', 'medium', 30, 'technology', 'en'),
  (gen_random_uuid(), 'The Ancient Library', 'Deep within the ancient library, thousands of books lined the towering shelves. Each book contained stories from different times and places. Scholars from around the world came to study these precious texts. The library was a treasure trove of human knowledge and imagination.', 'hard', 48, 'education', 'en'),
  (gen_random_uuid(), 'The Ocean Adventure', 'Captain Sarah sailed her ship across the vast ocean. The waves crashed against the hull as seagulls circled overhead. She was searching for a legendary island that appeared on no map. Her crew trusted her completely, knowing she would lead them to adventure.', 'hard', 47, 'adventure', 'en'),
  (gen_random_uuid(), 'The Inventor''s Workshop', 'In the inventor''s workshop, gears turned and machines hummed. Dr. Martinez was creating something extraordinary. She combined science with creativity to solve problems that seemed impossible. Her inventions helped people all over the world live better lives.', 'hard', 46, 'science', 'en')
ON CONFLICT DO NOTHING;

