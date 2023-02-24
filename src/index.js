'use strict';

import process from 'process';
import os from 'os';
import path from 'path';
import http from 'http';
import cluster from 'cluster';
import dotenv from 'dotenv';
import app from '@app';
import db from '@db';

const env = process.env || {};

dotenv.config({
  path: path.join(__dirname, `./environments/.env.${env.NODE_ENV}`)
});

const HOST = env.HOST || 'localhost';
const PORT = env.PORT || 3000;
const DB_HOST = env.DB_HOST || 'localhost';
const DB_PORT = env.DB_PORT || 27017;
const DB_NAME = env.DB_NAME;
const DB_USER = env.DB_USER;
const DB_PSW = env.DB_PSW;

const cpus = os.cpus();
const workers = cpus.length - 2;

db.connect(`mongodb://${DB_USER}:${DB_PSW}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, () => {
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

    server.listen(PORT, HOST, () => {
      console.log('Connect server started on port %s at %s', server.address().port, server.address().address);
    });
  }
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  process.exit(1);
});
