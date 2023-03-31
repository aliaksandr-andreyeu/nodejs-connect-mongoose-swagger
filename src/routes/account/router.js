import { contactUs, getAccount, editAccount, changePassword } from './controller';

const account = {
  '/contact': {
    POST: {
      handler: contactUs,
      auth: true
    }
  },
  '/account': {
    GET: {
      handler: getAccount,
      auth: true
    },
    PUT: {
      handler: editAccount,
      auth: true
    }
  },
  '/change-password': {
    POST: {
      handler: changePassword,
      auth: true
    }
  }
};

export default account;
