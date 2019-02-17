import { DatabaseClient } from './database';
import { NotificationService } from './services';

const createContext = (config) => {
  const context = {
    database: new DatabaseClient(config.database),
    config
  };

  context.notifications = new NotificationService(config, context.database);

  return context;
};

export default createContext;
