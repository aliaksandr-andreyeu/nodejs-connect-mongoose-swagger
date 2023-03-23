import url from 'url';
import jwtVerify from './jwt-verify';

const router = (routes) => {
  return (req, res, next) => {
    const parsedURL = url.parse(req.url);
    const pathname = parsedURL.pathname;
    const route = routes[pathname];

    if (!route) {
      next();
      return;
    }

    const query = new URLSearchParams(parsedURL.query);
    const params = {};

    query.forEach((value, key) => {
      params[key] = value;
    });

    req.params = params;

    const obj = route[req.method];
    const auth = (obj && obj.auth) || false;
    const handler = (obj && obj.handler) || false;

    if (handler && typeof handler === 'function') {
      auth ? jwtVerify(handler, req, res, next) : handler(req, res, next);
      return;
    }

    next();
    return;
  };
};

export default router;
