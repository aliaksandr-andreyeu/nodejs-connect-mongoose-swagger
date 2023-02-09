import connect from 'connect';
import helmet from 'helmet';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

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

  return server;
};

export default app;
