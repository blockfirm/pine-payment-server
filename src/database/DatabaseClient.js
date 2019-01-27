import Sequelize from 'sequelize';
import models from './models';

export default class DatabaseClient {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    const config = this.config;

    if (!config || !config.host) {
      return;
    }

    this.sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      dialect: config.dialect
    });

    this.sequelize.authenticate()
      .then(() => {
        console.log('[DB] ✅ Connected');
        return this._defineModels();
      })
      .catch((error) => {
        console.error('[DB] 🔥 Error: ', error.message);
      });
  }

  _defineModels() {
    const syncPromises = Object.keys(models).map((modelName) => {
      const model = models[modelName];
      this[modelName] = this.sequelize.define(modelName, model);
      return this[modelName].sync();
    });

    return Promise.all(syncPromises).then(() => {
      console.log('[DB] ✅ Synced');
    });
  }
}
