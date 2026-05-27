import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import type { AppError, AppNextFunction, AppRequest, AppResponse } from '@types';
import { logger } from '../../logger';

const errorsHandler = (err: AppError | null, req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  if (!err) {
    next();
    return;
  }

  const code = err.code || 400;
  const statusMessage = httpStatusMessage[code] || httpStatusMessage[400];

  const response = {
    message: `${err.message}`,
    status: `${err.name}`
  };

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
