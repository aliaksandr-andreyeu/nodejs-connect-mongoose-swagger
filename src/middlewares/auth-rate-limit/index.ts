import url from 'url';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import type { NextHandleFunction } from 'connect';
import { config, encoding, httpStatusMessage, jsonHeader } from '@constants';
import { getRedisClient } from '@db/redis';
import type { AppRequest, AppResponse } from '@types';
import { logger } from '../../logger';

const AUTH_PATHS = new Set(['/signin', '/signup', '/reset-password', '/reset-password/confirm']);

let limiter: RateLimiterRedis | null = null;

export const initAuthRateLimiter = (): void => {
  if (!config.rateLimit.enabled) {
    return;
  }

  limiter = new RateLimiterRedis({
    storeClient: getRedisClient(),
    keyPrefix: 'rl_auth',
    points: config.rateLimit.points,
    duration: config.rateLimit.durationSec
  });
};

const getClientIp = (req: AppRequest): string => {
  // Only trust X-Forwarded-For behind a known proxy (TRUST_PROXY=true); otherwise
  // a client could spoof the header to dodge the per-IP rate limit.
  if (config.trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
  }
  return req.socket?.remoteAddress || 'unknown';
};

const authRateLimit: NextHandleFunction = (req, res, next) => {
  const appRes = res as AppResponse;
  const appReq = req as AppRequest;

  if (!config.rateLimit.enabled || !limiter) {
    next();
    return;
  }

  const pathname = url.parse(appReq.url || '').pathname || '';
  if (appReq.method !== 'POST' || !AUTH_PATHS.has(pathname)) {
    next();
    return;
  }

  const key = getClientIp(appReq);

  void limiter
    .consume(key)
    .then(() => next())
    .catch((rejRes: { msBeforeNext?: number } | Error) => {
      if (rejRes instanceof Error) {
        logger.error({ err: rejRes }, 'Rate limiter error');
        next(rejRes);
        return;
      }

      const retryAfterSec = Math.max(1, Math.ceil((rejRes.msBeforeNext ?? 1000) / 1000));
      appRes.writeHead(429, httpStatusMessage[429], {
        ...jsonHeader,
        'Retry-After': String(retryAfterSec)
      });
      appRes.end(
        JSON.stringify({
          message: 'Too many requests. Please try again later.',
          status: 'TooManyRequests'
        }),
        encoding
      );
    });
};

export default authRateLimit;
