/**
 * Configuration Management
 * Centralized configuration for the application
 */

import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  // Server
  port: number;
  nodeEnv: string;
  apiVersion: string;

  // Database
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
  };

  // Supabase (for auth integration)
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };

  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // CORS
  cors: {
    origin: string[];
    credentials: boolean;
  };

  // Logging
  logging: {
    level: string;
    format: string;
  };
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  return value ? value === 'true' : defaultValue;
}

export const config: AppConfig = {
  port: getEnvNumber('PORT', 3000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  apiVersion: getEnv('API_VERSION', 'v1'),

  database: {
    host: getEnv('DATABASE_HOST', 'localhost'),
    port: getEnvNumber('DATABASE_PORT', 5432),
    name: getEnv('DATABASE_NAME', 'reading_trainer'),
    user: getEnv('DATABASE_USER', 'postgres'),
    password: getEnv('DATABASE_PASSWORD', ''),
    ssl: getEnvBoolean('DATABASE_SSL', false),
    maxConnections: getEnvNumber('DATABASE_MAX_CONNECTIONS', 20),
  },

  supabase: {
    url: getEnv('NEXT_PUBLIC_SUPABASE_URL', ''),
    anonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
    serviceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY', undefined),
  },

  jwt: {
    secret: getEnv('JWT_SECRET', 'your-secret-key-change-in-production'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '1h'),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', 'your-refresh-secret-key'),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  redis: {
    host: getEnv('REDIS_HOST', 'localhost'),
    port: getEnvNumber('REDIS_PORT', 6379),
    password: getEnv('REDIS_PASSWORD', undefined),
    db: getEnvNumber('REDIS_DB', 0),
  },

  rateLimit: {
    windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:3000').split(','),
    credentials: getEnvBoolean('CORS_CREDENTIALS', true),
  },

  logging: {
    level: getEnv('LOG_LEVEL', 'info'),
    format: getEnv('LOG_FORMAT', 'json'),
  },
};

