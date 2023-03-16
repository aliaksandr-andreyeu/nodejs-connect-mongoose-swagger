import { signIn, signUp, refreshToken, signOut } from './controller';

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
  '/signout': {
    GET: {
      handler: signOut
    }
  }
};

export default auth;
