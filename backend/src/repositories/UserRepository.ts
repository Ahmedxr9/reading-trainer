/**
 * User Repository
 * Data access for users
 */

import { BaseRepository } from './BaseRepository';
import { User, UserRole } from '../models/User';

export class UserRepository extends BaseRepository {
  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, name, age, role, xp, level, streak,
        last_activity_date as "lastActivityDate",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_profiles
      WHERE id = $1
    `;
    return this.queryOne<User>(query, [id]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT 
        id, email, name, age, role, xp, level, streak,
        last_activity_date as "lastActivityDate",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM user_profiles
      WHERE email = $1
    `;
    return this.queryOne<User>(query, [email]);
  }

  async create(user: {
    id: string;
    email: string;
    name?: string;
    age?: number;
    role?: UserRole;
  }): Promise<User> {
    const query = `
      INSERT INTO user_profiles (id, email, name, age, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id, email, name, age, role, xp, level, streak,
        last_activity_date as "lastActivityDate",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.queryOne<User>(query, [
      user.id,
      user.email,
      user.name || null,
      user.age || null,
      user.role || 'user',
    ]) as Promise<User>;
  }

  async update(id: string, updates: {
    name?: string;
    age?: number;
    xp?: number;
    level?: number;
    streak?: number;
    lastActivityDate?: Date;
  }): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.age !== undefined) {
      fields.push(`age = $${paramIndex++}`);
      values.push(updates.age);
    }
    if (updates.xp !== undefined) {
      fields.push(`xp = $${paramIndex++}`);
      values.push(updates.xp);
    }
    if (updates.level !== undefined) {
      fields.push(`level = $${paramIndex++}`);
      values.push(updates.level);
    }
    if (updates.streak !== undefined) {
      fields.push(`streak = $${paramIndex++}`);
      values.push(updates.streak);
    }
    if (updates.lastActivityDate !== undefined) {
      fields.push(`last_activity_date = $${paramIndex++}`);
      values.push(updates.lastActivityDate);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE user_profiles
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, email, name, age, role, xp, level, streak,
        last_activity_date as "lastActivityDate",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.queryOne<User>(query, values);
  }

  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    averageScore: number;
    badges: string[];
  }> {
    // Get total sessions
    const sessionsQuery = `
      SELECT COUNT(*) as count
      FROM sessions
      WHERE user_id = $1 AND status = 'completed'
    `;
    const sessionsResult = await this.queryOne<{ count: string }>(sessionsQuery, [userId]);

    // Get average score
    const scoreQuery = `
      SELECT AVG(score) as avg_score
      FROM reading_results
      WHERE user_id = $1
    `;
    const scoreResult = await this.queryOne<{ avg_score: string | null }>(scoreQuery, [userId]);

    // Get badges
    const badgesQuery = `
      SELECT b.name
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = $1
    `;
    const badges = await this.query<{ name: string }>(badgesQuery, [userId]);

    return {
      totalSessions: parseInt(sessionsResult?.count || '0', 10),
      averageScore: scoreResult?.avg_score ? parseFloat(scoreResult.avg_score) : 0,
      badges: badges.map(b => b.name),
    };
  }
}

