const get = function get(request, response) {
  return Promise.resolve().then(() => {
    response.send({});
  });
};

export default get;
