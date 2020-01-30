import config from '../../config';

module.exports = {
  development: config.database,
  test: config.database,
  production: config.database
};

