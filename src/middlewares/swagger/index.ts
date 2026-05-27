import fs from 'fs';
import path from 'path';
import url from 'url';
import mime from 'mime-types';

import { httpStatusMessage } from '@constants';
import type { AppRequest, AppResponse } from '@types';

const notFound = (res: AppResponse) => {
  res.writeHead(404, httpStatusMessage[404]);
  res.end();
};

const getFilePath = (filePath: string | false): string | false => {
  if (!filePath) return false;
  return path.join(__dirname, '../../', filePath);
};

const swagger = (req: AppRequest, res: AppResponse) => {
  if (!['GET'].includes(req.method || '')) {
    notFound(res);
    return;
  }

  const pathname = url.parse(req.url || '').pathname || '/';

  let filePath: string | false = false;

  if (pathname === '/') {
    filePath = './public/index.html';
  } else {
    filePath = './public' + pathname;
  }

  const resolvedPath = getFilePath(filePath);
  if (!resolvedPath) {
    notFound(res);
    return;
  }

  fs.exists(resolvedPath, (hasFile) => {
    if (!hasFile) {
      notFound(res);
      return;
    }

    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        notFound(res);
        return;
      }

      const contentType = mime.lookup(path.basename(resolvedPath)) || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': `${contentType}; charset=utf-8`
      });
      res.end(data);
    });
  });
};

export default swagger;
