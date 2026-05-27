import { apiErrors } from '@constants';
import { userError, isObject } from '@helpers';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const MUTATING_METHODS = ['PATCH', 'POST', 'PUT'];

const bodyParser = (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  const chunks: Buffer[] = [];

  const onEnd = () => {
    const method = req.method || '';

    if (!MUTATING_METHODS.includes(method)) {
      next();
      return;
    }

    const body = Buffer.concat(chunks).toString();
    const contentType = req.headers['content-type'];

    if (!contentType) {
      next();
      return;
    }

    const isApplicationJson = contentType
      .split(';')
      .map((part) => part.trim())
      .includes('application/json');

    if (!isApplicationJson) {
      next();
      return;
    }

    try {
      if (!body) {
        next(userError(apiErrors.common.bodyIsEmpty, 400));
        return;
      }

      const jsonBody: unknown = JSON.parse(body);

      if (!isObject(jsonBody)) {
        next(userError(apiErrors.common.invalidJSON, 400));
        return;
      }

      req.body = jsonBody;
      next();
    } catch {
      next(userError(apiErrors.common.invalidJSON, 400));
    }
  };

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });
  req.on('end', onEnd);
  req.on('error', (err) => {
    next(err);
  });
};

export default bodyParser;
