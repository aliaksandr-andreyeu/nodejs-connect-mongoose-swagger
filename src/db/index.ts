import mongoose from 'mongoose';
import { logger } from '../logger';

let sigintRegistered = false;

const db = {
  connect: async (url: string, cb?: () => void): Promise<void> => {
    mongoose.set('debug', process.env.NODE_ENV === 'development');

    const mConnect = mongoose.connection;

    mConnect
      .on('connecting', () => {
        logger.info('MongoDB connecting...');
      })
      .on('connected', () => {
        logger.info('MongoDB connection established');
      })
      .on('reconnected', () => {
        logger.info('MongoDB connection reestablished');
      })
      .on('disconnected', () => {
        logger.warn('MongoDB connection disconnected');
      })
      .on('close', () => {
        logger.info('MongoDB connection closed');
      })
      .on('error', (err) => {
        logger.error({ err }, 'MongoDB connection error');
      });

    if (!sigintRegistered) {
      sigintRegistered = true;
      process.on('SIGINT', () => {
        void mConnect.close().then(() => {
          logger.info('MongoDB connection closed (SIGINT)');
          process.exit(0);
        });
      });
    }

    try {
      await mongoose.connect(url, { bufferCommands: false });

      logger.info('MongoDB connection opened');
      if (cb) {
        cb();
      }
    } catch (error) {
      const err = error as Error;
      logger.fatal({ err }, 'MongoDB connect failed');

      process.exit(1);
    }
  }
};

export default db;
