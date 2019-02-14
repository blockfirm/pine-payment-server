import { DatabaseClient } from './database';

const createContext = (config) => {
  const context = {
    database: new DatabaseClient(config.database),
    config
  };

  return context;
};

export default createContext;
