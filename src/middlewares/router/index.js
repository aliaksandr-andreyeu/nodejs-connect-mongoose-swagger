import url from 'url';

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

    const fn = route[req.method];

    if (fn && typeof fn === 'function') {
      fn(req, res, next);
      return;
    }

    next();
  };
};

export default router;
