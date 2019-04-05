import * as info from './info';
import * as users from './users';
import * as usersAvatar from './users/avatar';
import * as usersDeviceTokens from './users/deviceTokens';
import * as usersContactRequests from './users/contactRequests';
import * as usersContacts from './users/contacts';
import * as usersAddress from './users/address';
import * as usersAddressUsed from './users/address/used';

const endpoints = {
  '/info': info,
  '/users': users,
  '/users/:userId/avatar': usersAvatar,
  '/users/:userId/device-tokens': usersDeviceTokens,
  '/users/:userId/contact-requests': usersContactRequests,
  '/users/:userId/contacts': usersContacts,
  '/users/:userId/address': usersAddress,
  '/users/:userId/address/used': usersAddressUsed
};

export default endpoints;
