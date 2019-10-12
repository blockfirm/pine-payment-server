import restify from 'restify';
import verifySignature from './middlewares/verifySignature';
import setupRoutes from './setupRoutes';

export default class Server {
  constructor(config) {
    this.config = config;
    this.server = restify.createServer();

    this.server.use(restify.plugins.bodyParser({
      mapParams: true
    }));

    this.server.use(restify.plugins.authorizationParser());
    this.server.use(restify.plugins.queryParser());
    this.server.use(restify.plugins.throttle(config.api.rateLimit));
    this.server.use(verifySignature);

    setupRoutes(this.server);
  }

  start() {
    const { server, config } = this;

    return new Promise(resolve => {
      server.listen(config.api.port, () => {
        console.log('Pine Payment Server is listening at %s', server.url);
        resolve();
      });
    });
  }

  stop() {
    return new Promise(resolve => {
      this.server.close(resolve);
    });
  }
}
