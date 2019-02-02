const handleError = (error, response) => {
  const status = error.status || error.statusCode || 500;
  const code = error.code || 'Error';
  const message = error.message || 'Unknown error';

  response.send(status, { code, message });

  console.error(`[API] ⛔️ ${status} ${message}`);
};

export default handleError;
