import axios from 'axios';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Gets an existing lightning invoice.
 *
 * @param {Object} invoice - Invoice details.
 * @param {string} invoice.id - ID of the invoice to get.
 * @param {string} invoice.payee - ID of the user the invoice will be paid to.
 * @param {Object} credentials - Credentials to use to authenticate the request.
 * @param {string} [credentials.userId] - ID of the user who owns the invoice.
 * @param {string} [credentials.username] - Username of the user who created the invoice.
 * @param {string} credentials.mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves to the invoice.
 */
const getLightningInvoice = (invoice, credentials, apiPort) => {
  const { mnemonic } = credentials;
  const username = credentials.userId || `${credentials.username}@localhost`;
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const path = `/v1/users/${invoice.payee}/lightning/invoices/${invoice.id}`;
  const url = `http://localhost:${apiPort}${path}`;

  const options = {
    url,
    method: 'GET',
    headers: {
      Authorization: getAuthorizationHeader(username, path, '', keyPair)
    }
  };

  return axios(options).then(response => response.data);
};

export default getLightningInvoice;
