import { contactUs } from './controller';

const account = {
  '/contact': {
    POST: {
      handler: contactUs,
      auth: true
    }
  }
};

export default account;
