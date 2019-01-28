import assert from 'assert';
import HttpConflict from '../../src/errors/HttpConflict';

describe('errors/HttpConflict.js', () => {
  describe('HttpConflict()', () => {
    it('inherits from Error', () => {
      const error = new HttpConflict();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 409', () => {
        const error = new HttpConflict();
        assert.equal(error.status, 409);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = 'd850cab4-e361-4435-a9a6-b13041aad0d8';
        const error = new HttpConflict(message);

        assert.equal(error.message, message);
      });
    });
  });
});
