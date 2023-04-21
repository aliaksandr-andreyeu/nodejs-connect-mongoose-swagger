import connect from 'connect';
import helmet from 'helmet';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import router from './router';
import { bodyParser, errorsHandler, responseDelay, swagger } from '@middlewares';
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
      origin: true,
      methods: ['HEAD', 'OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
      credentials: true,
      maxAge: 86400
    })
  );

  server.use(responseDelay);
  server.use(cookieParser());
  server.use(bodyParser);

  server.use(router(auth));
  server.use(router(users));
  server.use(router(account));

  server.use(swagger);
  server.use(errorsHandler);

  return server;
};

export default app;
