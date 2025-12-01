# Reading Trainer - Gamified Reading Practice App

A children-friendly web application (ages 6-18) that gamifies reading practice using AI-powered speech recognition.

## Features

- 🎯 **Reading Trainer**: Practice reading aloud with instant feedback
- 🎤 **Voice Recording**: Browser-based audio recording using MediaRecorder API
- 🤖 **AI Transcription**: Client-side Whisper AI (Xenova/Transformers) for speech-to-text
- 📊 **Error Analysis**: Levenshtein distance, Word Error Rate (WER), and detailed error detection
- 🎮 **Gamification**: XP system, levels, badges, and daily streaks
- 📈 **Progress Tracking**: Visual charts and statistics
- 🔐 **Authentication**: Supabase-based user accounts

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **AI**: @xenova/transformers (Whisper tiny model)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Create `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

3. **Create Database Tables**
   Run these SQL commands in your Supabase SQL editor:
   ```sql
   -- User profiles table
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

   -- Indexes
   CREATE INDEX idx_reading_results_user_id ON reading_results(user_id);
   CREATE INDEX idx_reading_results_timestamp ON reading_results(timestamp DESC);
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   Navigate to http://localhost:3000

## Project Structure

```
/app
  /trainer          - Main reading trainer page
  /profile          - User profile and progress
  /auth             - Login and registration
  /api/saveResult   - API route for saving results

/components
  /ui               - Reusable UI components (shadcn-style)
  /game             - Gamification components (XP, badges, mascot)
  /trainer          - Trainer-specific components

/lib
  whisper.ts        - Whisper AI transcription
  diff.ts           - Error detection and scoring algorithms
  supabase.ts       - Supabase client

/types              - TypeScript type definitions
/data               - Sample reading texts
```

## Key Features Explained

### Reading Trainer Flow
1. User selects a text (easy/medium/hard difficulty)
2. User reads the text aloud
3. Browser records audio using MediaRecorder
4. Whisper AI transcribes the audio client-side
5. System compares transcript to reference text
6. Shows highlighted errors, score, and XP rewards

### Scoring System
- **Score**: 0-100 based on Word Error Rate (WER)
- **WER**: (Substitutions + Insertions + Deletions) / Reference Words
- **XP**: Base score × difficulty multiplier (easy: 1x, medium: 1.5x, hard: 2x)

### Gamification
- **Levels**: Based on total XP (100 XP per level)
- **Badges**: ⭐ Excellent (90+), 👍 Good (70-89), 🙂 Try Again (<70)
- **Streaks**: Daily reading streak tracking

## Browser Compatibility

- Requires modern browser with MediaRecorder API support
- Chrome, Firefox, Edge, Safari (latest versions)
- Microphone permission required

## Notes

- Whisper model loads from CDN (no local files needed)
- First transcription may take longer as model downloads
- Audio is processed entirely client-side (no server costs)
- All user data stored in Supabase

## License

MIT


