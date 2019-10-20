import errors from 'restify-errors';

const validateRequest = (request) => {
  const { userId, id } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!id || typeof id !== 'string') {
    throw new errors.BadRequestError('The invoiceId parameter must be a string');
  }

  if (!request.userId && !request.address) {
    throw new errors.UnauthorizedError('Cannot get invoice without authentication');
  }

  if (request.userId && request.userId !== userId) {
    throw new errors.UnauthorizedError('The authenticated user is not authorized to get this invoice');
  }

  return true;
};

const getById = async function getById(request, response) {
  const { userId, id } = request.params;

  validateRequest(request);

  const user = await this.database.user.findOne({
    where: { id: userId }
  });

  if (!user) {
    throw new errors.NotFoundError('User not found');
  }

  const invoiceQuery = {
    where: { id, userId }
  };

  if (request.address) {
    invoiceQuery.where.payer = request.address;
  }

  const invoice = await this.database.invoice.findOne(invoiceQuery);

  if (!invoice) {
    throw new errors.NotFoundError('Invoice not found');
  }

  response.send({
    id: invoice.id,
    payer: invoice.payer,
    paid: invoice.paid,
    paidAmount: invoice.paidAmount,
    paidAt: invoice.paidAt,
    redeemed: invoice.redeemed,
    redeemedAt: invoice.redeemedAt
  });
};

export default getById;
