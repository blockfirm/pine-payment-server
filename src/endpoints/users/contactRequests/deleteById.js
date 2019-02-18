import errors from 'restify-errors';

const deleteById = function deleteById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId, id } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError('The contactRequestId parameter must be a string');
    }

    if (!request.userId && !request.address) {
      throw new errors.UnauthorizedError('Cannot delete contact request without authentication');
    }

    if (request.userId && request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to delete this contact request');
    }

    const contactRequestQuery = {
      where: { id, userId }
    };

    return this.database.contactRequest.findOne(contactRequestQuery).then((contactRequest) => {
      if (!contactRequest) {
        throw new errors.NotFoundError('Contact request not found');
      }

      if (request.address && request.address !== contactRequest.from) {
        throw new errors.UnauthorizedError('The authenticated user is not authorized to delete this contact request');
      }

      return this.database.contactRequest.destroy(contactRequestQuery).then(() => {
        response.send(200);
      });
    });
  });
};

export default deleteById;
