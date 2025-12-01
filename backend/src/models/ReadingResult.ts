/**
 * Reading Result Domain Model
 */

export interface ReadingResult {
  id: string;
  userId: string;
  textId: string;
  sessionId?: string;
  score: number;
  wer: number; // Word Error Rate (0-1)
  levenshteinDistance: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  transcript: string;
  reference: string;
  audioDurationSeconds?: number;
  processingTimeMs?: number;
  createdAt: Date;
}

export interface ErrorDetail {
  type: 'substitution' | 'insertion' | 'deletion';
  position: number;
  expected?: string;
  actual?: string;
}

