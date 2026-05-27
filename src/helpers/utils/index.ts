export const isObject = (data: unknown): data is Record<string, unknown> => {
  return Boolean(typeof data === 'object' && !Array.isArray(data) && data !== null);
};
