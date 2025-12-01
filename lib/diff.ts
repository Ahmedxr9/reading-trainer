import { ErrorDetail } from '@/types/results';

/**
 * Calculate Levenshtein distance between two strings
 * This measures the minimum number of single-character edits needed
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Tokenize text into words (normalized)
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Calculate Word Error Rate (WER)
 * WER = (S + D + I) / N
 * where S = substitutions, D = deletions, I = insertions, N = reference words
 */
export function calculateWER(reference: string, hypothesis: string): {
  wer: number;
  substitutions: number;
  insertions: number;
  deletions: number;
  errors: ErrorDetail[];
} {
  const refWords = tokenize(reference);
  const hypWords = tokenize(hypothesis);
  
  const n = refWords.length;
  if (n === 0) {
    return {
      wer: hypWords.length > 0 ? 1 : 0,
      substitutions: 0,
      insertions: hypWords.length,
      deletions: 0,
      errors: [],
    };
  }

  // Dynamic programming for word-level alignment
  const dp: number[][] = [];
  const path: Array<Array<'match' | 'sub' | 'ins' | 'del'>> = [];

  // Initialize DP table
  for (let i = 0; i <= refWords.length; i++) {
    dp[i] = [];
    path[i] = [];
    dp[i][0] = i; // deletions
    path[i][0] = 'del';
  }
  for (let j = 0; j <= hypWords.length; j++) {
    dp[0][j] = j; // insertions
    path[0][j] = 'ins';
  }

  // Fill DP table
  for (let i = 1; i <= refWords.length; i++) {
    for (let j = 1; j <= hypWords.length; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
        path[i][j] = 'match';
      } else {
        const del = dp[i - 1][j] + 1;
        const ins = dp[i][j - 1] + 1;
        const sub = dp[i - 1][j - 1] + 1;

        if (del <= ins && del <= sub) {
          dp[i][j] = del;
          path[i][j] = 'del';
        } else if (ins <= sub) {
          dp[i][j] = ins;
          path[i][j] = 'ins';
        } else {
          dp[i][j] = sub;
          path[i][j] = 'sub';
        }
      }
    }
  }

  // Backtrack to find errors
  const errors: ErrorDetail[] = [];
  let i = refWords.length;
  let j = hypWords.length;
  let substitutions = 0;
  let insertions = 0;
  let deletions = 0;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && path[i][j] === 'match') {
      i--;
      j--;
    } else if (i > 0 && j > 0 && path[i][j] === 'sub') {
      errors.push({
        type: 'substitution',
        position: i - 1,
        expected: refWords[i - 1],
        actual: hypWords[j - 1],
      });
      substitutions++;
      i--;
      j--;
    } else if (j > 0 && path[i][j] === 'ins') {
      errors.push({
        type: 'insertion',
        position: i,
        actual: hypWords[j - 1],
      });
      insertions++;
      j--;
    } else if (i > 0 && path[i][j] === 'del') {
      errors.push({
        type: 'deletion',
        position: i - 1,
        expected: refWords[i - 1],
      });
      deletions++;
      i--;
    } else {
      break;
    }
  }

  const wer = (substitutions + insertions + deletions) / n;

  return {
    wer,
    substitutions,
    insertions,
    deletions,
    errors,
  };
}

/**
 * Calculate score from WER (0-100 scale)
 * Perfect match = 100, complete mismatch = 0
 */
export function calculateScore(wer: number): number {
  return Math.max(0, Math.round((1 - wer) * 100));
}

/**
 * Get badge based on score
 */
export function getBadge(score: number): { emoji: string; text: string } {
  if (score >= 90) {
    return { emoji: '⭐', text: 'Excellent' };
  } else if (score >= 70) {
    return { emoji: '👍', text: 'Good' };
  } else {
    return { emoji: '🙂', text: 'Try Again' };
  }
}

/**
 * Calculate XP reward based on score
 */
export function calculateXP(score: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  const baseXP = score;
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.5,
    hard: 2,
  };
  
  return Math.round(baseXP * difficultyMultiplier[difficulty]);
}


