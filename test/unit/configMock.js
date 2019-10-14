const config = {
  api: {
    version: 'v1',
    rateLimit: {
      burst: 10,
      rate: 1,
      ip: true,
      xff: false,
      maxKeys: 100000
    }
  }
};

export default config;
