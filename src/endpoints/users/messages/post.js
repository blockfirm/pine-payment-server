import assert from 'assert';
import errors from 'restify-errors';
import verify from '../../../crypto/verify';

const getUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

const validateRequest = (request) => {
  const { userId } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.address) {
    throw new errors.UnauthorizedError('Cannot create message without authentication');
  }

  return true;
};

// eslint-disable-next-line max-statements
const validateMessage = (encryptedMessage) => {
  let ecies;

  if (!encryptedMessage || typeof encryptedMessage !== 'string') {
    throw new errors.BadRequestError('The encryptedMessage parameter must be a string');
  }

  try {
    const json = Buffer.from(encryptedMessage, 'base64').toString();
    ecies = JSON.parse(json);
    assert(ecies && typeof ecies === 'object');
  } catch (error) {
    throw new errors.BadRequestError('The encryptedMessage parameter must be a base64-encoded JSON object');
  }

  try {
    const iv = Buffer.from(ecies.iv, 'hex');
    assert(iv.length === 16);
  } catch (error) {
    throw new errors.BadRequestError('The iv parameter must be a hex-encoded buffer of 16 bytes');
  }

  try {
    const ephemPublicKey = Buffer.from(ecies.ephemPublicKey, 'hex');
    assert(ephemPublicKey.length === 65);
  } catch (error) {
    throw new errors.BadRequestError('The ephemPublicKey parameter must be a hex-encoded buffer of 65 bytes');
  }

  try {
    const ciphertext = Buffer.from(ecies.ciphertext, 'hex');
    assert(ciphertext.length > 0);
  } catch (error) {
    throw new errors.BadRequestError('The ciphertext parameter must be a hex-encoded buffer');
  }

  try {
    const mac = Buffer.from(ecies.mac, 'hex');
    assert(mac.length === 32);
  } catch (error) {
    throw new errors.BadRequestError('The mac parameter must be a hex-encoded buffer of 32 bytes');
  }

  return true;
};

const validateSignature = (encryptedMessage, signature, userId) => {
  if (!verify(encryptedMessage, signature, userId)) {
    throw new errors.BadRequestError('Invalid signature');
  }

  return true;
};

const createMessage = (message, database, notifications) => {
  return database.message.create(message).then((createdMessage) => {
    notifications.notify(message.userId, 'incomingPayment', {
      address: message.from
    });

    return createdMessage;
  });
};

const post = function post(request, response) {
  return Promise.resolve().then(() => {
    const { userId, encryptedMessage, signature } = request.params;

    validateRequest(request);
    validateMessage(encryptedMessage);
    validateSignature(encryptedMessage, signature, request.externalUserId);

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery)
      .then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        const contactQuery = {
          where: { address: request.address, userId }
        };

        return this.database.contact.findOne(contactQuery);
      })
      .then((contact) => {
        const newMessage = {
          from: request.address,
          userId,
          encryptedMessage,
          signature
        };

        if (!contact) {
          throw new errors.UnauthorizedError('You are not authorized to send messages to this user');
        }

        return createMessage(newMessage, this.database, this.notifications)
          .then((message) => {
            response.send(201, {
              id: message.id,
              from: message.from,
              userId: message.userId,
              encryptedMessage: message.encryptedMessage,
              signature: message.signature,
              createdAt: getUnixTimestamp(message.createdAt)
            });
          });
      });
  });
};

export default post;
