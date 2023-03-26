export const isObject = (data) => {
  return Boolean(typeof data === 'object' && !Array.isArray(data) && data !== null);
};
