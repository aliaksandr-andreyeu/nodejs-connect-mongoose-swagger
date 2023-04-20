import process from 'process';
import os from 'os';
import http from 'http';
import cluster from 'cluster';
import app from '@app';
import db from '@db';
import { config } from '@constants';

const { host, port, dbHost, dbPort, dbName, dbUser, dbPass } = config;

const cpus = os.cpus();
const workers = cpus.length - 2;

db.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`, () => {
  const server = http.createServer(app());

  if (cluster.isPrimary) {
    for (let i = 0; i < workers; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code) => {
      console.log('WORKER DEAD PID:', worker.process.pid, ' CODE:', code);
      cluster.fork();
    });
  } else {
    console.log('WORKER STARTED PID:', process.pid);

    server.listen(port, host, () => {
      console.log('Connect server started on port %s at %s', server.address().port, server.address().address);
    });
  }
});

process.on('unhandledRejection', (error) => {
  console.log('Unhandled Rejection Error: ', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception Error: ', error);
  process.exit(1);
});
