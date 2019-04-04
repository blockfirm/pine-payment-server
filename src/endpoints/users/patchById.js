import errors from 'restify-errors';
import cleanDisplayName from '../../cleaners/cleanDisplayName';

const getNewAddressIndexOffset = (newAddressIndex, oldAddressIndex, oldAddressIndexOffset) => {
  if (newAddressIndex < oldAddressIndex + oldAddressIndexOffset) {
    return oldAddressIndex + oldAddressIndexOffset - newAddressIndex;
  }

  return 0;
};

const patchById = function patchById(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { id, addressIndex } = params;
    const displayName = cleanDisplayName(params.displayName);

    if (!id || typeof id !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot update user without authentication');
    }

    if (request.userId !== id) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to update this user');
    }

    if (displayName === undefined && addressIndex === undefined) {
      throw new errors.BadRequestError('Nothing to update');
    }

    const query = {
      where: { id }
    };

    return this.database.user.findOne(query).then((user) => {
      const fieldsToUpdate = [];

      if (!user) {
        throw new errors.NotFoundError('User not found');
      }

      if (displayName !== undefined) {
        user.displayName = displayName;
        fieldsToUpdate.push('displayName');
      }

      if (addressIndex !== undefined) {
        user.addressIndexOffset = getNewAddressIndexOffset(
          addressIndex,
          user.addressIndex,
          user.addressIndexOffset
        );

        user.addressIndex = addressIndex;

        fieldsToUpdate.push('addressIndex');
        fieldsToUpdate.push('addressIndexOffset');
      }

      return user.save({ fields: fieldsToUpdate }).then(() => {
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
