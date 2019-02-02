import errors from 'restify-errors';

const getById = function getById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError(
        'The id parameter must be a string'
      );
    }

    const query = {
      where: { id }
    };

    return this.database.user.findOne(query)
      .then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        response.send({
          id: user.id,
          publicKey: user.publicKey,
          username: user.username,
          displayName: user.displayName
        });
      });
  });
};

export default getById;
