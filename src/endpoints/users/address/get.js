import errors from 'restify-errors';
import getBitcoinAddress from '../../../crypto/getBitcoinAddress';

const getUser = (userId, database) => {
  const userQuery = {
    where: { id: userId }
  };

  return database.user.findOne(userQuery).then((user) => {
    if (!user) {
      throw new errors.NotFoundError('User not found');
    }

    return user;
  });
};

const getContact = (address, userId, database) => {
  const contactQuery = {
    where: { address, userId }
  };

  return database.contact.findOne(contactQuery).then((contact) => {
    if (!contact) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to get an address for this user');
    }

    return contact;
  });
};

const getAddressIndex = (user) => {
  const { addressIndex, addressIndexOffset } = user;
  let newAddressIndexOffset = addressIndexOffset + 1;

  if (newAddressIndexOffset > 19) {
    newAddressIndexOffset = 0;
  }

  user.addressIndexOffset = newAddressIndexOffset;

  return user.save({ fields: ['addressIndexOffset'] }).then(() => {
    return addressIndex + newAddressIndexOffset;
  });
};

const getAddress = (user, contact, network) => {
  if (contact.allocatedBitcoinAddress) {
    return Promise.resolve(contact.allocatedBitcoinAddress);
  }

  return getAddressIndex(user).then((addressIndex) => {
    const address = getBitcoinAddress(user.extendedPublicKey, network, addressIndex);

    contact.allocatedBitcoinAddress = address;

    return contact.save({ fields: ['allocatedBitcoinAddress'] }).then(() => {
      return address;
    });
  });
};

const get = function get(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.address) {
      throw new errors.UnauthorizedError('Cannot get address without authentication (external)');
    }

    return getUser(userId, this.database).then((user) => {
      return getContact(request.address, userId, this.database).then((contact) => {
        return getAddress(user, contact, this.config.bitcoin.network).then((address) => {
          response.send({ address });
        });
      });
    });
  });
};

export default get;
