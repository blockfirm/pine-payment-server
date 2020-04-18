import restify from 'restify';
import logger from './logger';
import verifySignature from './middlewares/verifySignature';
import setupRoutes from './setupRoutes';

export default class Server {
  constructor(config) {
    this.config = config;
    this.logger = logger.child({ scope: 'Server' });
    this.server = restify.createServer();

    this.server.use(restify.plugins.bodyParser({
      mapParams: true
    }));

    this.server.use(restify.plugins.authorizationParser());
    this.server.use(restify.plugins.queryParser());
    this.server.use(restify.plugins.throttle(config.api.rateLimit));
    this.server.use(verifySignature);

    this.server.on('after', this._onAfter.bind(this));

    setupRoutes(this.server);
  }

  // eslint-disable-next-line max-params
  _onAfter(request, response, route, error) {
    const { userId, method } = request;
    const { statusCode, statusMessage } = response;

    if (error) {
      return this.logger.error(
        `HTTP ${statusCode} ${statusMessage} ${method} ${request.url}: ${error.message}`, {
          scope: 'Api',
          route: route && route.path,
          status: statusCode,
          pineId: userId,
          method
        }
      );
    }

    let logFunction;

    if (statusCode < 200 || statusCode > 299) {
      logFunction = this.logger.error.bind(this.logger);
    } else {
      logFunction = this.logger.info.bind(this.logger);
    }

    logFunction(
      `HTTP ${statusCode} ${statusMessage} ${method} ${route.path}`, {
        scope: 'Api',
        route: route.path,
        status: statusCode,
        pineId: userId,
        method
      }
    );
  }

  start() {
    const { server, config } = this;

    return new Promise(resolve => {
      server.listen(config.api.port, () => {
        this.logger.info(`Pine Payment Server is listening at ${server.url}`);
        resolve();
      });
    });
  }

  stop() {
    return new Promise(resolve => {
      this.logger.info('Stopping Pine Payment Server...');
      this.server.close(resolve);
    });
  }
}
