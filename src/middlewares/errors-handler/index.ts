import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import type { AppError, AppNextFunction, AppRequest, AppResponse } from '@types';
import { logger } from '../../logger';

const errorsHandler = (err: AppError | null, req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  if (!err) {
    next();
    return;
  }

  // Only errors explicitly marked client-safe (via userError) expose their
  // message/status. Anything else is an unexpected failure → generic 500, with
  // full details kept in the log.
  const expose = err.expose === true;
  const code = expose ? err.code || 400 : 500;
  const statusMessage = httpStatusMessage[code] || httpStatusMessage[500];

  const response = expose
    ? { message: `${err.message}`, status: `${err.name}` }
    : { message: httpStatusMessage[500], status: 'InternalServerError' };

  logger.error(
    {
      err,
      code: err.code,
      name: err.name,
      message: err.message
    },
    'Request error'
  );

  res.writeHead(code, statusMessage, jsonHeader);
  res.end(JSON.stringify(response), encoding);
};

export default errorsHandler;
