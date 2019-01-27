import { HttpBadRequest, HttpNotFound } from '../../errors';

const getById = function getById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const username = params.id;

    if (!username || typeof username !== 'string') {
      throw new HttpBadRequest(
        'The username parameter must be a string'
      );
    }

    const query = {
      where: { username },
      limit: 1
    };

    return this.database.user.findAll(query)
      .then((users) => {
        const user = users[0];

        if (!user) {
          throw new HttpNotFound('User not found');
        }

        response.send({
          publicKey: user.publicKey,
          username: user.username,
          displayName: user.displayName
        });
      });
  });
};

export default getById;
