const handleError = (error, response) => {
  const status = error.status || 500;
  const message = error.message || 'Unknown error';

  response.send(status, { error: message });

  console.error(`[API] ⛔️ ${status} ${message}`);
};

export default handleError;
