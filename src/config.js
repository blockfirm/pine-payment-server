/* eslint-disable lines-around-comment */
const config = {
  server: {
    // Set to true to enable anyone to sign up for an account.
    isOpenForRegistrations: true
  },
  api: {
    version: 'v1',
    port: 8082,
    rateLimit: {
      burst: 10,
      rate: 1,
      ip: true, // Set to true if directly exposed to the internet.
      xff: false, // Set to true if behind a reverse proxy or similar.
      maxKeys: 100000
    }
  },
  database: {
    dialect: 'mysql', // One of mysql, sqlite, postgres, and mssql.
    host: 'localhost',
    database: 'pine_payment_server',
    username: 'pine',
    password: ''
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
};

export default config;
