import url from 'url';
import mongoose from 'mongoose';

import { config, httpStatusMessage, jsonHeader, encoding } from '@constants';
import { getRedisClient } from '@db/redis';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';
import { logger } from '../../logger';

const writeJson = (res: AppResponse, code: number, body: unknown): void => {
  res.writeHead(code, httpStatusMessage[code] || httpStatusMessage[500], jsonHeader);
  res.end(JSON.stringify(body), encoding);
};

const checkRedis = async (): Promise<boolean> => {
  if (!config.redis.enabled) {
    return true;
  }
  try {
    const pong = await getRedisClient().ping();
    return pong === 'PONG';
  } catch (err) {
    logger.warn({ err }, 'Readiness: Redis ping failed');
    return false;
  }
};

const health = (req: AppRequest, res: AppResponse, next: AppNextFunction): void => {
  const pathname = url.parse(req.url || '').pathname || '';

  if (req.method !== 'GET' || (pathname !== '/health' && pathname !== '/ready')) {
    next();
    return;
  }

  // Liveness: the process is up and serving.
  if (pathname === '/health') {
    writeJson(res, 200, { status: 'ok' });
    return;
  }

  // Readiness: dependencies (MongoDB, Redis) are reachable.
  const mongoReady = mongoose.connection.readyState === 1;

  void checkRedis().then((redisReady) => {
    const ready = mongoReady && redisReady;
    writeJson(res, ready ? 200 : 503, {
      status: ready ? 'ready' : 'not-ready',
      checks: { mongodb: mongoReady, redis: redisReady }
    });
  });
};

export default health;
