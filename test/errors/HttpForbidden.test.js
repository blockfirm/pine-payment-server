import assert from 'assert';
import HttpForbidden from '../../src/errors/HttpForbidden';

describe('errors/HttpForbidden.js', () => {
  describe('HttpForbidden()', () => {
    it('inherits from Error', () => {
      const error = new HttpForbidden();
      assert(error instanceof Error);
    });

    describe('#status', () => {
      it('equals 403', () => {
        const error = new HttpForbidden();
        assert.equal(error.status, 403);
      });
    });

    describe('#message', () => {
      it('equals the string passed to the constructor', () => {
        const message = 'ec904733-ab20-4bfc-9fee-a32ff367d863';
        const error = new HttpForbidden(message);

        assert.equal(error.message, message);
      });
    });
  });
});
