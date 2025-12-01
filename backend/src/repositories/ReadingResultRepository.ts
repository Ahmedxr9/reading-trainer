/**
 * Reading Result Repository
 */

import { BaseRepository } from './BaseRepository';
import { ReadingResult } from '../models/ReadingResult';
import { PaginationQuery, SortQuery } from '../dto/common.dto';
import { ReadingResultFilter } from '../dto/reading.dto';

export class ReadingResultRepository extends BaseRepository {
  async findById(id: string): Promise<ReadingResult | null> {
    const query = `
      SELECT 
        id, user_id as "userId", text_id as "textId",
        session_id as "sessionId",
        score, wer, levenshtein_distance as "levenshteinDistance",
        substitutions, insertions, deletions,
        transcript, reference,
        audio_duration_seconds as "audioDurationSeconds",
        processing_time_ms as "processingTimeMs",
        created_at as "createdAt"
      FROM reading_results
      WHERE id = $1
    `;
    return this.queryOne<ReadingResult>(query, [id]);
  }

  async findAll(
    pagination: PaginationQuery,
    sort: SortQuery,
    filter: ReadingResultFilter
  ): Promise<{ data: ReadingResult[]; total: number }> {
    const conditions: Record<string, any> = {};
    if (filter.userId) conditions.user_id = filter.userId;
    if (filter.textId) conditions.text_id = filter.textId;
    if (filter.minScore !== undefined) {
      // Will handle in WHERE clause
    }
    if (filter.maxScore !== undefined) {
      // Will handle in WHERE clause
    }

    const { clause, params } = this.buildWhereClause(conditions);
    let paramOffset = params.length + 1;

    // Add score range filters
    let scoreClause = '';
    if (filter.minScore !== undefined) {
      scoreClause += clause 
        ? ` AND score >= $${paramOffset}`
        : `WHERE score >= $${paramOffset}`;
      params.push(filter.minScore);
      paramOffset++;
    }
    if (filter.maxScore !== undefined) {
      scoreClause += clause || scoreClause
        ? ` AND score <= $${paramOffset}`
        : `WHERE score <= $${paramOffset}`;
      params.push(filter.maxScore);
      paramOffset++;
    }

    // Date range filters
    if (filter.from) {
      const dateClause = clause || scoreClause
        ? ` AND created_at >= $${paramOffset}`
        : `WHERE created_at >= $${paramOffset}`;
      scoreClause += dateClause;
      params.push(filter.from);
      paramOffset++;
    }
    if (filter.to) {
      const dateClause = clause || scoreClause
        ? ` AND created_at <= $${paramOffset}`
        : `WHERE created_at <= $${paramOffset}`;
      scoreClause += dateClause;
      params.push(filter.to);
      paramOffset++;
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM reading_results ${clause}${scoreClause}`;
    const countResult = await this.queryOne<{ total: string }>(countQuery, params);
    const total = parseInt(countResult?.total || '0', 10);

    // Get data
    const sortBy = sort.sortBy || 'created_at';
    const sortOrder = sort.sortOrder || 'desc';
    const offset = (pagination.page - 1) * pagination.limit;

    const dataQuery = `
      SELECT 
        id, user_id as "userId", text_id as "textId",
        session_id as "sessionId",
        score, wer, levenshtein_distance as "levenshteinDistance",
        substitutions, insertions, deletions,
        transcript, reference,
        audio_duration_seconds as "audioDurationSeconds",
        processing_time_ms as "processingTimeMs",
        created_at as "createdAt"
      FROM reading_results
      ${clause}${scoreClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramOffset} OFFSET $${paramOffset + 1}
    `;
    params.push(pagination.limit, offset);

    const data = await this.query<ReadingResult>(dataQuery, params);

    return { data, total };
  }

  async create(result: {
    userId: string;
    textId: string;
    sessionId?: string;
    score: number;
    wer: number;
    levenshteinDistance: number;
    substitutions: number;
    insertions: number;
    deletions: number;
    transcript: string;
    reference: string;
    audioDurationSeconds?: number;
    processingTimeMs?: number;
  }): Promise<ReadingResult> {
    const query = `
      INSERT INTO reading_results (
        user_id, text_id, session_id, score, wer, levenshtein_distance,
        substitutions, insertions, deletions, transcript, reference,
        audio_duration_seconds, processing_time_ms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, user_id as "userId", text_id as "textId",
        session_id as "sessionId",
        score, wer, levenshtein_distance as "levenshteinDistance",
        substitutions, insertions, deletions,
        transcript, reference,
        audio_duration_seconds as "audioDurationSeconds",
        processing_time_ms as "processingTimeMs",
        created_at as "createdAt"
    `;
    return this.queryOne<ReadingResult>(query, [
      result.userId,
      result.textId,
      result.sessionId || null,
      result.score,
      result.wer,
      result.levenshteinDistance,
      result.substitutions,
      result.insertions,
      result.deletions,
      result.transcript,
      result.reference,
      result.audioDurationSeconds || null,
      result.processingTimeMs || null,
    ]) as Promise<ReadingResult>;
  }

  async getUserResults(userId: string, limit: number = 50): Promise<ReadingResult[]> {
    const query = `
      SELECT 
        id, user_id as "userId", text_id as "textId",
        session_id as "sessionId",
        score, wer, levenshtein_distance as "levenshteinDistance",
        substitutions, insertions, deletions,
        transcript, reference,
        audio_duration_seconds as "audioDurationSeconds",
        processing_time_ms as "processingTimeMs",
        created_at as "createdAt"
      FROM reading_results
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    return this.query<ReadingResult>(query, [userId, limit]);
  }
}

