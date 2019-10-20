import errors from 'restify-errors';

const getUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

const get = function get(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot get messages without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to get messages for this user');
    }

    const messageQuery = {
      where: { userId }
    };

    return this.database.message.findAll(messageQuery)
      .then((messages) => {
        return messages.map((message) => ({
          id: message.id,
          from: message.from,
          encryptedMessage: message.encryptedMessage,
          signature: message.signature,
          invoiceId: message.invoiceId,
          createdAt: getUnixTimestamp(message.createdAt)
        }));
      })
      .then((messages) => {
        response.send(messages);
      });
  });
};

export default get;
