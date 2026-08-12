import fs from 'fs';
import path from 'path';
import url from 'url';
import mime from 'mime-types';

import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const PUBLIC_ROOT = path.join(__dirname, '../../public');

// Resolve a request path to a file strictly inside PUBLIC_ROOT. Decodes the
// path, normalizes `..`/`.` segments, and rejects anything that escapes the
// public directory (path-traversal guard).
const resolvePublicFile = (pathname: string): string | null => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.normalize(path.join(PUBLIC_ROOT, relative));

  if (resolved !== PUBLIC_ROOT && !resolved.startsWith(PUBLIC_ROOT + path.sep)) {
    return null;
  }

  return resolved;
};

const swagger = (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  // Only GET serves static assets; everything else falls through to the 404.
  if (req.method !== 'GET') {
    next();
    return;
  }

  const pathname = url.parse(req.url || '').pathname || '/';
  const resolvedPath = resolvePublicFile(pathname);

  if (!resolvedPath) {
    next();
    return;
  }

  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      next();
      return;
    }

    const contentType = mime.lookup(path.basename(resolvedPath)) || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': `${contentType}; charset=utf-8`
    });
    res.end(data);
  });
};

export default swagger;
