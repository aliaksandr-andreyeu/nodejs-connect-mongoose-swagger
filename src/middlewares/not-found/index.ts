import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import type { AppRequest, AppResponse } from '@types';

// Final fallback for any request that matched no route and no static asset.
// Returns the API's standard JSON error shape instead of an empty body.
const notFound = (req: AppRequest, res: AppResponse): void => {
  res.writeHead(404, httpStatusMessage[404], jsonHeader);
  res.end(
    JSON.stringify({
      message: httpStatusMessage[404],
      status: 'NotFound'
    }),
    encoding
  );
};

export default notFound;
