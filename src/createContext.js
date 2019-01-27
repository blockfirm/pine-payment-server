import { DatabaseClient } from './database';
import { RedisClient } from './redis';

const createContext = (config) => {
  const context = {
    database: new DatabaseClient(config.database),
    redis: new RedisClient(config.redis),
    config
  };

  return context;
};

export default createContext;
