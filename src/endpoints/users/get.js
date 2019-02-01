import { HttpBadRequest } from '../../errors';

const getUsernamesFromParam = (usernameParam) => {
  let usernames = usernameParam.split(',');

  usernames = usernames
    .map((username) => username.trim())
    .filter((username) => username);

  return usernames;
};

const get = function get(request, response) {
  const params = request.query;

  return Promise.resolve().then(() => {
    if (!params.username || typeof params.username !== 'string') {
      throw new HttpBadRequest(
        'The username field must be a string of comma-separated usernames'
      );
    }

    const usernames = getUsernamesFromParam(params.username);

    if (usernames.length === 0) {
      throw new HttpBadRequest(
        'At least one username must be provided'
      );
    }

    if (usernames.length > 50) {
      throw new HttpBadRequest(
        'Maximum 50 usernames are allowed per request'
      );
    }

    const query = {
      where: { username: usernames }
    };

    return this.database.user.findAll(query)
      .then((users) => {
        return users.map((user) => ({
          id: user.id,
          publicKey: user.publicKey,
          username: user.username,
          displayName: user.displayName
        }));
      })
      .then((users) => {
        response.send(users);
      });
  });
};

export default get;
