import * as info from './info';
import * as users from './users';
import * as avatar from './users/avatar';

const endpoints = {
  '/info': info,
  '/users': users,
  '/users/:id/avatar': avatar
};

export default endpoints;
