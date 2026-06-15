import process from 'process';
import path from 'path';
import dotenv from 'dotenv';

const env = process.env;

dotenv.config({
  path: path.join(__dirname, `../../../.env.${env.NODE_ENV}`)
});

export interface AppConfig {
  host: string;
  port: number;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPass: string;
  accessTokenKey: string;
  accessTokenExpiresIn: number;
  refreshTokenKey: string;
  refreshTokenExpiresIn: number;
  responseTimeout: number;
  bcryptRounds: number;
  maxBodyBytes: number;
  trustProxy: boolean;
  resetTokenTtlMin: number;
  corsOrigins: string[];
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password: string;
    userCacheTtlSec: number;
  };
  rateLimit: {
    enabled: boolean;
    points: number;
    durationSec: number;
  };
}

const config: AppConfig = {
  host: env.HOST || 'localhost',
  port: Number(env.PORT) || 3000,
  dbHost: env.DB_HOST || 'localhost',
  dbPort: Number(env.DB_PORT) || 27017,
  dbName: env.DB_NAME || '',
  dbUser: env.DB_USER || '',
  dbPass: env.DB_PSW || '',
  accessTokenKey: env.ACCESS_TOKEN_KEY || '',
  accessTokenExpiresIn: Number(env.ACCESS_TOKEN_EXPIRES_IN) || 5,
  refreshTokenKey: env.REFRESH_TOKEN_KEY || '',
  refreshTokenExpiresIn: Number(env.REFRESH_TOKEN_EXPIRES_IN) || 60,
  responseTimeout: Number(env.RESPONSE_DELAY) || 0,
  bcryptRounds: Number(env.BCRYPT_ROUNDS) || 12,
  maxBodyBytes: Number(env.MAX_BODY_BYTES) || 1024 * 1024,
  trustProxy: env.TRUST_PROXY === 'true',
  resetTokenTtlMin: Number(env.RESET_TOKEN_TTL_MIN) || 15,
  corsOrigins: (env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  redis: {
    enabled: env.REDIS_ENABLED !== 'false',
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || '',
    userCacheTtlSec: Number(env.REDIS_USER_CACHE_TTL_SEC) || 60
  },
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED !== 'false',
    points: Number(env.RATE_LIMIT_AUTH_POINTS) || 10,
    durationSec: Number(env.RATE_LIMIT_AUTH_DURATION_SEC) || 60
  }
};

// Fail fast on missing/weak required configuration. In production a misconfigured
// secret (e.g. an empty JWT key) is a critical security hole, so we refuse to
// start; outside production we only warn to keep local setup frictionless.
export const assertConfig = (cfg: AppConfig = config): string[] => {
  const problems: string[] = [];

  if (!cfg.dbName) problems.push('DB_NAME is empty');
  if (!cfg.dbUser) problems.push('DB_USER is empty');
  if (!cfg.dbPass) problems.push('DB_PSW is empty');

  if (cfg.accessTokenKey.length < 16) problems.push('ACCESS_TOKEN_KEY must be at least 16 characters');
  if (cfg.refreshTokenKey.length < 16) problems.push('REFRESH_TOKEN_KEY must be at least 16 characters');
  if (cfg.accessTokenKey === cfg.refreshTokenKey) {
    problems.push('ACCESS_TOKEN_KEY and REFRESH_TOKEN_KEY must differ');
  }

  if (cfg.redis.enabled && !cfg.redis.password) {
    problems.push('REDIS_PASSWORD is required when Redis is enabled');
  }

  return problems;
};

export default config;
