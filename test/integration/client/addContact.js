import axios from 'axios';
import getUserIdFromPublicKey from '../../../src/crypto/getUserIdFromPublicKey';
import { getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

/**
 * Adds a contact to a user.
 *
 * @param {string} address - The contact's Pine address.
 * @param {string} mnemonic - Mnemonic to authenticate and sign the request with.
 * @param {number} apiPort - Port number the payment server is listening on at localhost.
 *
 * @returns {Promise} A promise that resolves to the added contact.
 */
const addContact = (address, mnemonic, apiPort) => {
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const publicKey = keyPair.publicKey;
  const userId = getUserIdFromPublicKey(publicKey);
  const path = `/v1/users/${userId}/contacts`;
  const url = `http://localhost:${apiPort}${path}`;

  const body = {
    address,
    waitingForContactRequest: false
  };

  const rawBody = JSON.stringify(body);

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

export default addContact;

