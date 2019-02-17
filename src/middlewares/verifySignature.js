import axios from 'axios';
import errors from 'restify-errors';

import { parse as parseAddress, resolveBaseUrl } from '../address';
import verify from '../crypto/verify';

const userCache = {};

const getExternalUser = (address) => {
  const { username, hostname } = parseAddress(address);
  const usernameParam = encodeURIComponent(username);
  const baseUrl = resolveBaseUrl(hostname);
  const url = `${baseUrl}/v1/users?username=${usernameParam}`;

  if (userCache[address]) {
    return Promise.resolve(userCache[address]);
  }

  return axios.get(url)
    .then(({ data }) => {
      if (!Array.isArray(data)) {
        throw new Error('Unknown error when getting user');
      }

      const user = data[0];

      if (!user || !user.id || user.username !== username) {
        throw new Error('Unknown error when getting user');
      }

      userCache[address] = user;

      return user;
    })
    .catch((error) => {
      console.error('[AUTH] 🔥 Error getting external user:', error.message);
    });
};

const verifyExternalUser = (address, message, signature) => {
  return getExternalUser(address).then((user) => {
    if (!verify(message, signature, user.id)) {
      throw new Error('Verification failed');
    }
  });
};

const verifySignature = function verifySignature(request, _response, next) {
  if (!request.authorization || !request.authorization.basic) {
    return next();
  }

  const { username, password } = request.authorization.basic;
  const message = request.rawBody || username;

  if (username.indexOf('@') > -1) {
    return verifyExternalUser(username, message, password)
      .then(() => {
        request.address = username;
        next();
      })
      .catch((error) => {
        next(
          new errors.InvalidCredentialsError('Authentication failed')
        );
      });
  }

  try {
    if (!verify(message, password, username)) {
      throw new Error('Verification failed');
    }
  } catch (error) {
    return next(
      new errors.InvalidCredentialsError('Authentication failed')
    );
  }

  request.userId = username;

  return next();
};

export default verifySignature;
