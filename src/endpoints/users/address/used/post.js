import Sequelize from 'sequelize';
import errors from 'restify-errors';

const validateRequest = (request) => {
  const { userId, addresses } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!Array.isArray(addresses)) {
    throw new errors.BadRequestError('The addresses parameter must be an array');
  }

  if (addresses.length === 0) {
    throw new errors.BadRequestError('The addresses array cannot be empty');
  }

  addresses.forEach((address) => {
    if (!address || typeof address !== 'string') {
      throw new errors.BadRequestError('All addresses must be non-empty strings');
    }
  });

  if (!request.userId) {
    throw new errors.UnauthorizedError('Cannot update used addresses without authentication');
  }

  return true;
};

const post = function post(request, response) {
  return Promise.resolve().then(() => {
    const { userId, addresses } = request.params;

    validateRequest(request);

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery)
      .then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        const contactQuery = {
          where: {
            userId,
            allocatedBitcoinAddress: {
              [Sequelize.Op.in]: addresses
            }
          }
        };

        return this.database.contact.update({ allocatedBitcoinAddress: null }, contactQuery);
      })
      .then(() => {
        response.send(200);
      });
  });
};

export default post;
