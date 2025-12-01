/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '../logger';
import { ApiError } from '../dto/common.dto';

export class AppError extends Error {
  statusCode: number;
  details?: Record<string, any>;

  constructor(message: string, statusCode: number = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found${id ? ` with id: ${id}` : ''}`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export function errorHandler(
  error: unknown,
  req: NextRequest
): NextResponse<ApiError> {
  logger.error('API Error', {
    error,
    path: req.url,
    method: req.method,
  });

  // Zod validation error
  if (error instanceof ZodError) {
    const details = error.errors.reduce((acc, err) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(
      {
        error: 'Validation Error',
        message: 'Invalid request data',
        statusCode: 400,
        details,
      },
      { status: 400 }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; detail?: string };
    
    if (dbError.code === '23505') {
      // Unique violation
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Resource already exists',
          statusCode: 409,
          details: { detail: dbError.detail },
        },
        { status: 409 }
      );
    }

    if (dbError.code === '23503') {
      // Foreign key violation
      return NextResponse.json(
        {
          error: 'Invalid Reference',
          message: 'Referenced resource does not exist',
          statusCode: 400,
          details: { detail: dbError.detail },
        },
        { status: 400 }
      );
    }
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred'
        : error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500,
    },
    { status: 500 }
  );
}

