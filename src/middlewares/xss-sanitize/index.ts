import xss from 'xss';
import { isObject } from '@helpers';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isObject(value)) {
    return sanitizeObject(value);
  }

  return value;
};

const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeValue(value);
  }

  return result;
};

const xssSanitize = (req: AppRequest, _res: AppResponse, next: AppNextFunction) => {
  if (req.body && isObject(req.body)) {
    req.body = sanitizeObject(req.body);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params) as AppRequest['params'];
  }

  next();
};

export default xssSanitize;
