'use strict';

import process from 'process';
import os from 'os';
import path from 'path';
import http from 'http';
import cluster from 'cluster';
import dotenv from 'dotenv';
import app from './app';

const env = process.env || {};

dotenv.config({
  path: path.join(__dirname, `./environments/.env.${env.NODE_ENV}`)
});

const HOST = env.HOST || 'localhost';
const PORT = env.PORT || 3000;

const cpus = os.cpus();
const workers = cpus.length - 2;

const server = http.createServer(app());

if (cluster.isMaster) {
  for (let i = 0; i < workers; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code) => {
    console.log('WORKER DEAD PID:', worker.process.pid, ' CODE:', code);
    cluster.fork();
  });
} else {
  console.log('WORKER STARTED PID:', process.pid);

  server.listen(PORT, HOST, () => {
    console.log('Connect server started on port %s at %s', server.address().port, server.address().address);
  });
}

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  process.exit(1);
});
