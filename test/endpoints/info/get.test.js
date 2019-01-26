import assert from 'assert';
import sinon from 'sinon';

import * as infoEndpoints from '../../../src/endpoints/info';

describe('endpoints/info/get.js', () => {
  describe('#get(request, response)', () => {
    let fakeRequest;
    let fakeResponse;
    let fakeContext;

    beforeEach(() => {
      fakeRequest = {};

      fakeResponse = {
        send: sinon.spy()
      };

      fakeContext = {
        config: {
          server: {
            isOpenForRegistrations: true
          }
        }
      };
    });

    it('accepts two arguments', () => {
      const actual = infoEndpoints.get.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('returns a Promise', () => {
      const returnedPromise = infoEndpoints.get.call(fakeContext, fakeRequest, fakeResponse);
      assert(returnedPromise instanceof Promise);
    });

    it('calls response.send() with an object with isOpenForRegistrations as true', () => {
      const returnedPromise = infoEndpoints.get.call(fakeContext, fakeRequest, fakeResponse);

      return returnedPromise.then(() => {
        assert(fakeResponse.send.called);
        assert(fakeResponse.send.calledWithMatch({ isOpenForRegistrations: true }));
      });
    });
  });
});
