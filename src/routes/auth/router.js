import { signIn, signUp, refreshToken, resetPassword, signOut } from './controller';

const auth = {
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
  '/signout': {
    GET: {
      handler: signOut,
      auth: true
    }
  }
};

export default auth;
