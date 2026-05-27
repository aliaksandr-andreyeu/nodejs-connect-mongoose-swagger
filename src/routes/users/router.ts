import { getUsers, createUser, modifyUser, updateUser, deleteUser } from './controller';
import type { RoutesMap } from '@types';

const users: RoutesMap = {
  '/users': {
    GET: {
      handler: getUsers,
      auth: true
    },
    POST: {
      handler: createUser,
      auth: true
    },
    PUT: {
      handler: modifyUser,
      auth: true
    },
    PATCH: {
      handler: updateUser,
      auth: true
    },
    DELETE: {
      handler: deleteUser,
      auth: true
    }
  },
  '/users/:id': {
    GET: {
      handler: getUsers,
      auth: true
    },
    PUT: {
      handler: modifyUser,
      auth: true
    },
    PATCH: {
      handler: updateUser,
      auth: true
    },
    DELETE: {
      handler: deleteUser,
      auth: true
    }
  }
};

export default users;
