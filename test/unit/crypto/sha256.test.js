import assert from 'assert';
import sha256 from '../../../src/crypto/sha256';

describe('sha256', () => {
  it('is a function', () => {
    assert.equal(typeof sha256, 'function');
  });

  it('accepts one argument', () => {
    assert.equal(sha256.length, 1);
  });

  it('returns a SHA-256 hash of the input', () => {
    const input = Buffer.from('880f4569-1765-42e6-bc31-b308cce15dda');
    const actualHash = sha256(input);
    const expectedHash = Buffer.from([81, 83, 245, 31, 208, 206, 245, 196, 8, 63, 228, 223, 137, 246, 123, 125, 75, 124, 241, 97, 232, 228, 35, 201, 236, 181, 197, 235, 132, 5, 142, 69]);

    assert(actualHash.equals(expectedHash));
  });
});
