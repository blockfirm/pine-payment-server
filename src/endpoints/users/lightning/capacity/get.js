import errors from 'restify-errors';

const validateRequest = (request, config) => {
  const { userId } = request.params;

  if (!config.lightning.enabled) {
    throw new errors.NotImplementedError('Lightning is not supported by this server');
  }

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.address) {
    throw new errors.UnauthorizedError('Cannot get lightning capacity for user without authentication');
  }

  return true;
};

const getUser = async (userId, database) => {
  const user = await database.user.findOne({
    where: { id: userId }
  });

  if (!user) {
    throw new errors.NotFoundError('User not found');
  }

  return user;
};

const getContact = async (address, userId, database) => {
  const contact = await database.contact.findOne({
    where: { address, userId }
  });

  if (!contact) {
    throw new errors.UnauthorizedError('The authenticated user is not authorized to get lightning capacity for this user');
  }

  return contact;
};

const getUnredeemedInvoices = async (userId, database) => {
  return await database.invoice.findAll({
    where: { userId, redeemed: false }
  });
};

const get = async function get(request, response) {
  const { database, redis, config } = this;
  const { userId } = request.params;

  validateRequest(request, config);

  const user = await getUser(userId, database);

  await getContact(request.address, user.id, database);

  const invoices = await getUnredeemedInvoices(user.id, database);

  const pendingRedemption = invoices.reduce((sum, invoice) => {
    return sum + invoice.paidAmount;
  }, 0);

  const remoteBalance = await redis.get(`pine:lightning:user:${user.id}:channel:remote-balance`);
  const inbound = BigInt(remoteBalance || 0) - BigInt(pendingRedemption);

  response.send({
    inbound: inbound > 0 ? inbound.toString() : '0'
  });
};

export default get;
