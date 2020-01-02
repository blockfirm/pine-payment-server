import errors from 'restify-errors';

const LOCK_TTL = 60000 * 60; // 1h

const getInvoiceLockKey = (invoiceId) => (
  `pine:lightning:invoice:${invoiceId}:lock`
);

const validateRequest = (request, config) => {
  const { userId, invoiceId, paymentRequest } = request.params;

  if (!config.lightning.enabled) {
    throw new errors.NotImplementedError('Lightning is not supported by this server');
  }

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!invoiceId || typeof invoiceId !== 'string') {
    throw new errors.BadRequestError('The invoiceId parameter must be a string');
  }

  if (!paymentRequest || typeof paymentRequest !== 'string') {
    throw new errors.BadRequestError('The paymentRequest parameter must be a string');
  }

  if (!request.userId) {
    throw new errors.UnauthorizedError('Cannot redeem invoice without authentication');
  }

  if (request.userId !== userId) {
    throw new errors.UnauthorizedError('The authenticated user is not authorized to redeem this invoice');
  }

  return true;
};

const validatePaymentRequest = async (invoice, paymentRequest, lndGateway) => {
  const paymentDetails = await lndGateway.decodePaymentRequest(paymentRequest);

  if (paymentDetails.numSatoshis !== invoice.paidAmount) {
    throw new errors.BadRequestError('The payment request amount does not match invoice amount');
  }

  return true;
};

// eslint-disable-next-line max-statements
const post = async function post(request, response) {
  const { userId, invoiceId, paymentRequest } = request.params;

  validateRequest(request, this.config);

  const user = await this.database.user.findOne({
    where: { id: userId }
  });

  if (!user) {
    throw new errors.NotFoundError('User not found');
  }

  const invoice = await this.database.invoice.findOne({
    where: { id: invoiceId, userId }
  });

  if (!invoice) {
    throw new errors.NotFoundError('Invoice not found');
  }

  if (!invoice.paid) {
    throw new errors.ForbiddenError('Cannot redeem unpaid invoice');
  }

  if (invoice.redeemed) {
    throw new errors.ForbiddenError('Invoice has already been redeemed');
  }

  await validatePaymentRequest(invoice, paymentRequest, this.lndGateway);

  try {
    const lock = await this.redis.lock(getInvoiceLockKey(invoiceId), LOCK_TTL);

    await this.lndGateway.sendPayment(paymentRequest);
    invoice.redeemed = true;
    await invoice.save({ fields: ['redeemed'] });

    await lock.unlock();
  } catch (error) {
    if (error.name === 'LockError') {
      throw new errors.ConflictError('Invoice is already being redeemed');
    }

    throw error;
  }

  response.send(200);
};

export default post;
