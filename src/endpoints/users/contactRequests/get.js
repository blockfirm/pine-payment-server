import errors from 'restify-errors';

const get = function get(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot get contact requests without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to get contact requests for this user');
    }

    const contactRequestQuery = {
      where: { userId }
    };

    return this.database.contactRequest.findAll(contactRequestQuery)
      .then((contactRequests) => {
        return contactRequests.map((contactRequest) => ({
          id: contactRequest.id,
          from: contactRequest.from,
          createdAt: contactRequest.createdAt
        }));
      })
      .then((contactRequests) => {
        response.send(contactRequests);
      });
  });
};

export default get;
