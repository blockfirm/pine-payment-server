import events from 'events';
import Sequelize from 'sequelize';

import logger from '../logger';
import models from './models';
import defineRelations from './defineRelations';

export default class DatabaseClient extends events.EventEmitter {
  constructor(config) {
    super();

    this.connected = false;
    this.config = config;
    this.logger = logger.child({ scope: 'DatabaseClient' });

    this._tryConnect();
  }

  _tryConnect() {
    try {
      this._connect();
    } catch (error) {
      this.logger.error(`Unable to connect to database: ${error.message}`);
    }
  }

  _connect() {
    const config = this.config;

    if (!config || !config.host) {
      throw new Error('Missing database configuration');
    }

    this.sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      dialectOptions: config.dialectOptions,
      logging: false
    });

    this.sequelize.authenticate()
      .then(() => {
        this.logger.info(`Connected to database at ${config.host}`);
      })
      .then(() => {
        const definedModels = this._defineModels();
        defineRelations(definedModels);
        return this._sync();
      })
      .then(() => {
        this.logger.info('Database was successfully synced');
        this.connected = true;
        this.emit('connect');
      })
      .catch((error) => {
        this.logger.error(`Database error: ${error.message}`);
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

  _sync() {
    const orderedModels = [];

    /**
     * Create an ordered list of the models that takes foreign key constraints
     * into account so that dependencies are synced before dependents.
     */
    this.sequelize.modelManager.forEachModel((model) => {
      orderedModels.push(model);
    });

    /**
     * HACK: Instead of using async/await to run promises in serial,
     * reduce is being used to chain promises together. That's because
     * async/wait makes the unit tests crash even when using babel.
     */
    const syncs = orderedModels.map((model) => model.sync.bind(model));

    return syncs.reduce((prevSyncPromise, sync) => {
      return prevSyncPromise.then(sync);
    }, Promise.resolve());
  }
}
