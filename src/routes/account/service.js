import { userError, getResponse } from '@helpers';

const contactUs = async (req) => {
  const body = req.body;

  throw userError('This message has not been sent', 400);

  return getResponse(body);
};

const accountService = {
  contactUs
};
export default accountService;
