import bs58check from 'bs58check';
import Sequelize from 'sequelize';
import errors from 'restify-errors';

import generateAvatar from '../../avatar/generate';
import sha256 from '../../crypto/sha256';
import getUserIdFromPublicKey from '../../crypto/getUserIdFromPublicKey';
import cleanDisplayName from '../../cleaners/cleanDisplayName';

const verifyPublicKey = (publicKey, userId) => {
  const publicKeyBuffer = bs58check.decode(publicKey);
  const expectedUserId = getUserIdFromPublicKey(publicKeyBuffer);

  return userId === expectedUserId;
};

const post = function post(request, response) {
  const { publicKey, extendedPublicKey, username } = request.params;
  const displayName = cleanDisplayName(request.params.displayName);
  const id = request.userId;

  const user = {
    id,
    publicKey,
    extendedPublicKey,
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

  if (!id) {
    throw new errors.UnauthorizedError('Cannot create user without authentication');
  }

  try {
    if (!verifyPublicKey(publicKey, id)) {
      throw new Error('Public key does not match authenticated user ID');
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
      // Generate a placeholder avatar.
      return generateAvatar(id)
        .then((image) => {
          const checksum = sha256(image).toString('base64');

          const avatar = {
            userId: id,
            image,
            checksum
          };

          return this.database.avatar.create(avatar).then(() => {
            user.avatar = { checksum };
          });
        })
        .catch((error) => {
          /**
           * Suppress error. The user has been created anyhow
           * so don't let an avatar make the API call fail.
           */
          console.error('Error generating avatar:', error);
        });
    })
    .then(() => {
      response.send(201, user);
    });
};

export default post;
