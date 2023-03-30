import { httpStatusMessage, jsonHeader, encoding } from '@constants';
import accountService from './service';

export const contactUs = async (req, res, next) => {
  try {
    const { response } = await accountService.contactUs(req);

    res.writeHead(200, httpStatusMessage[200], jsonHeader);
    res.end(JSON.stringify(response), encoding);
  } catch (error) {
    next(error);
  }
};
