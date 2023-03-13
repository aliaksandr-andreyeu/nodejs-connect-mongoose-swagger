import { apiErrors } from '@constants';
import { userModel } from '@models';

export const getRequestParamsId = (req) => {
  return req && req.params && req.params.id ? req.params.id.toString().toLowerCase() : false;
};

export const userError = (msg, code) => {
  const error = new Error(msg);
  error.code = code;
  return error;
};

export const mapRequestBody = (req, isPatch = false) => {
  let errors = [];
  let data = {};
  let excluded = {};

  if (!req) return { data, errors };

  const model = userModel.schema.obj;
  const body = req.body;

  Object.keys(model).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const item = model[key].type(body[key]);
      const value = typeof item === 'string' ? item.trim() : item;

      data[key] = value;

      if (typeof value === 'number' && value !== value) {
        errors.push(apiErrors.common.fieldNotNumber(key));
      }

      if (!value && typeof value === 'string' && Boolean(model[key].required)) {
        errors.push(apiErrors.common.fieldEmpty(key));
      }
    } else if (!isPatch) {
      if (model[key].required) {
        errors.push(apiErrors.common.fieldRequired(key));
      } else {
        excluded[key] = model[key].type('');
      }
    }
  });

  return { data, excluded, errors };
};
