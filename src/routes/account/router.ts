import { contactUs, getAccount, editAccount, changePassword } from './controller';
import type { RoutesMap } from '@types';

const account: RoutesMap = {
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
