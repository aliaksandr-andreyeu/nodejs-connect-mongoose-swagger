import { getUsers, createUser, modifyUser, updateUser, deleteUser } from './controller';

const users = {
  '/users': {
    GET: getUsers,
    POST: createUser,
    PUT: modifyUser,
    PATCH: updateUser,
    DELETE: deleteUser
  }
};

export default users;
