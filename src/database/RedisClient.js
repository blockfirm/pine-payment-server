import redis from 'redis';
import Redlock from 'redlock';
import logger from '../logger';

const RECONNECT_DELAY = 2000;

export default class RedisClient {
  constructor(config) {
    this.config = config;
    this.logger = logger.child({ scope: 'RedisClient' });

    this._tryConnect();
  }

  _tryConnect() {
    try {
      this._connect();
    } catch (error) {
      this.logger.error(`Unable to connect to redis: ${error.message}`);
    }
  }

  _connect() {
    const config = this.config;

    if (!config || !config.host) {
      throw new Error('Missing redis configuration');
    }

    this.client = redis.createClient(
      config.port,
      config.host,
      {
        // eslint-disable-next-line camelcase
        retry_strategy: () => RECONNECT_DELAY // Try to reconnect after 2 seconds.
      }
    );

    this.client.on('connect', () => {
      this.logger.info(`Connected to redis at ${config.host}:${config.port}`);
    });

    this.client.on('reconnecting', () => {
      this.logger.warn('Reconnecting to redis...');
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis error: ${error.message}`);
    });

    this.redlock = new Redlock([this.client]);
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  expire(key, seconds) {
    return new Promise((resolve, reject) => {
      this.client.expire(key, seconds, (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  /**
   * Creates a lock.
   *
   * @param {string} key - Name of the lock.
   * @param {number} ttl - Time in milliseconds until the lock expires.
   *
   * @returns {Promise}
   */
  lock(key, ttl) {
    return this.redlock.lock(key, ttl);
  }
}
