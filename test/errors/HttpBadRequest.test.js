import assert from 'assert';
import HttpBadRequest from '../../src/errors/HttpBadRequest';

describe('errors/HttpBadRequest.js', () => {
  describe('HttpBadRequest()', () => {
    it('inherits from Error', () => {
      const error = new HttpBadRequest();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 400', () => {
        const error = new HttpBadRequest();
        assert.equal(error.status, 400);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = '4d040e8c-df51-4ebc-a595-12df6cb6888c';
        const error = new HttpBadRequest(message);

        assert.equal(error.message, message);
      });
    });
  });
});
