import assert from 'assert';
import getUserIdFromPublicKey from '../../src/crypto/getUserIdFromPublicKey';

describe('getUserIdFromPublicKey', () => {
  it('is a function', () => {
    assert.equal(typeof getUserIdFromPublicKey, 'function');
  });

  it('accepts one argument', () => {
    assert.equal(getUserIdFromPublicKey.length, 1);
  });

  it('returns a user id based on the passed public key', () => {
    const publicKey = Buffer.from([3, 17, 214, 154, 170, 231, 200, 167, 224, 152, 253, 55, 12, 49, 188, 86, 86, 91, 215, 67, 239, 230, 196, 193, 95, 237, 219, 115, 130, 251, 254, 121, 220]);
    const userId = getUserIdFromPublicKey(publicKey);

    assert.equal(userId, 'BHxzwmPZg34J5LYCA1xn7oZ2ryFBCd7rP');
  });
});
