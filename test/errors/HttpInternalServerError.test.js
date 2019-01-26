import assert from 'assert';
import HttpInternalServerError from '../../src/errors/HttpInternalServerError';

describe('errors/HttpInternalServerError.js', () => {
  describe('HttpInternalServerError()', () => {
    it('inherits from Error', () => {
      const error = new HttpInternalServerError();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 500', () => {
        const error = new HttpInternalServerError();
        assert.equal(error.status, 500);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = 'd98a3da5-3a14-4708-9616-3edce4ca1cef';
        const error = new HttpInternalServerError(message);

        assert.equal(error.message, message);
      });
    });
  });
});
