import connect from 'connect';
import helmet from 'helmet';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import router from './router';
import { bodyParser, responseDelay } from '@middlewares';
import { users, auth } from '@routes';

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

  server.use(cors());

  server.use(responseDelay);
  server.use(bodyParser);

  server.use(router(auth));
  server.use(router(users));

  return server;
};

export default app;
