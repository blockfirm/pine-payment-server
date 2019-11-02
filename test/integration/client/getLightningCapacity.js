import axios from 'axios';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Gets inbound lightning capacity for a user.
 *
 * @param {string} userId - ID of user to get inbound capacity for.
 * @param {Object} credentials - Credentials to use to authenticate the request.
 * @param {string} credentials.username - Username of the user making the request.
 * @param {string} credentials.mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves to the invoice.
 */
const getLightningCapacity = (userId, credentials, apiPort) => {
  const { mnemonic } = credentials;
  const username = `${credentials.username}@localhost`;
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const path = `/v1/users/${userId}/lightning/capacity`;
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

export default getLightningCapacity;
