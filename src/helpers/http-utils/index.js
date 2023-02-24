export const userError = (msg, code) => {
  const error = new Error(msg);
  error.code = code;
  return error;
};
