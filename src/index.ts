import process from 'process';
import os from 'os';
import http from 'http';
import cluster from 'cluster';
import app from '@app';
import db from '@db';
import { connectRedis, disconnectRedis } from '@db/redis';
import { initAuthRateLimiter } from '@middlewares';
import { config, assertConfig } from '@constants';
import { logger } from './logger';

const { host, port, dbHost, dbPort, dbName, dbUser, dbPass } = config;

const mongoUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
const useCluster = process.env.NODE_ENV === 'production';
const isProd = process.env.NODE_ENV === 'production';
const SHUTDOWN_TIMEOUT_MS = 10000;

const verifyConfig = (): void => {
  const problems = assertConfig();
  if (problems.length === 0) {
    return;
  }
  if (isProd) {
    logger.fatal({ problems }, 'Invalid configuration; refusing to start');
    process.exit(1);
  }
  logger.warn({ problems }, 'Configuration issues detected (non-production)');
};

const getWorkerCount = (): number => {
  const cpus = os.cpus().length;
  return Math.max(1, Math.min(cpus, cpus > 2 ? cpus - 1 : cpus));
};

const startServer = (): http.Server => {
  const server = http.createServer(app());

  server.listen(port, host, () => {
    const address = server.address();
    if (address && typeof address === 'object') {
      logger.info({ port: address.port, host: address.address, pid: process.pid }, 'Connect server started');
    }
  });

  return server;
};

const registerShutdown = (server: http.Server): void => {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info({ signal, pid: process.pid }, 'Graceful shutdown started');

    // Force-exit if cleanup hangs.
    const forceTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out; forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceTimer.unref();

    try {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await db.disconnect();
      await disconnectRedis();
      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
};

const startWorker = async (): Promise<void> => {
  await connectRedis();
  initAuthRateLimiter();
  await db.connect(mongoUrl);
  const server = startServer();
  registerShutdown(server);
};

verifyConfig();

if (useCluster && cluster.isPrimary) {
  const workers = getWorkerCount();
  logger.info({ workers }, 'Starting cluster');

  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code) => {
    logger.warn({ pid: worker.process.pid, code }, 'Worker died; restarting');
    cluster.fork();
  });
} else {
  void startWorker();
}

// On an unrecoverable error, log and exit (the cluster primary respawns the
// worker). pino flushes its buffer synchronously on the process 'exit' event,
// so the fatal line is not lost despite the immediate exit.
const fatalExit = (error: unknown, event: string): never => {
  logger.fatal({ err: error, event }, `Fatal: ${event}`);
  process.exit(1);
};

process.on('unhandledRejection', (error) => fatalExit(error, 'unhandledRejection'));
process.on('uncaughtException', (error) => fatalExit(error, 'uncaughtException'));
