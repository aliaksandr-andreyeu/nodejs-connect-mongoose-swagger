import { signIn, signUp, refreshToken, resetPassword, resetPasswordConfirm, signOut } from './controller';
import type { RoutesMap } from '@types';

const auth: RoutesMap = {
  '/signin': {
    POST: {
      handler: signIn
    }
  },
  '/signup': {
    POST: {
      handler: signUp
    }
  },
  '/refresh-token': {
    GET: {
      handler: refreshToken
    }
  },
  '/reset-password': {
    POST: {
      handler: resetPassword
    }
  },
  '/reset-password/confirm': {
    POST: {
      handler: resetPasswordConfirm
    }
  },
  '/signout': {
    GET: {
      handler: signOut,
      auth: true
    }
  }
};

export default auth;
