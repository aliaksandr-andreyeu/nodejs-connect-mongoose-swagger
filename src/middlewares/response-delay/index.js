const responseDelay = (req, res, next) => {
  let timer = null;
  const delay = 3000;

  timer && clearTimeout(timer);

  timer = setTimeout(() => {
    next();
  }, delay);
};

export default responseDelay;
