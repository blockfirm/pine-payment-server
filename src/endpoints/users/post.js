import bs58check from 'bs58check';
import Sequelize from 'sequelize';
import errors from 'restify-errors';

import getUserIdFromPublicKey from '../../crypto/getUserIdFromPublicKey';
import verifySignature from '../../crypto/verify';

const verifyPublicKey = (publicKey, userId) => {
  const publicKeyBuffer = bs58check.decode(publicKey);
  const expectedUserId = getUserIdFromPublicKey(publicKeyBuffer);

  return userId === expectedUserId;
};

const post = function post(request, response) {
  const { id, publicKey, username, displayName, signature } = request.params;

  const user = {
    id,
    publicKey,
    username,
    displayName
  };

  const query = {
    where: {
      [Sequelize.Op.or]: [{ id }, { username }]
    }
  };

  if (!this.config.server.isOpenForRegistrations) {
    throw new errors.ForbiddenError('Server is not open for registrations');
  }

  try {
    if (!verifySignature(username, signature, id)) {
      throw new Error('Verification failed');
    }
  } catch (error) {
    throw new errors.BadRequestError(`Invalid signature: ${error.message}`);
  }

  try {
    if (!verifyPublicKey(publicKey, id)) {
      throw new Error('Public key does not match user ID');
    }
  } catch (error) {
    throw new errors.BadRequestError(`Invalid public key: ${error.message}`);
  }

  return this.database.user.findOne(query)
    .then((existingUser) => {
      if (existingUser) {
        if (user.id === existingUser.id) {
          throw new errors.ConflictError('A user with the same ID already exists');
        }

        if (user.username === existingUser.username) {
          throw new errors.ConflictError('A user with the same username already exists');
        }
      }

      return this.database.user.create(user).catch((error) => {
        throw new errors.BadRequestError(error.message);
      });
    })
    .then(() => {
      response.send(user);
    });
};

export default post;
