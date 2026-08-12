import { config } from '@constants';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const { responseTimeout } = config;

const responseDelay = (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  // No artificial delay configured — pass through synchronously.
  if (!responseTimeout || responseTimeout <= 0) {
    next();
    return;
  }

  setTimeout(next, responseTimeout);
};

export default responseDelay;
