import axios from 'axios';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Gets a new lightning invoice for a user.
 *
 * @param {number} amount - Amount in satoshis the invoice should be for.
 * @param {string} targetUserId - User ID to get lightning invoice for.
 * @param {Object} credentials - Credentials to use to authenticate the request.
 * @param {string} credentials.username - Username of the user making the request.
 * @param {string} credentials.mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves to the invoice.
 */
// eslint-disable-next-line max-params
const getLightningInvoice = (amount, targetUserId, credentials, apiPort) => {
  const { username, mnemonic } = credentials;
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const path = `/v1/users/${targetUserId}/lightning/invoices`;
  const url = `http://localhost:${apiPort}${path}`;
  const rawBody = JSON.stringify({ amount });

  const options = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthorizationHeader(`${username}@localhost`, path, rawBody, keyPair)
    },
    data: rawBody
  };

  return axios(options).then(response => response.data);
};

export default getLightningInvoice;
