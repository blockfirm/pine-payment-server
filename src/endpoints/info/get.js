const get = function get(request, response) {
  return Promise.resolve().then(() => {
    response.send({
      isOpenForRegistrations: this.config.server.isOpenForRegistrations
    });
  });
};

export default get;
