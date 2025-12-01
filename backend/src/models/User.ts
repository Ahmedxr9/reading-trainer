/**
 * User Domain Model
 */

export type UserRole = 'user' | 'parent' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
  role: UserRole;
  xp: number;
  level: number;
  streak: number;
  lastActivityDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  totalSessions: number;
  averageScore: number;
  badges: string[];
}

