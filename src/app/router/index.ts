import url from 'url';
import jwtVerify from './jwt-verify';
import type { AppNextFunction, AppRequest, AppResponse, RoutesMap } from '@types';

const matchRoute = (
  routes: RoutesMap,
  pathname: string
): { route: RoutesMap[string]; params: Record<string, string> } | null => {
  const direct = routes[pathname];
  if (direct) {
    return { route: direct, params: {} };
  }

  // Support simple path params like "/users/:id"
  for (const [pattern, route] of Object.entries(routes)) {
    if (!pattern.includes('/:')) {
      continue;
    }
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (patternParts.length !== pathParts.length) {
      continue;
    }

    const params: Record<string, string> = {};
    let ok = true;

    for (let i = 0; i < patternParts.length; i++) {
      const p = patternParts[i];
      const v = pathParts[i];
      if (p.startsWith(':')) {
        params[p.slice(1)] = decodeURIComponent(v);
      } else if (p !== v) {
        ok = false;
        break;
      }
    }

    if (ok) {
      return { route, params };
    }
  }

  return null;
};

const router = (routes: RoutesMap) => {
  return (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
    const parsedURL = url.parse(req.url || '');
    const pathname = parsedURL.pathname;
    if (!pathname) {
      next();
      return;
    }

    const match = matchRoute(routes, pathname);
    if (!match) {
      next();
      return;
    }

    const query = new URLSearchParams(parsedURL.query || undefined);
    const queryParams: Record<string, string> = {};
    query.forEach((value, key) => {
      queryParams[key] = value;
    });

    req.params = match.params;
    req.query = queryParams;

    const method = req.method || 'GET';
    const obj = match.route[method];
    const auth = obj?.auth || false;
    const handler = obj?.handler;

    if (handler && typeof handler === 'function') {
      if (auth) {
        void jwtVerify(handler, req, res, next);
      } else {
        void handler(req, res, next);
      }
      return;
    }

    next();
  };
};

export default router;
