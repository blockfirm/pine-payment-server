import assert from 'assert';
import config from '../src/config';

describe('config.js', () => {
  it('exports an object', () => {
    assert.equal(typeof config, 'object');
  });
});
