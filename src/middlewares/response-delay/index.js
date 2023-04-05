import { config } from '@constants';

const { responseTimeout } = config;

const responseDelay = (req, res, next) => {
  let timer = null;

  timer && clearTimeout(timer);

  timer = setTimeout(() => {
    next();
  }, responseTimeout);
};

export default responseDelay;
