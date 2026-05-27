import process from 'process';
import os from 'os';
import http from 'http';
import cluster from 'cluster';
import app from '@app';
import db from '@db';
import { config } from '@constants';
import { logger } from './logger';

const { host, port, dbHost, dbPort, dbName, dbUser, dbPass } = config;

const mongoUrl = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
const useCluster = process.env.NODE_ENV === 'production';

const getWorkerCount = (): number => {
  const cpus = os.cpus().length;
  return Math.max(1, Math.min(cpus, cpus > 2 ? cpus - 1 : cpus));
};

const startServer = (): void => {
  const server = http.createServer(app());

  server.listen(port, host, () => {
    const address = server.address();
    if (address && typeof address === 'object') {
      logger.info({ port: address.port, host: address.address, pid: process.pid }, 'Connect server started');
    }
  });
};

const startWorker = (): void => {
  void db.connect(mongoUrl, startServer);
};

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
  startWorker();
}

process.on('unhandledRejection', (error) => {
  logger.fatal({ err: error }, 'Unhandled rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});
