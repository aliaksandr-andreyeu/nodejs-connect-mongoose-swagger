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
  corsOrigins: string[];
  redis: {
    enabled: boolean;
    host: string;
    port: number;
    password: string;
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
  corsOrigins: (env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  redis: {
    enabled: env.REDIS_ENABLED !== 'false',
    host: env.REDIS_HOST || 'localhost',
    port: Number(env.REDIS_PORT) || 6379,
    password: env.REDIS_PASSWORD || ''
  },
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED !== 'false',
    points: Number(env.RATE_LIMIT_AUTH_POINTS) || 10,
    durationSec: Number(env.RATE_LIMIT_AUTH_DURATION_SEC) || 60
  }
};

export default config;
