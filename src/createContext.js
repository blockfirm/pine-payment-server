import { RedisClient } from './redis';

const createContext = (config) => {
  const context = {
    redis: new RedisClient(config.redis),
    config
  };

  return context;
};

export default createContext;
