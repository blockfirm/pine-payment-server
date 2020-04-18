import proxyquire from 'proxyquire';
import assert from 'assert';
import sinon from 'sinon';

import winstonMock from './mocks/winston.mock';
import winstonDailyRotateFileMock from './mocks/winstonDailyRotateFile.mock';

const handleErrorSpy = sinon.spy();

const wrapEndpoint = proxyquire('../../src/wrapEndpoint', {
  'winston': { ...winstonMock, '@noCallThru': true, '@global': true },
  'winston-daily-rotate-file': winstonDailyRotateFileMock,
  './handleError': { default: handleErrorSpy }
}).default;

describe('wrapEndpoint.js', () => {
  beforeEach(() => {
    handleErrorSpy.resetHistory();
  });

  describe('wrapEndpoint(endpoint, thisArg)', () => {
    it('accepts two arguments', () => {
      const actual = wrapEndpoint.length;
      const expected = 2;

      assert.equal(actual, expected);
    });

    it('returns a function', () => {
      const fakeEndpoint = sinon.spy();
      const returnValue = wrapEndpoint(fakeEndpoint, null);

      assert.equal(typeof returnValue, 'function');
    });

    it('does not call the endpoint function', () => {
      const fakeEndpoint = sinon.spy();
      wrapEndpoint(fakeEndpoint, null);
      assert(fakeEndpoint.notCalled);
    });

    describe('when calling the returned function', () => {
      it('calls the endpoint function once', () => {
        const fakeEndpoint = sinon.spy();
        const returnedFunction = wrapEndpoint(fakeEndpoint, null);

        returnedFunction();

        assert(fakeEndpoint.calledOnce);
      });

      it('calls the endpoint with the first three arguments', () => {
        const fakeEndpoint = sinon.spy();
        const returnedFunction = wrapEndpoint(fakeEndpoint, null);

        const argument1 = '5b751111-34f4-47bc-b0d8-019ce7ad4fad';
        const argument2 = 'c727cd51-9ce0-403b-9d96-2f908808f46f';
        const argument3 = 'b41e0b26-39e8-4a90-a194-9945158497fa';

        returnedFunction(argument1, argument2, argument3);

        assert(fakeEndpoint.calledWithExactly(argument1, argument2, argument3));
      });

      it('calls the endpoint with "thisArg" as "this"', () => {
        const fakeEndpoint = sinon.spy();
        const fakeThisArg = {};
        const returnedFunction = wrapEndpoint(fakeEndpoint, fakeThisArg);

        returnedFunction();

        assert(fakeEndpoint.calledOnce);
        assert.strictEqual(fakeEndpoint.thisValues[0], fakeThisArg);
      });

      it('calls next() once the endpoint resolves', (done) => {
        const fakeNext = sinon.spy();
        const fakeEndpoint = () => Promise.resolve();
        const fakeThisArg = {};
        const returnedFunction = wrapEndpoint(fakeEndpoint, fakeThisArg);

        returnedFunction(null, null, fakeNext).then(() => {
          assert(fakeNext.calledOnce);
          done();
        });
      });

      describe('when the endpoint rejects the returned promise', () => {
        let fakeError;
        let fakeEndpoint;
        let fakeThisArg;
        let argument1;
        let argument2;
        let argument3;
        let returnedFunction;
        let returnedPromise;

        beforeEach(() => {
          fakeError = new Error('e4f9f76e-499e-44e1-bff6-7b93f0e76ec8');

          fakeEndpoint = sinon.spy(() => {
            return Promise.reject(fakeError);
          });

          fakeThisArg = {};
          returnedFunction = wrapEndpoint(fakeEndpoint, fakeThisArg);

          argument1 = '8d801fb6-6a54-4c58-99d3-abc7536e0a2f';
          argument2 = '6ba583d9-e776-470f-a262-6ae2cda4954d';
          argument3 = '7b60ada4-98b0-4eea-9ef1-268f5db69650';

          returnedPromise = returnedFunction(argument1, argument2, argument3);
        });

        it('calls handleError with the error and second argument from the returned function', () => {
          return returnedPromise.then(() => {
            assert(handleErrorSpy.calledOnce);
            assert(handleErrorSpy.calledWithExactly(fakeError, argument2, argument3));
          });
        });

        it('calls handleError with "thisArg" as "this"', () => {
          return returnedPromise.then(() => {
            assert.strictEqual(handleErrorSpy.thisValues[0], fakeThisArg);
          });
        });
      });

      describe('when the endpoint throws an error', () => {
        let fakeError;
        let fakeEndpoint;
        let fakeThisArg;
        let argument1;
        let argument2;
        let argument3;
        let returnedFunction;

        beforeEach(() => {
          fakeError = new Error('9bff49ae-05e7-46b6-a898-45b2a4a9e472');

          fakeEndpoint = sinon.spy(() => {
            throw fakeError;
          });

          fakeThisArg = {};
          returnedFunction = wrapEndpoint(fakeEndpoint, fakeThisArg);

          argument1 = '1c292d10-2465-4a26-abb5-d29a7cfd0d0a';
          argument2 = '4a6c630d-65ae-4c3f-918d-fe465b9ba80b';
          argument3 = '801e0b5c-ec73-4488-80dd-69ba6d481846';

          returnedFunction(argument1, argument2, argument3);
        });

        it('calls handleError with the error and second argument from the returned function', () => {
          assert(handleErrorSpy.calledOnce);
          assert(handleErrorSpy.calledWithExactly(fakeError, argument2, argument3));
        });

        it('calls handleError with "thisArg" as "this"', () => {
          assert.strictEqual(handleErrorSpy.thisValues[0], fakeThisArg);
        });
      });
    });
  });
});
