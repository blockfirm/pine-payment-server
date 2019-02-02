import errors from 'restify-errors';
import { HttpBadRequest, HttpNotFound } from '../../errors';

const patchById = function patchById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { id, displayName } = params;

    if (!id || typeof id !== 'string') {
      throw new HttpBadRequest('The id parameter must be a string');
    }

    if (request.userId !== id) {
      throw new errors.UnauthorizedError('The authorized user is not allowed to update this user');
    }

    if (displayName === undefined) {
      throw new HttpBadRequest('Nothing to update');
    }

    const query = {
      where: { id }
    };

    return this.database.user.findOne(query).then((user) => {
      if (!user) {
        throw new HttpNotFound('User not found');
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
