import { apiErrors, config, httpStatusMessage, jsonHeader, encoding } from '@constants';
import { userError, isObject } from '@helpers';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const MUTATING_METHODS = ['PATCH', 'POST', 'PUT'];

const bodyParser = (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  const chunks: Buffer[] = [];
  let received = 0;
  let aborted = false;

  const rejectTooLarge = () => {
    aborted = true;
    res.writeHead(413, httpStatusMessage[413], { ...jsonHeader, Connection: 'close' });
    res.end(JSON.stringify({ message: apiErrors.common.payloadTooLarge, status: 'PayloadTooLarge' }), encoding);
    // Drain and discard the rest so the connection closes cleanly (avoids an RST
    // / "socket hang up" on the client) without buffering the oversized body.
    req.resume();
  };

  // Fast path: reject before reading the body when the declared size is over.
  const declaredLength = Number(req.headers['content-length']);
  if (Number.isFinite(declaredLength) && declaredLength > config.maxBodyBytes) {
    rejectTooLarge();
    return;
  }

  const onEnd = () => {
    if (aborted) {
      return;
    }

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
    if (aborted) {
      return;
    }

    received += chunk.length;
    if (received > config.maxBodyBytes) {
      rejectTooLarge();
      return;
    }

    chunks.push(chunk);
  });
  req.on('end', onEnd);
  req.on('error', (err) => {
    if (aborted) {
      return;
    }
    next(err);
  });
};

export default bodyParser;
