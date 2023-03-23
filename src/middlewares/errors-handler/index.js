import { httpStatusMessage, jsonHeader, encoding } from '@constants';

const errorsHandler = (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  console.log('***************************************************');
  console.log('*** Error name: ', err.name);
  console.log('*** Error message: ', err.message);
  // console.log('*** Error stack: ', err.stack);

  const code = err.code || 400;

  const response = {
    message: `${err.message}`,
    status: `${err.name}`
  };

  res.writeHead(code, httpStatusMessage[code], jsonHeader);
  res.end(JSON.stringify(response), encoding);
};

export default errorsHandler;
