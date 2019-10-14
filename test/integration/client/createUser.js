import bs58check from 'bs58check';
import axios from 'axios';

import getUserIdFromPublicKey from '../../../src/crypto/getUserIdFromPublicKey';
import { getAccountPublicKeyFromMnemonic, getKeyPairFromMnemonic, getAuthorizationHeader } from './crypto';

const BIP49_ACCOUNT_INDEX = 0;

/**
 * Tries to register a Pine address.
 *
 * @returns {Promise} A promise that resolves to the created user.
 */
const createUser = (username, mnemonic, apiPort) => {
  const keyPair = getKeyPairFromMnemonic(mnemonic);
  const publicKey = keyPair.publicKey;
  const extendedPublicKey = getAccountPublicKeyFromMnemonic(mnemonic, 'testnet', BIP49_ACCOUNT_INDEX);
  const userId = getUserIdFromPublicKey(publicKey);
  const path = '/v1/users';
  const url = `http://localhost:${apiPort}${path}`;

  const body = {
    publicKey: bs58check.encode(publicKey),
    extendedPublicKey,
    username
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

  return axios(options)
    .then(response => {
      return response.data;
    })
    .then(response => {
      if (response.id !== userId || response.publicKey !== body.publicKey) {
        throw new Error('Unknown error when creating user');
      }

      return response;
    });
};

export default createUser;

