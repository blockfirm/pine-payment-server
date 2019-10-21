import redis from 'redis';
import Redlock from 'redlock';

const RECONNECT_DELAY = 2000;

export default class RedisClient {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    const config = this.config;

    if (!config || !config.host) {
      return;
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
      console.log('[REDIS] Connected');
    });

    this.client.on('reconnecting', () => {
      console.log('[REDIS] Reconnecting...');
    });

    this.client.on('error', (error) => {
      console.error('[REDIS] Error:', error.message);
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
