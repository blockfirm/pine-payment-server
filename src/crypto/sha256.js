import createHash from 'create-hash';

/**
 * Gets a SHA-256 hash of a buffer.
 *
 * @param {Buffer} buffer - Input data to hash.
 *
 * @returns {Buffer} The hash produced by hashing the specified buffer with SHA-256.
 */
const sha256 = (buffer) => {
  return createHash('sha256').update(buffer).digest();
};

export default sha256;
