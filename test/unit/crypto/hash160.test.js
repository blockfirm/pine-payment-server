import assert from 'assert';
import hash160 from '../../../src/crypto/hash160';

describe('hash160', () => {
  it('is a function', () => {
    assert.equal(typeof hash160, 'function');
  });

  it('accepts one argument', () => {
    assert.equal(hash160.length, 1);
  });

  it('returns a hash160 hash of the input', () => {
    const input = Buffer.from('457f6cf5-c573-4062-b2f2-61b5c424b6c9');
    const actualHash = hash160(input);
    const expectedHash = Buffer.from([180, 122, 160, 183, 87, 213, 108, 130, 137, 48, 209, 238, 1, 237, 195, 134, 157, 92, 55, 54]);

    assert(actualHash.equals(expectedHash));
  });
});
