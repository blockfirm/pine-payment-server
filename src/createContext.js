import { DatabaseClient } from './database';
import { NotificationService } from './services';
import { Lnd } from './lnd';

const createContext = (config) => {
  const context = {
    database: new DatabaseClient(config.database),
    lndGateway: new Lnd(config.lightning.gateway),
    config
  };

  context.notifications = new NotificationService(config, context.database);

  return context;
};

export default createContext;
