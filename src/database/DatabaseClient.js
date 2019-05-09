import Sequelize from 'sequelize';
import models from './models';
import defineRelations from './defineRelations';

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
      dialect: config.dialect,
      logging: false
    });

    this.sequelize.authenticate()
      .then(() => {
        console.log('[DB] ✅ Connected');
      })
      .then(() => {
        const definedModels = this._defineModels();
        this._defineRelations(definedModels);
        return this._sync(definedModels);
      })
      .then(() => {
        console.log('[DB] ✅ Synced');
      })
      .catch((error) => {
        console.error('[DB] 🔥 Error: ', error.message);
      });
  }

  _defineModels() {
    const definedModels = {};

    Object.keys(models).forEach((name) => {
      const model = models[name];
      const definedModel = this.sequelize.define(name, model.fields, model.options);

      definedModels[name] = definedModel;
      this[name] = definedModel;
    });

    return definedModels;
  }

  _defineRelations(definedModels) {
    defineRelations(definedModels);
  }

  _sync(definedModels) {
    const syncPromises = Object.values(definedModels).map((definedModel) => {
      return definedModel.sync();
    });

    return Promise.all(syncPromises);
  }
}
