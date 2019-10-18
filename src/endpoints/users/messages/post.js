import errors from 'restify-errors';
import verify from '../../../crypto/verify';
import { validatePaymentMessage } from '../../../validators';

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

const validateMessage = (encryptedMessage) => {
  try {
    return validatePaymentMessage(encryptedMessage);
  } catch (error) {
    throw new errors.BadRequestError(error.message);
  }
};

const validateSignature = (encryptedMessage, signature, userId) => {
  if (!verify(encryptedMessage, signature, userId)) {
    throw new errors.BadRequestError('Invalid signature');
  }

  return true;
};

const createMessage = (message, database, notifications) => {
  return database.message.create(message).then((createdMessage) => {
    notifications.notify(message.userId, notifications.INCOMING_PAYMENT, {
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
