import axios from 'axios';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Creates a new lightning invoice for a user.
 *
 * @param {Object} invoice - Invoice details.
 * @param {string} invoice.amount - Amount in satoshis of the invoice.
 * @param {string} invoice.payee - ID of the user the invoice will be paid to.
 * @param {string} invoice.paymentMessage - Encrypted payment message to be sent to
 *                 the payee once the invoice has been paid.
 * @param {string} invoice.paymentMessageSignature - Signature of the message signed by the payer.
 * @param {Object} credentials - Credentials to use to authenticate the request.
 * @param {string} credentials.username - Username of the user requesting the invoice.
 * @param {string} credentials.mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves to the invoice.
 */
const createLightningInvoice = (invoice, credentials, apiPort) => {
  const { username, mnemonic } = credentials;
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const path = `/v1/users/${invoice.payee}/lightning/invoices`;
  const url = `http://localhost:${apiPort}${path}`;
  const rawBody = JSON.stringify(invoice);

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

export default createLightningInvoice;
