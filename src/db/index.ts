import mongoose from 'mongoose';
import { userModel } from '@models';
import { logger } from '../logger';

const db = {
  connect: async (url: string): Promise<void> => {
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

    try {
      await mongoose.connect(url, { bufferCommands: false });
      logger.info('MongoDB connection opened');

      // Ensure declared indexes (e.g. unique username) exist. autoIndex is off
      // in production, so build them explicitly once at startup.
      if (process.env.NODE_ENV === 'production') {
        await userModel.syncIndexes();
        logger.info('MongoDB indexes synced');
      }
    } catch (error) {
      const err = error as Error;
      logger.fatal({ err }, 'MongoDB connect failed');

      process.exit(1);
    }
  },

  disconnect: async (): Promise<void> => {
    await mongoose.connection.close();
  }
};

export default db;
