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
  },
  log: {
    level: 'info'
  }
};

export default config;
