/**
 * User Service
 * Business logic for user operations
 */

import { UserRepository } from '../repositories/UserRepository';
import { User, UserProfile } from '../models/User';
import { RegisterDto, UpdateProfileDto } from '../dto/user.dto';
import { NotFoundError } from '../middleware/errorHandler';
import { logger } from '../logger';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDto): Promise<User> {
    logger.info('Registering new user', { email: data.email });

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user');
    }

    // Create user profile
    const user = await this.userRepository.create({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      age: data.age,
      role: 'user',
    });

    logger.info('User registered successfully', { userId: user.id });
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.findById(userId);
    const stats = await this.userRepository.getUserStats(userId);

    return {
      ...user,
      ...stats,
    };
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.age !== undefined) updates.age = data.age;

    const updated = await this.userRepository.update(userId, updates);
    if (!updated) {
      throw new NotFoundError('User', userId);
    }

    logger.info('User profile updated', { userId });
    return updated;
  }

  async updateXP(userId: string, xpGained: number): Promise<User> {
    const user = await this.findById(userId);
    const newXP = user.xp + xpGained;
    const newLevel = Math.floor(newXP / 100) + 1;

    const updated = await this.userRepository.update(userId, {
      xp: newXP,
      level: newLevel,
    });

    if (!updated) {
      throw new NotFoundError('User', userId);
    }

    logger.info('User XP updated', { userId, newXP, newLevel });
    return updated;
  }

  async updateStreak(userId: string): Promise<User> {
    const user = await this.findById(userId);
    const today = new Date();
    const lastActivity = user.lastActivityDate 
      ? new Date(user.lastActivityDate)
      : null;

    let newStreak = user.streak;
    if (!lastActivity) {
      newStreak = 1;
    } else {
      const daysDiff = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff === 1) {
        newStreak = user.streak + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    }

    const updated = await this.userRepository.update(userId, {
      streak: newStreak,
      lastActivityDate: today,
    });

    if (!updated) {
      throw new NotFoundError('User', userId);
    }

    return updated;
  }
}

