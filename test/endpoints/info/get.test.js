import assert from 'assert';
import sinon from 'sinon';

import * as infoEndpoints from '../../../src/endpoints/info';

describe('endpoints/info/get.js', () => {
  describe('#get(request, response)', () => {
    let fakeRequest;
    let fakeResponse;

    beforeEach(() => {
      fakeRequest = {};

      fakeResponse = {
        send: sinon.spy()
      };
    });

    it('accepts two arguments', () => {
      const actual = infoEndpoints.get.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('returns a Promise', () => {
      const returnedPromise = infoEndpoints.get(fakeRequest, fakeResponse);
      assert(returnedPromise instanceof Promise);
    });

    it('calls response.send() with an empty object', () => {
      const returnedPromise = infoEndpoints.get(fakeRequest, fakeResponse);

      return returnedPromise.then(() => {
        assert(fakeResponse.send.called);
        assert(fakeResponse.send.calledWithMatch({}));
      });
    });
  });
});
