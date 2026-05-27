import Redis from 'ioredis';
import { config } from '@constants';
import { logger } from '../logger';

let client: Redis | null = null;

export const connectRedis = async (): Promise<void> => {
  if (!config.redis.enabled) {
    return;
  }

  if (!config.redis.password) {
    logger.fatal('REDIS_PASSWORD is required when Redis is enabled');
    process.exit(1);
  }

  try {
    const redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    redis.on('error', (err) => {
      logger.error({ err }, 'Redis error');
    });

    await redis.connect();
    await redis.ping();

    client = redis;
    logger.info({ host: config.redis.host, port: config.redis.port }, 'Redis connection established');
  } catch (error) {
    logger.fatal({ err: error }, 'Redis connect failed');
    process.exit(1);
  }
};

export const getRedisClient = (): Redis => {
  if (!client) {
    throw new Error('Redis is not connected');
  }
  return client;
};

export const disconnectRedis = async (): Promise<void> => {
  if (!client) {
    return;
  }
  await client.quit();
  client = null;
  logger.info('Redis connection closed');
};
