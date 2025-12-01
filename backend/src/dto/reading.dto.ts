/**
 * Reading Text and Result DTOs
 */

import { z } from 'zod';

// Create Reading Text
export const CreateReadingTextDtoSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().max(50).optional(),
  language: z.string().default('en'),
});

export type CreateReadingTextDto = z.infer<typeof CreateReadingTextDtoSchema>;

// Update Reading Text
export const UpdateReadingTextDtoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(10).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateReadingTextDto = z.infer<typeof UpdateReadingTextDtoSchema>;

// Create Reading Result
export const CreateReadingResultDtoSchema = z.object({
  textId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  score: z.number().int().min(0).max(100),
  wer: z.number().min(0).max(1),
  levenshteinDistance: z.number().int().min(0),
  substitutions: z.number().int().min(0),
  insertions: z.number().int().min(0),
  deletions: z.number().int().min(0),
  transcript: z.string().min(1),
  reference: z.string().min(1),
  audioDurationSeconds: z.number().positive().optional(),
  processingTimeMs: z.number().int().positive().optional(),
});

export type CreateReadingResultDto = z.infer<typeof CreateReadingResultDtoSchema>;

// Reading Text Response
export const ReadingTextResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  wordCount: z.number().int(),
  category: z.string().nullable(),
  language: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReadingTextResponse = z.infer<typeof ReadingTextResponseSchema>;

// Reading Result Response
export const ReadingResultResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  textId: z.string().uuid(),
  sessionId: z.string().uuid().nullable(),
  score: z.number().int(),
  wer: z.number(),
  levenshteinDistance: z.number().int(),
  substitutions: z.number().int(),
  insertions: z.number().int(),
  deletions: z.number().int(),
  transcript: z.string(),
  reference: z.string(),
  audioDurationSeconds: z.number().nullable(),
  processingTimeMs: z.number().int().nullable(),
  createdAt: z.string().datetime(),
});

export type ReadingResultResponse = z.infer<typeof ReadingResultResponseSchema>;

// Filter schemas
export const ReadingTextFilterSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type ReadingTextFilter = z.infer<typeof ReadingTextFilterSchema>;

export const ReadingResultFilterSchema = z.object({
  userId: z.string().uuid().optional(),
  textId: z.string().uuid().optional(),
  minScore: z.coerce.number().int().min(0).max(100).optional(),
  maxScore: z.coerce.number().int().min(0).max(100).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type ReadingResultFilter = z.infer<typeof ReadingResultFilterSchema>;

