import errors from 'restify-errors';

const post = function post(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.address) {
      throw new errors.UnauthorizedError('Cannot create contact request without authentication');
    }

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery).then((user) => {
      if (!user) {
        throw new errors.NotFoundError('User not found');
      }

      const newContactRequest = {
        from: request.address,
        userId
      };

      const contactRequestQuery = {
        where: newContactRequest,
        defaults: newContactRequest
      };

      return this.database.contactRequest.findOrCreate(contactRequestQuery).spread(({ id }, created) => {
        if (created) {
          this.notifications.notify(userId, 'contactRequest', {
            address: request.address
          });
        }

        response.send({ id });
      });
    });
  });
};

export default post;
