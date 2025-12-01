/**
 * User DTOs and Validation Schemas
 */

import { z } from 'zod';

// Register
export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(6).max(18).optional(),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

// Login
export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

// Update Profile
export const UpdateProfileDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  age: z.number().int().min(6).max(18).optional(),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;

// User Response
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  age: z.number().int().nullable(),
  role: z.enum(['user', 'parent', 'admin']),
  xp: z.number().int(),
  level: z.number().int(),
  streak: z.number().int(),
  lastActivityDate: z.string().date().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

