import Server from './Server';
import config from './config';

const server = new Server(config);

server.start();
