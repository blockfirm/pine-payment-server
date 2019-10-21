import axios from 'axios';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Redeems a lightning invoice.
 *
 * @param {Object} invoice - Invoice details.
 * @param {string} invoice.id - ID of the invoice to redeem.
 * @param {string} paymentRequest - Payment request to redeem the invoice to.
 * @param {Object} credentials - Credentials to use to authenticate the request.
 * @param {string} credentials.userId - ID of the user that is redeeming the invoice.
 * @param {string} credentials.mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves when the invoice has been redeemed.
 */
// eslint-disable-next-line max-params
const redeemLightningInvoice = (invoice, paymentRequest, credentials, apiPort) => {
  const { userId, mnemonic } = credentials;
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const path = `/v1/users/${userId}/lightning/invoices/${invoice.id}/redeem`;
  const url = `http://localhost:${apiPort}${path}`;
  const rawBody = JSON.stringify({ paymentRequest });

  const options = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthorizationHeader(userId, path, rawBody, keyPair)
    },
    data: rawBody
  };

  return axios(options).then(response => response.data);
};

export default redeemLightningInvoice;
