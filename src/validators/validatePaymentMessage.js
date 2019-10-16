import assert from 'assert';

// eslint-disable-next-line max-statements
const validatePaymentMessage = (encryptedPaymentMessage) => {
  let ecies;

  if (!encryptedPaymentMessage || typeof encryptedPaymentMessage !== 'string') {
    throw new Error('The encrypted payment message must be a string');
  }

  try {
    const json = Buffer.from(encryptedPaymentMessage, 'base64').toString();
    ecies = JSON.parse(json);
    assert(ecies && typeof ecies === 'object');
  } catch (error) {
    throw new Error('The encrypted payment message must be a base64-encoded JSON object');
  }

  try {
    const iv = Buffer.from(ecies.iv, 'hex');
    assert(iv.length === 16);
  } catch (error) {
    throw new Error('The iv parameter must be a hex-encoded buffer of 16 bytes');
  }

  try {
    const ephemPublicKey = Buffer.from(ecies.ephemPublicKey, 'hex');
    assert(ephemPublicKey.length === 65);
  } catch (error) {
    throw new Error('The ephemPublicKey parameter must be a hex-encoded buffer of 65 bytes');
  }

  try {
    const ciphertext = Buffer.from(ecies.ciphertext, 'hex');
    assert(ciphertext.length > 0);
  } catch (error) {
    throw new Error('The ciphertext parameter must be a hex-encoded buffer');
  }

  try {
    const mac = Buffer.from(ecies.mac, 'hex');
    assert(mac.length === 32);
  } catch (error) {
    throw new Error('The mac parameter must be a hex-encoded buffer of 32 bytes');
  }

  return true;
};

export default validatePaymentMessage;
