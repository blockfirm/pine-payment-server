const handleError = (error, response) => {
  const status = error.statusCode || 500;
  let code = error.code || 'Error';
  let message = error.message || 'Unknown error';

  if (status === 500) {
    code = 'InternalServerError';
    message = 'An unexpected error occurred on the server';
  }

  response.send(status, { code, message });

  console.error(`[API] ERROR ${status} ${code}: ${error.message}`);
};

export default handleError;
