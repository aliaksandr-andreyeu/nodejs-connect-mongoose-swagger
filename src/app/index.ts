import connect, { NextHandleFunction } from 'connect';
import helmet from 'helmet';
import compression from 'compression';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import router from './router';
import { authRateLimit, bodyParser, errorsHandler, responseDelay, swagger, xssSanitize } from '@middlewares';
import { users, auth, account } from '@routes';
import { config } from '@constants';
import { logger } from '../logger';

const app = () => {
  const server = connect();

  server.use(helmet());
  server.use(
    mongoSanitize({
      onSanitize: ({ key }) => {
        logger.warn({ key }, 'MongoSanitize sanitized request key');
      }
    })
  );
  server.use(hpp());

  server.use(
    compression({
      level: 6
    }) as unknown as NextHandleFunction
  );

  server.use(
    cors({
      allowedHeaders: ['Content-Type', 'Authorization'],
      origin: (origin, callback) => {
        // Allow non-browser requests with no Origin header.
        if (!origin) {
          callback(null, true);
          return;
        }
        // If allowlist not set, default deny when credentials are enabled.
        if (!config.corsOrigins || config.corsOrigins.length === 0) {
          callback(new Error('CORS origin not allowed'), false);
          return;
        }
        callback(null, config.corsOrigins.includes(origin));
      },
      methods: ['HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
      credentials: true,
      maxAge: 86400
    }) as unknown as NextHandleFunction
  );

  server.use(responseDelay);
  server.use(cookieParser() as unknown as NextHandleFunction);
  server.use(bodyParser);
  server.use(xssSanitize);

  server.use(authRateLimit);
  server.use(router(auth));
  server.use(router(users));
  server.use(router(account));

  server.use(swagger);
  server.use(errorsHandler);

  return server;
};

export default app;
