import errors from 'restify-errors';

const post = function post(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId } = params;

    const deviceToken = {
      ios: params.ios
    };

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot add device token without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to add a device token for this user');
    }

    if (!deviceToken.ios || typeof deviceToken.ios !== 'string') {
      throw new errors.BadRequestError('An iOS device token must be provided as a string');
    }

    if (deviceToken.ios.length > 255) {
      throw new errors.BadRequestError('iOS device token is too long');
    }

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery).then((user) => {
      if (!user) {
        throw new errors.NotFoundError('User not found');
      }

      const newDeviceToken = {
        ios: deviceToken.ios,
        userId
      };

      const deviceTokenQuery = {
        where: newDeviceToken,
        defaults: newDeviceToken
      };

      return this.database.deviceToken.findOrCreate(deviceTokenQuery).spread(({ id }) => {
        response.send({ id });
      });
    });
  });
};

export default post;
