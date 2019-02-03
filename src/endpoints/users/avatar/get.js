import errors from 'restify-errors';

const get = function get(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const userId = params.id;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    const query = {
      where: { userId }
    };

    return this.database.avatar.findOne(query).then((avatar) => {
      if (!avatar) {
        throw new errors.NotFoundError('Avatar not found');
      }

      response.header('Content-Type', 'image/jpeg');
      response.write(avatar.image);
      response.end();
    });
  });
};

export default get;
