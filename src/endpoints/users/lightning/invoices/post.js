import errors from 'restify-errors';
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
  const lndInvoice = await lndGateway.getInvoice(amount);

  const dbInvoice = await database.invoice.create({
    preimageHash: lndInvoice.rHash.toString('hex'),
    payer: contact.address,
    userId,
    paymentMessage,
    paymentMessageSignature
  });

  response.send({
    id: dbInvoice.id,
    amount: lndInvoice.value,
    paymentRequest: lndInvoice.paymentRequest
  });
};

post.rateLimit = {
  burst: 5,
  rate: 0.5
};

export default post;
