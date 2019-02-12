import * as info from './info';
import * as users from './users';
import * as avatar from './users/avatar';
import * as deviceTokens from './users/deviceTokens';

const endpoints = {
  '/info': info,
  '/users': users,
  '/users/:id/avatar': avatar,
  '/users/:userId/device-tokens': deviceTokens
};

export default endpoints;
