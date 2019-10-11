import assert from 'assert';
import verify from '../../../src/crypto/verify';

describe('verify', () => {
  it('is a function', () => {
    assert.equal(typeof verify, 'function');
  });

  it('accepts three arguments', () => {
    assert.equal(verify.length, 3);
  });

  describe('when the signature was made for the correct message by the correct user', () => {
    it('returns true', () => {
      const userId = 'BHxzwmPZg34J5LYCA1xn7oZ2ryFBCd7rP';
      const message = 'ab81613f-68ee-428c-b667-fcdad51cd89f';
      const signature = 'H6psFx/e8JaPgNlrjhCt4aUYUu3d4uV+dxlOQb8WctghBXXwISWmicEQW8dPrO8ZLyLjsaGXDEzvSo18rSrFjTY=';
      const verified = verify(message, signature, userId);

      assert(verified);
    });
  });

  describe('when the signature was made for the correct message but by another user', () => {
    it('returns false', () => {
      const userId = '4KA4gBceiBRgNRMPtWtH5kGYg7WhbmwDE';
      const message = 'ab81613f-68ee-428c-b667-fcdad51cd89f';
      const signature = 'H6psFx/e8JaPgNlrjhCt4aUYUu3d4uV+dxlOQb8WctghBXXwISWmicEQW8dPrO8ZLyLjsaGXDEzvSo18rSrFjTY=';
      const verified = verify(message, signature, userId);

      assert(verified === false);
    });
  });

  describe('when the signature was made for the wrong message by another user', () => {
    it('returns false', () => {
      const userId = '4KA4gBceiBRgNRMPtWtH5kGYg7WhbmwDE';
      const message = 'ab81613f-68ee-428c-b667-fcdad51cd89f';
      const signature = 'H6psFx/e8JaPgNlrjhCt4aUYUu3d4uV+dxlOQb8WctghBXXwISWmicEQW8dPrO8ZLyLjsaGXDEzvSo18rSrFjTY=';
      const verified = verify(message, signature, userId);

      assert(verified === false);
    });
  });

  describe('when the signature was made for the wrong message by the correct user', () => {
    it('returns false', () => {
      const userId = 'BHxzwmPZg34J5LYCA1xn7oZ2ryFBCd7rP';
      const message = '84bdd490-197f-42ae-b2ff-8a15e510b1ca';
      const signature = 'H6psFx/e8JaPgNlrjhCt4aUYUu3d4uV+dxlOQb8WctghBXXwISWmicEQW8dPrO8ZLyLjsaGXDEzvSo18rSrFjTY=';
      const verified = verify(message, signature, userId);

      assert(verified === false);
    });
  });
});
