/**
 * Database Connection Pool
 * Manages PostgreSQL connection pool
 */

import { Pool, PoolConfig } from 'pg';
import { config } from '../config';
import { logger } from '../logger';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const poolConfig: PoolConfig = {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: config.database.maxConnections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    };

    pool = new Pool(poolConfig);

    pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err });
    });

    pool.on('connect', () => {
      logger.debug('New database connection established');
    });

    logger.info('Database connection pool created', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
    });
  }

  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection check failed', { error });
    return false;
  }
}

