import assert from 'assert';
import sinon from 'sinon';
import handleError from '../src/handleError';

describe('handleError.js', () => {
  describe('handleError(error, response)', () => {
    let fakeResponse;

    beforeEach(() => {
      fakeResponse = {
        status: sinon.spy(),
        send: sinon.spy()
      };

      sinon.stub(console, 'error');
    });

    afterEach(() => {
      console.error.restore();
    });

    it('accepts two arguments', () => {
      const actual = handleError.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('logs the error status and message using console.error()', () => {
      const errorStatus = 404;
      const errorMessage = 'bacd8b78-cb98-43e0-8600-63bc6e88a8af';
      const error = new Error(errorMessage);

      error.status = errorStatus;
      handleError(error, fakeResponse);

      const firstArgument = console.error.getCall(0).args[0];

      assert(console.error.calledOnce);
      assert(firstArgument.indexOf(errorStatus) > -1);
      assert(firstArgument.indexOf(errorMessage) > -1);
    });

    it('calls response.send() with the error status and the error message wrapped in an object', () => {
      const errorStatus = 404;
      const errorMessage = '254db1ff-ca36-41e8-b7c3-a96ec2d944d9';
      const error = new Error(errorMessage);

      error.status = errorStatus;

      handleError(error, fakeResponse);

      assert(fakeResponse.send.calledOnce);
      assert(fakeResponse.send.calledWith(errorStatus, { error: errorMessage }));
    });

    describe('when error.status is undefined', () => {
      it('defaults to 500', () => {
        const errorMessage = '73428bc4-e34e-4e67-8acf-b92c866e7f9c';
        const error = new Error(errorMessage);

        handleError(error, fakeResponse);

        assert(fakeResponse.send.calledOnce);
        assert(fakeResponse.send.calledWith(500));
      });
    });

    describe('when error.message is undefined', () => {
      it('defaults to "Unknown error"', () => {
        const error = new Error();

        handleError(error, fakeResponse);

        assert(fakeResponse.send.calledOnce);
        assert(fakeResponse.send.calledWith(500, { error: 'Unknown error' }));
      });
    });
  });
});
