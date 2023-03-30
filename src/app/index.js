import connect from 'connect';
import helmet from 'helmet';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import router from './router';
import { bodyParser, errorsHandler } from '@middlewares';
import { users, auth, account } from '@routes';

const app = () => {
  const server = connect();

  server.use(helmet());
  server.use(
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        console.warn(`Mongo Sanitize: This request[${key}] is sanitized`, req);
      }
    })
  );
  server.use(xss());
  server.use(hpp());

  server.use(
    compression({
      level: 6
    })
  );

  server.use(
    cors({
      allowedHeaders: ['Content-Type', 'Authorization'],
      origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      maxAge: 86400
    })
  );

  server.use(cookieParser());
  server.use(bodyParser);

  server.use(router(auth));
  server.use(router(users));
  server.use(router(account));

  server.use(errorsHandler);

  return server;
};

export default app;
