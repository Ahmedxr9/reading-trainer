/**
 * Validation Middleware
 * Validates request data using Zod schemas
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './errorHandler';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await req.json();
      const data = schema.parse(body);
      return { data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid request body', {
          errors: error.errors,
        });
      }
      throw error;
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: NextRequest): { data: T } | NextResponse => {
    try {
      const params = Object.fromEntries(req.nextUrl.searchParams.entries());
      const data = schema.parse(params);
      return { data };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid query parameters', {
          errors: error.errors,
        });
      }
      throw error;
    }
  };
}

