import assert from 'assert';
import getBitcoinAddress from '../../src/crypto/getBitcoinAddress';

describe('getBitcoinAddress', () => {
  it('is a function', () => {
    assert.equal(typeof getBitcoinAddress, 'function');
  });

  it('accepts three arguments', () => {
    assert.equal(getBitcoinAddress.length, 3);
  });

  it('returns a bitcoin address based on the passed parameters', () => {
    const extendedPublicKey = 'tpubDDbmTQV4nEzGZuqQUmpoe5Pok7GsVCenwsiBNKxeqP6V1j9Heah8eTuSSR692BW4RFpu4bYB5U33LmCwh2TwwKzPyeUsgjQvZDHfovZh4Rc';
    const network = 'testnet';
    const index = 0;
    const address = getBitcoinAddress(extendedPublicKey, network, index);

    assert.equal(address, '2NExZSraQ8YqqBRt8HjJwLjKmNjyhph83kT');
  });

  it('returns another bitcoin address when index is 1', () => {
    const extendedPublicKey = 'tpubDDbmTQV4nEzGZuqQUmpoe5Pok7GsVCenwsiBNKxeqP6V1j9Heah8eTuSSR692BW4RFpu4bYB5U33LmCwh2TwwKzPyeUsgjQvZDHfovZh4Rc';
    const network = 'testnet';
    const index = 1;
    const address = getBitcoinAddress(extendedPublicKey, network, index);

    assert.equal(address, '2MtMQXgEEqwyo7DHMPPwDvquoioJQyBrCi8');
  });
});
