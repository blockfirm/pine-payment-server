import errors from 'restify-errors';
import { getChannelProperty } from '../../database/lightning';

const getById = function getById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError(
        'The userId parameter must be a string'
      );
    }

    const query = {
      where: { id },
      include: [{
        model: this.database.avatar,
        attributes: ['checksum']
      }]
    };

    return this.database.user.findOne(query)
      .then(async (user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        const lightningCapacity = await getChannelProperty(this.redis, user.id, 'capacity');

        response.send({
          id: user.id,
          publicKey: user.publicKey,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          hasLightningCapacity: lightningCapacity > 0
        });
      });
  });
};

export default getById;
