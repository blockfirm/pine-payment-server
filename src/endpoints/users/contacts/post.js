import errors from 'restify-errors';
import { parse as parseAddress } from '../../../address';

const getUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

const createContact = (contact, database) => {
  const { address, userId } = contact;

  return database.sequelize.transaction((transaction) => {
    const contactQuery = {
      where: contact,
      defaults: contact,
      transaction
    };

    return database.contact.findOrCreate(contactQuery).spread(({ id, createdAt }) => {
      const contactRequestQuery = {
        where: { from: address, userId },
        transaction
      };

      return database.contactRequest.destroy(contactRequestQuery).then(() => {
        return {
          id,
          address,
          createdAt: getUnixTimestamp(createdAt)
        };
      });
    });
  });
};

const post = function post(request, response) {
  const params = request.params;

  return Promise.resolve().then(() => {
    const { userId, address } = params;

    if (!userId || typeof userId !== 'string') {
      throw new errors.BadRequestError('The userId parameter must be a string');
    }

    if (!request.userId) {
      throw new errors.UnauthorizedError('Cannot add contact without authentication');
    }

    if (request.userId !== userId) {
      throw new errors.UnauthorizedError('The authenticated user is not authorized to add a contact for this user');
    }

    if (!address || typeof address !== 'string') {
      throw new errors.BadRequestError('An address must be provided as a string');
    }

    try {
      parseAddress(address);
    } catch (error) {
      throw new errors.BadRequestError('Address is invalid');
    }

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery)
      .then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        const newContact = {
          address,
          userId
        };

        return createContact(newContact, this.database);
      })
      .then((contact) => {
        response.send(contact);
      });
  });
};

export default post;
