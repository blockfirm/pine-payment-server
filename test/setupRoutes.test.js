import proxyquire from 'proxyquire';
import assert from 'assert';
import sinon from 'sinon';

const wrapEndpointSpy = sinon.spy();

const setupRoutes = proxyquire('../src/setupRoutes', {
  './createContext': { default: () => ({}) },
  './wrapEndpoint': { default: wrapEndpointSpy }
}).default;

describe('setupRoutes.js', () => {
  beforeEach(() => {
    wrapEndpointSpy.resetHistory();
  });

  describe('setupRoutes(server)', () => {
    let fakeServer;

    beforeEach(() => {
      fakeServer = {
        get: sinon.spy(),
        post: sinon.spy(),
        del: sinon.spy()
      };
    });

    it('registers the route GET /v1/info', () => {
      setupRoutes(fakeServer);

      assert(fakeServer.get.called);
      assert(fakeServer.get.calledWithMatch('/v1/info'));
    });

    it('wraps each endpoint with wrapEndpoint()', () => {
      setupRoutes(fakeServer);
      assert.equal(wrapEndpointSpy.callCount, 1);
    });
  });
});
