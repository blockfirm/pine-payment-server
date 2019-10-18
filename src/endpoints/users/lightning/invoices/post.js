import errors from 'restify-errors';
import uuidv4 from 'uuid/v4';

import verify from '../../../../crypto/verify';
import { validatePaymentMessage } from '../../../../validators';

const getUser = async (userId, database) => {
  const userQuery = {
    where: { id: userId }
  };

  const user = await database.user.findOne(userQuery);

  if (!user) {
    throw new errors.NotFoundError('User not found');
  }

  return user;
};

const getContact = async (address, userId, database) => {
  const contactQuery = {
    where: { address, userId }
  };

  const contact = await database.contact.findOne(contactQuery);

  if (!contact) {
    throw new errors.UnauthorizedError('The authenticated user is not authorized to get an invoice for this user');
  }

  return contact;
};

/**
 * Gets a new lightning invoice from the lnd gateway node.
 *
 * @param {string} amount - Amount in satoshis of the invoice.
 * @param {string} userId - ID of the user the invoice will be paid to (payee).
 * @param {LndService} lndGateway - LndService instance for the lnd gateway node.
 *
 * return {Promise.Object} A promise that will resolve to the created invoice.
 */
const createLndInvoice = async (amount, userId, lndGateway) => {
  const id = uuidv4();
  const memo = `user-id:${userId};id:${id}`;
  const invoice = await lndGateway.getInvoice(amount, memo);

  return {
    id,
    value: invoice.value,
    paymentRequest: invoice.paymentRequest
  };
};

// eslint-disable-next-line max-statements
const post = async function post(request, response) {
  const { database, lndGateway } = this;

  const {
    userId,
    amount,
    paymentMessage,
    paymentMessageSignature
  } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.address) {
    throw new errors.UnauthorizedError('Cannot get invoice without authentication (external)');
  }

  if (!(parseInt(amount) > 0)) {
    throw new errors.BadRequestError('The amount parameter must be a positive integer');
  }

  try {
    validatePaymentMessage(paymentMessage);

    if (!verify(paymentMessage, paymentMessageSignature, request.externalUserId)) {
      throw new Error('Invalid payment message signature');
    }
  } catch (error) {
    throw new errors.BadRequestError(error.message);
  }

  const user = await getUser(userId, database);
  const contact = await getContact(request.address, user.id, database);
  const invoice = await createLndInvoice(amount, user.id, lndGateway);

  await database.invoice.create({
    id: invoice.id,
    payer: contact.address,
    userId,
    paymentMessage,
    paymentMessageSignature
  });

  response.send({
    id: invoice.id,
    amount: invoice.value,
    paymentRequest: invoice.paymentRequest
  });
};

post.rateLimit = {
  burst: 5,
  rate: 0.5
};

export default post;
