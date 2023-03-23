import { getUsers, createUser, modifyUser, updateUser, deleteUser } from './controller';

const users = {
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
  }
};

export default users;
