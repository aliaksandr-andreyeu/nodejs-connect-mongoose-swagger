import { config } from '@constants';
import type { AppNextFunction, AppRequest, AppResponse } from '@types';

const { responseTimeout } = config;

const responseDelay = (req: AppRequest, res: AppResponse, next: AppNextFunction) => {
  let timer: NodeJS.Timeout | null = null;

  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    next();
  }, responseTimeout);
};

export default responseDelay;
