/**
 * Reading Text Repository
 */

import { BaseRepository } from './BaseRepository';
import { ReadingText, DifficultyLevel } from '../models/ReadingText';
import { PaginationQuery, SortQuery } from '../dto/common.dto';
import { ReadingTextFilter } from '../dto/reading.dto';

export class ReadingTextRepository extends BaseRepository {
  async findById(id: string): Promise<ReadingText | null> {
    const query = `
      SELECT 
        id, title, content, difficulty, word_count as "wordCount",
        category, language, is_active as "isActive",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM reading_texts
      WHERE id = $1
    `;
    return this.queryOne<ReadingText>(query, [id]);
  }

  async findAll(
    pagination: PaginationQuery,
    sort: SortQuery,
    filter: ReadingTextFilter
  ): Promise<{ data: ReadingText[]; total: number }> {
    const conditions: Record<string, any> = {};
    if (filter.difficulty) conditions.difficulty = filter.difficulty;
    if (filter.category) conditions.category = filter.category;
    if (filter.isActive !== undefined) conditions.is_active = filter.isActive;
    
    const { clause, params } = this.buildWhereClause(conditions);
    let paramOffset = params.length + 1;

    // Search filter
    let searchClause = '';
    if (filter.search) {
      searchClause = clause 
        ? ` AND (title ILIKE $${paramOffset} OR content ILIKE $${paramOffset})`
        : `WHERE (title ILIKE $${paramOffset} OR content ILIKE $${paramOffset})`;
      params.push(`%${filter.search}%`);
      paramOffset++;
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM reading_texts ${clause}${searchClause}`;
    const countResult = await this.queryOne<{ total: string }>(countQuery, params);
    const total = parseInt(countResult?.total || '0', 10);

    // Get data
    const sortBy = sort.sortBy || 'created_at';
    const sortOrder = sort.sortOrder || 'desc';
    const offset = (pagination.page - 1) * pagination.limit;

    const dataQuery = `
      SELECT 
        id, title, content, difficulty, word_count as "wordCount",
        category, language, is_active as "isActive",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM reading_texts
      ${clause}${searchClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramOffset} OFFSET $${paramOffset + 1}
    `;
    params.push(pagination.limit, offset);

    const data = await this.query<ReadingText>(dataQuery, params);

    return { data, total };
  }

  async create(text: {
    title: string;
    content: string;
    difficulty: DifficultyLevel;
    wordCount: number;
    category?: string;
    language?: string;
    createdBy?: string;
  }): Promise<ReadingText> {
    const query = `
      INSERT INTO reading_texts (title, content, difficulty, word_count, category, language, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id, title, content, difficulty, word_count as "wordCount",
        category, language, is_active as "isActive",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.queryOne<ReadingText>(query, [
      text.title,
      text.content,
      text.difficulty,
      text.wordCount,
      text.category || null,
      text.language || 'en',
      text.createdBy || null,
    ]) as Promise<ReadingText>;
  }

  async update(id: string, updates: {
    title?: string;
    content?: string;
    difficulty?: DifficultyLevel;
    category?: string;
    isActive?: boolean;
  }): Promise<ReadingText | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }
    if (updates.difficulty !== undefined) {
      fields.push(`difficulty = $${paramIndex++}`);
      values.push(updates.difficulty);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE reading_texts
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, title, content, difficulty, word_count as "wordCount",
        category, language, is_active as "isActive",
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;
    return this.queryOne<ReadingText>(query, values);
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM reading_texts WHERE id = $1`;
    const result = await this.query(query, [id]);
    return true;
  }
}

