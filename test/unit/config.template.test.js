import assert from 'assert';
import config from '../../src/config.template';

describe('config.template.js', () => {
  it('exports an object', () => {
    assert.equal(typeof config, 'object');
  });
});
