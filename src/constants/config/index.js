import process from 'process';
import path from 'path';
import dotenv from 'dotenv';

const env = process.env || {};

dotenv.config({
  path: path.join(__dirname, `../../environments/.env.${env.NODE_ENV}`)
});

const config = {
  host: env.HOST || 'localhost',
  port: Number(env.PORT) || 3000,
  dbHost: env.DB_HOST || 'localhost',
  dbPort: Number(env.DB_PORT) || 27017,
  dbName: env.DB_NAME || '',
  dbUser: env.DB_USER || '',
  dbPass: env.DB_PSW || '',
  accessTokenKey: env.ACCESS_TOKEN_KEY || '',
  accessTokenExpiresIn: Number(env.ACCESS_TOKEN_EXPIRES_IN) || 5,
  refreshTokenKey: env.REFRESH_TOKEN_KEY || '',
  refreshTokenExpiresIn: Number(env.REFRESH_TOKEN_EXPIRES_IN) || 60,
  responseTimeout: Number(env.RESPONSE_DELAY) || 0
};

export default config;
