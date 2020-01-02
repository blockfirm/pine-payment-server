const get = function get(request, response) {
  return Promise.resolve().then(() => {
    const { config } = this;

    response.send({
      isOpenForRegistrations: config.server.isOpenForRegistrations,
      network: config.bitcoin.network
    });
  });
};

export default get;
