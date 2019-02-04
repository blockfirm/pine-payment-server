import errors from 'restify-errors';

const queryByUsername = (username, database) => {
  const query = {
    where: { username },
    include: [{
      model: database.avatar,
      attributes: ['image']
    }]
  };

  return database.user.findOne(query).then((user) => {
    if (!user) {
      throw new errors.NotFoundError('User not found');
    }

    return user.avatar;
  });
};

const queryByUserId = (userId, database) => {
  return database.avatar.findOne({
    where: { userId }
  });
};

const getByUsernameParam = (params) => {
  const byUsernameKey = Object.keys(params).find((key) => {
    return key.toLowerCase() === 'byusername';
  });

  return params[byUsernameKey];
};

const get = function get(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const byUsername = getByUsernameParam(request.query) === '1';
    const userId = params.id;
    let promise;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The id parameter must be a string');
    }

    if (byUsername) {
      promise = queryByUsername(userId, this.database);
    } else {
      promise = queryByUserId(userId, this.database);
    }

    return promise.then((avatar) => {
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
