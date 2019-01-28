import assert from 'assert';
import HttpNotFound from '../../src/errors/HttpNotFound';

describe('errors/HttpNotFound.js', () => {
  describe('HttpNotFound()', () => {
    it('inherits from Error', () => {
      const error = new HttpNotFound();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 404', () => {
        const error = new HttpNotFound();
        assert.equal(error.status, 404);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = 'c20a792d-63de-4a26-8e5b-293b76a1dd54';
        const error = new HttpNotFound(message);

        assert.equal(error.message, message);
      });
    });
  });
});
