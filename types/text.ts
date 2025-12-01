export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  difficulty: DifficultyLevel;
  wordCount: number;
  category?: string;
}


