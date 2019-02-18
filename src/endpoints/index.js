import * as info from './info';
import * as users from './users';
import * as avatar from './users/avatar';
import * as deviceTokens from './users/deviceTokens';
import * as contactRequests from './users/contactRequests';
import * as contacts from './users/contacts';

const endpoints = {
  '/info': info,
  '/users': users,
  '/users/:userId/avatar': avatar,
  '/users/:userId/device-tokens': deviceTokens,
  '/users/:userId/contact-requests': contactRequests,
  '/users/:userId/contacts': contacts
};

export default endpoints;
