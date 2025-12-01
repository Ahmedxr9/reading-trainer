/**
 * Common DTOs and Validation Schemas
 */

import { z } from 'zod';

// Pagination
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Sorting
export const SortQuerySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SortQuery = z.infer<typeof SortQuerySchema>;

// Filtering
export const DateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

// Error Response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Success Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

