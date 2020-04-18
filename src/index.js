import Server from './Server';
import config from './config';
import logger from './logger';

const server = new Server(config);

server.start();

const onExit = () => {
  logger.info('Gracefully shutting down...');

  server.stop()
    .then(() => {
      logger.info('Graceful shutdown completed');
      return 0;
    })
    .catch(error => {
      logger.error(`Graceful shutdown failed with error: ${error.message}`);
      return 1;
    })
    .then(code => {
      process.kill(code);
    });
};

process.stdin.resume();
process.on('SIGINT', onExit);
