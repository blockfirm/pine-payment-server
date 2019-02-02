import errors from 'restify-errors';

const patchById = function patchById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { id, displayName } = params;

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    if (request.userId !== id) {
      throw new errors.UnauthorizedError('The authorized user is not allowed to update this user');
    }

    if (displayName === undefined) {
      throw new errors.BadRequestError('Nothing to update');
    }

    const query = {
      where: { id }
    };

    return this.database.user.findOne(query).then((user) => {
      if (!user) {
        throw new errors.NotFoundError('User not found');
      }

      user.displayName = displayName;

      return user.save({ fields: ['displayName'] }).then(() => {
        response.send({
          id: user.id,
          publicKey: user.publicKey,
          username: user.username,
          displayName: user.displayName
        });
      });
    });
  });
};

export default patchById;
