/**
 * Base Repository
 * Common repository functionality
 */

import { Pool } from 'pg';
import { getPool } from '../database/connection';
import { logger } from '../logger';

export abstract class BaseRepository {
  protected pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  protected async query<T = any>(
    text: string,
    params?: any[]
  ): Promise<T[]> {
    try {
      const result = await this.pool.query(text, params);
      return result.rows as T[];
    } catch (error) {
      logger.error('Database query error', { error, query: text, params });
      throw error;
    }
  }

  protected async queryOne<T = any>(
    text: string,
    params?: any[]
  ): Promise<T | null> {
    const results = await this.query<T>(text, params);
    return results[0] || null;
  }

  protected buildWhereClause(
    conditions: Record<string, any>,
    paramOffset: number = 1
  ): { clause: string; params: any[] } {
    const clauses: string[] = [];
    const params: any[] = [];
    let offset = paramOffset;

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          clauses.push(`${key} = ANY($${offset})`);
          params.push(value);
        } else if (typeof value === 'string' && value.includes('%')) {
          clauses.push(`${key} ILIKE $${offset}`);
          params.push(value);
        } else {
          clauses.push(`${key} = $${offset}`);
          params.push(value);
        }
        offset++;
      }
    }

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }
}

