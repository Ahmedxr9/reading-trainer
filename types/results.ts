export interface ReadingResult {
  id?: string;
  userId: string;
  textId: string;
  score: number;
  wer: number; // Word Error Rate (0-1)
  levenshteinDistance: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  transcript: string;
  reference: string;
  timestamp: string;
}

export interface ErrorDetail {
  type: 'substitution' | 'insertion' | 'deletion';
  position: number;
  expected?: string;
  actual?: string;
}


