import logger from './logger';

const handleError = (error, response, next) => {
  const status = error.statusCode || 500;
  let code = error.code || 'Error';
  let message = error.message || 'Unknown error';

  if (status === 500) {
    code = 'InternalServerError';
    message = 'An unexpected error occurred on the server';

    logger.error(`Unexpected server error (${status} ${code}): ${error.message}`, {
      scope: 'Api',
      status
    });
  }

  response.send(status, { code, message });
  next();
};

export default handleError;
