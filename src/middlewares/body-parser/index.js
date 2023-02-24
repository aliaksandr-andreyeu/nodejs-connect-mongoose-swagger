import { apiErrors } from '@constants';
import { userError, errorHandler } from '@helpers';

const bodyParser = (req, res, next) => {
  let body = [];

  req
    .on('data', (chunk) => {
      body.push(chunk);
    })
    .on('end', () => {
      body = Buffer.concat(body).toString();

      if (!['PATCH', 'POST', 'PUT'].includes(req.method)) {
        next();
        return;
      }

      try {
        if (!body) {
          throw new userError(apiErrors.common.bodyIsEmpty, 400);
        }

        const contentType = req.headers['content-type'];
        const isApplicationJson = contentType.split(';').includes('application/json');

        if (isApplicationJson) {
          try {
            const jsonBody = JSON.parse(body);
            req.body = jsonBody;

            next();
          } catch (e) {
            throw new userError(apiErrors.common.invalidJSON, 400);
          }
        }
      } catch (err) {
        errorHandler(err, req, res, next);
      }
    });
};

export default bodyParser;
