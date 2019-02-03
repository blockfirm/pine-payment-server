import errors from 'restify-errors';
import cleanDisplayName from '../../cleaners/cleanDisplayName';

const patchById = function patchById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const id = params.id;
    const displayName = cleanDisplayName(params.displayName);

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot update user without authentication');
    }

    if (request.userId !== id) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to update this user');
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
