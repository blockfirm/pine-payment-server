import errors from 'restify-errors';

const getUnixTimestamp = (date) => {
  return Math.floor(date.getTime() / 1000);
};

const validateRequest = (request) => {
  const { userId } = request.params;

  if (!userId || typeof userId !== 'string') {
    throw new errors.BadRequestError('The userId parameter must be a string');
  }

  if (!request.address) {
    throw new errors.UnauthorizedError('Cannot create contact request without authentication');
  }

  return true;
};

const createContactRequest = (contactRequest, database, notifications) => {
  const contactRequestQuery = {
    where: contactRequest,
    defaults: contactRequest
  };

  return database.contactRequest.findOrCreate(contactRequestQuery).spread((createdContactRequest, created) => {
    if (created) {
      notifications.notify(contactRequest.userId, 'contactRequest', {
        address: contactRequest.from
      });
    }

    return {
      id: createdContactRequest.id,
      from: createdContactRequest.from,
      createdAt: getUnixTimestamp(createdContactRequest.createdAt)
    };
  });
};

const acceptImmediately = (contact, contactRequest, notifications) => {
  contact.waitingForContactRequest = false;

  return contact.save({ fields: ['waitingForContactRequest'] })
    .then(() => {
      notifications.notify(contactRequest.userId, 'contactRequestAccepted', {
        address: contactRequest.from
      });
    });
};

const post = function post(request, response) {
  return Promise.resolve().then(() => {
    const { userId } = request.params;

    validateRequest(request);

    const userQuery = {
      where: { id: userId }
    };

    return this.database.user.findOne(userQuery)
      .then((user) => {
        if (!user) {
          throw new errors.NotFoundError('User not found');
        }

        const contactQuery = {
          where: { address: request.address, userId }
        };

        return this.database.contact.findOne(contactQuery);
      })
      .then((contact) => {
        const newContactRequest = {
          from: request.address,
          userId
        };

        if (!contact) {
          return createContactRequest(newContactRequest, this.database, this.notifications).then((contactRequest) => {
            response.send(201, contactRequest);
          });
        }

        if (contact.waitingForContactRequest) {
          return acceptImmediately(contact, newContactRequest, this.notifications).then(() => {
            response.send(202);
          });
        }

        throw new errors.ConflictError('User already has you as a contact');
      });
  });
};

export default post;
