import restify from 'restify';
import config from './config';
import createContext from './createContext';
import wrapEndpoint from './wrapEndpoint';
import rootEndpoints from './endpoints';

const getFullPath = (namespace, path) => {
  return `/${config.api.version}${namespace}${path}`;
};

const getRateLimiter = (handler) => {
  if (!handler.rateLimit) {
    return;
  }

  return restify.plugins.throttle({
    ...config.api.rateLimit,
    ...handler.rateLimit
  });
};

// eslint-disable-next-line max-params
const createRoutesForEndpoints = (server, namespace, endpoints, context) => {
  Object.keys(endpoints).forEach((path) => {
    const handlers = endpoints[path];

    if (Object.keys(handlers)[0].indexOf('/') === 0) {
      // This route contains its own set of endpoints.
      return createRoutesForEndpoints(server, namespace + path, handlers, context);
    }

    Object.keys(handlers).forEach((method) => {
      const handler = handlers[method];
      const rateLimiter = getRateLimiter(handler);
      let serverMethod = method;
      let serverPath = path;

      switch (method) {
        case 'getById':
          serverMethod = 'get';
          serverPath = `${path}/:id`;
          break;

        case 'deleteById':
          serverMethod = 'del';
          serverPath = `${path}/:id`;
          break;

        case 'patchById':
          serverMethod = 'patch';
          serverPath = `${path}/:id`;
          break;
      }

      if (rateLimiter) {
        server[serverMethod](
          getFullPath(namespace, serverPath),
          rateLimiter,
          wrapEndpoint(handler, context)
        );
      } else {
        server[serverMethod](
          getFullPath(namespace, serverPath),
          wrapEndpoint(handler, context)
        );
      }
    });
  });
};

const setupRoutes = (server) => {
  const context = createContext(config);
  createRoutesForEndpoints(server, '', rootEndpoints, context);
};

export default setupRoutes;
