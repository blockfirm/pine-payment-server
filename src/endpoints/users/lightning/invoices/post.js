import errors from 'restify-errors';

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

const saveInvoice = (userId, payer, database) => {
  const invoiceQuery = {
    state: 'open',
    userId,
    payer
  };

  return database.invoice.create(invoiceQuery);
};

const getLndInvoice = (amount, userId, lndGateway) => {
  const memo = `user-id:${userId}`;
  return lndGateway.getInvoice(amount, memo);
};

const post = async function post(request, response) {
  const { database, lndGateway } = this;
  const { userId, amount } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.address) {
    throw new errors.UnauthorizedError('Cannot get invoice without authentication (external)');
  }

  if (!(parseInt(amount) > 0)) {
    throw new errors.BadRequestError(
      'The amount parameter must be a positive integer'
    );
  }

  const user = await getUser(userId, database);
  const contact = await getContact(request.address, user.id, database);
  const invoice = await getLndInvoice(amount, user.id, lndGateway);

  await saveInvoice(userId, contact.address, database);

  response.send({
    amount: invoice.value,
    paymentRequest: invoice.paymentRequest
  });
};

post.rateLimit = {
  burst: 5,
  rate: 0.5
};

export default post;
