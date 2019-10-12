import Server from './Server';
import config from './config';

const server = new Server(config);

server.start();

const onExit = () => {
  console.log('Gracefully shutting down...');

  server.stop()
    .then(() => {
      console.log('Graceful shutdown completed');
      return 0;
    })
    .catch(error => {
      console.log('Graceful shutdown failed with error:', error.message);
      return 1;
    })
    .then(code => {
      process.kill(code);
    });
};

process.stdin.resume();
process.on('SIGINT', onExit);
