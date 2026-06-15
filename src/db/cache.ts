import { config } from '@constants';
import { getRedisClient } from './redis';
import { logger } from '../logger';

// Minimal user projection needed to authorize a request without hitting Mongo:
// `username` (matched against the JWT subject) and `refreshToken` (the current
// refresh jti used for server-side revocation).
export interface CachedUser {
  username: string;
  refreshToken: string;
}

const userKey = (id: string): string => `user:${id}`;

// Cache is best-effort: when Redis is disabled or unreachable we silently fall
// back to Mongo so auth keeps working.
const cacheEnabled = (): boolean => config.redis.enabled;

export const getCachedUser = async (id: string): Promise<CachedUser | null> => {
  if (!cacheEnabled()) {
    return null;
  }
  try {
    const raw = await getRedisClient().get(userKey(id));
    return raw ? (JSON.parse(raw) as CachedUser) : null;
  } catch (err) {
    logger.warn({ err }, 'User cache read failed');
    return null;
  }
};

export const cacheUser = async (id: string, user: CachedUser): Promise<void> => {
  if (!cacheEnabled()) {
    return;
  }
  try {
    await getRedisClient().set(userKey(id), JSON.stringify(user), 'EX', config.redis.userCacheTtlSec);
  } catch (err) {
    logger.warn({ err }, 'User cache write failed');
  }
};

export const invalidateUser = async (id: string): Promise<void> => {
  if (!cacheEnabled()) {
    return;
  }
  try {
    await getRedisClient().del(userKey(id));
  } catch (err) {
    logger.warn({ err }, 'User cache invalidation failed');
  }
};
