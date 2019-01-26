import restify from 'restify';
import config from './config';
import setupRoutes from './setupRoutes';

const server = restify.createServer();

server.use(restify.plugins.bodyParser({
  mapParams: true
}));

server.use(restify.plugins.queryParser());
server.use(restify.plugins.throttle(config.api.rateLimit));

setupRoutes(server);

server.listen(config.api.port, () => {
  console.log('Pine Payment Server is listening at %s', server.url);
});
