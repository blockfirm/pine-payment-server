import { DatabaseClient, RedisClient } from './database';
import { LndService, NotificationService } from './services';

const createContext = (config) => {
  const database = new DatabaseClient(config.database);
  const redis = new RedisClient(config.redis);
  const notifications = new NotificationService(config, database);
  const lndGateway = new LndService(config.lightning.gateway, database, redis, notifications);

  return {
    database,
    redis,
    notifications,
    lndGateway,
    config
  };
};

export default createContext;
