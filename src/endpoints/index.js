import * as info from './info';
import * as users from './users';
import * as usersAvatar from './users/avatar';
import * as usersDeviceTokens from './users/deviceTokens';
import * as usersContactRequests from './users/contactRequests';
import * as usersContacts from './users/contacts';
import * as usersAddress from './users/address';
import * as usersAddressUsed from './users/address/used';
import * as usersMessages from './users/messages';
import * as usersLightningInvoices from './users/lightning/invoices';
import * as usersLightningInvoicesRedeem from './users/lightning/invoices/redeem';

const endpoints = {
  '/info': info,
  '/users': users,
  '/users/:userId/avatar': usersAvatar,
  '/users/:userId/device-tokens': usersDeviceTokens,
  '/users/:userId/contact-requests': usersContactRequests,
  '/users/:userId/contacts': usersContacts,
  '/users/:userId/address': usersAddress,
  '/users/:userId/address/used': usersAddressUsed,
  '/users/:userId/messages': usersMessages,
  '/users/:userId/lightning/invoices': usersLightningInvoices,
  '/users/:userId/lightning/invoices/:invoiceId/redeem': usersLightningInvoicesRedeem
};

export default endpoints;
