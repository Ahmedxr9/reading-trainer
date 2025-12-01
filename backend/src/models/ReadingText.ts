/**
 * Reading Text Domain Model
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ReadingText {
  id: string;
  title: string;
  content: string;
  difficulty: DifficultyLevel;
  wordCount: number;
  category?: string;
  language: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

