declare module 'hpp' {
  import { RequestHandler } from 'connect';
  function hpp(): RequestHandler;
  export default hpp;
}

declare module 'etag' {
  function etag(entity: string, options?: { weak?: boolean }): string;
  export default etag;
}

declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'connect';

  interface MongoSanitizeOptions {
    onSanitize?: (params: { req: unknown; key: string }) => void;
  }

  function mongoSanitize(options?: MongoSanitizeOptions): RequestHandler;
  export default mongoSanitize;
}
