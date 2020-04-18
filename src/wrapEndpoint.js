import handleError from './handleError';

const wrapEndpoint = (endpoint, thisArg) => {
  return (request, response, next) => {
    try {
      return endpoint.call(thisArg, request, response, next)
        .then(() => next())
        .catch((error) => {
          handleError.call(thisArg, error, response, next);
        });
    } catch (error) {
      handleError.call(thisArg, error, response, next);
    }
  };
};

export default wrapEndpoint;
