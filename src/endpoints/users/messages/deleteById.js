import errors from 'restify-errors';

const deleteById = function deleteById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId, id } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError('The messageId parameter must be a string');
    }

    if (!request.userId && !request.address) {
      throw new errors.UnauthorizedError('Cannot delete message without authentication');
    }

    if (request.userId && request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to delete this message');
    }

    const messageQuery = {
      where: { id, userId }
    };

    return this.database.message.findOne(messageQuery).then((message) => {
      if (!message) {
        throw new errors.NotFoundError('Message not found');
      }

      if (request.address && request.address !== message.from) {
        throw new errors.UnauthorizedError('The authenticated user is not authorized to delete this message');
      }

      return this.database.message.destroy(messageQuery).then(() => {
        response.send(204);
      });
    });
  });
};

export default deleteById;
