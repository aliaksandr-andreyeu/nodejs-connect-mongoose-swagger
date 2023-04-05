import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

import { httpStatusMessage } from '@constants';

const notFound = (res) => {
  res.writeHead(404, httpStatusMessage[404]);
  res.end();
};

const getFilePath = (filePath) => {
  if (!filePath) return false;
  return path.join(__dirname, '../../', filePath);
};

const swagger = (req, res) => {
  if (!['GET'].includes(req.method)) {
    return notFound(res);
  }

  let filePath = false;

  if (req.url == '/') {
    filePath = './public/index.html';
  } else {
    filePath = './public' + req.url;
  }

  fs.exists(getFilePath(filePath), (hasFile) => {
    if (!hasFile) {
      return notFound(res);
    }

    fs.readFile(getFilePath(filePath), (err, data) => {
      if (err) {
        return notFound(res);
      }

      res.writeHead(200, {
        'Content-Type': `${mime.lookup(path.basename(filePath))}; charset=utf-8`
      });
      res.end(data);
    });
  });
};

export default swagger;
