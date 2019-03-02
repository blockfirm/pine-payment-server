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
      throw new errors.UnauthorizedError('Cannot get contacts without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to get contacts for this user');
    }

    const contactQuery = {
      where: { userId }
    };

    return this.database.contact.findAll(contactQuery)
      .then((contacts) => {
        return contacts.map((contact) => ({
          id: contact.id,
          address: contact.address,
          waitingForContactRequest: contact.waitingForContactRequest,
          createdAt: getUnixTimestamp(contact.createdAt)
        }));
      })
      .then((contact) => {
        response.send(contact);
      });
  });
};

export default get;
