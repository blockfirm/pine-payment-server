/* eslint-disable lines-around-comment */
const config = {
  server: {
    // Set to true to enable anyone to sign up for an account.
    isOpenForRegistrations: true,

    usernameMaxLength: 20,
    usernameMinLength: 1,

    // A list of reserved usernames as strings or RegExps.
    reservedUsernames: [
      'info',
      'help',
      'support',
      'abuse',
      'contact',
      'root',
      'webmaster',
      'admin',
      'administrator',
      'pay',
      'payments',
      'pine',
      'wallet',
      'donate',
      '.',
      '_'
    ]
  },
  api: {
    version: 'v1',
    port: 50428,
    rateLimit: {
      burst: 10,
      rate: 1,
      ip: true, // Set to true if directly exposed to the internet.
      xff: false, // Set to true if behind a reverse proxy or similar.
      maxKeys: 100000
    }
  },
  database: {
    dialect: 'postgres', // One of mysql, mariadb, sqlite, postgres, or mssql.
    host: 'localhost',
    database: 'pine_payment_server',
    username: 'pine',
    password: ''
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  },
  notifications: {
    webhook: 'https://notifications.pine.pm/v1/notifications',
    apiKey: '',
    queue: {
      attempts: 10,
      backoff: 60000 // Wait 1m before next attempt.
    }
  },
  bitcoin: {
    network: 'mainnet' // 'mainnet' or 'testnet'
  },
  lightning: {
    enabled: false,
    gateway: {
      rpcHost: 'localhost:10002',
      macaroon: '~/.lnd/data/chain/bitcoin/simnet/admin.macaroon'
    }
  }
};

export default config;
