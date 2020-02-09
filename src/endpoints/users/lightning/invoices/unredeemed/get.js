import errors from 'restify-errors';

const getUnixTimestamp = (date) => {
  if (date) {
    return Math.floor(date.getTime() / 1000);
  }
};

const validateRequest = (request, config) => {
  const { userId } = request.params;

  if (!config.lightning.enabled) {
    throw new errors.NotImplementedError('Lightning is not supported by this server');
  }

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.userId) {
    throw new errors.UnauthorizedError('Cannot get invoices without authentication');
  }

  if (request.userId !== userId) {
    throw new errors.UnauthorizedError('The authenticated user is not authorized to get invoices for this user');
  }

  return true;
};

const get = async function get(request, response) {
  const { userId } = request.params;

  validateRequest(request, this.config);

  const user = await this.database.user.findOne({
    where: { id: userId }
  });

  if (!user) {
    throw new errors.NotFoundError('User not found');
  }

  const invoiceQuery = {
    where: {
      userId,
      paid: true,
      redeemed: false
    }
  };

  return this.database.invoice.findAll(invoiceQuery)
    .then((invoices) => {
      return invoices.map((invoice) => ({
        id: invoice.id,
        payer: invoice.payer,
        paid: invoice.paid,
        paidAmount: invoice.paidAmount,
        paidAt: getUnixTimestamp(invoice.paidAt),
        redeemed: invoice.redeemed,
        redeemedAt: getUnixTimestamp(invoice.redeemedAt)
      }));
    })
    .then((invoices) => {
      response.send(invoices);
    });
};

export default get;
