import assert from 'assert';
import * as bip39 from 'bip39';
import uuidv4 from 'uuid/v4';

import config from '../../src/config';
import Server from '../../src/Server';
import { createUser } from './client';

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getRandomUsername = () => {
  return uuidv4().split('-')[0];
};

describe('signup', () => {
  let server;
  let username1;
  let username2;
  let mnemonic1;
  let mnemonic2;

  before(() => {
    mnemonic1 = bip39.generateMnemonic();
    mnemonic2 = bip39.generateMnemonic();
    username1 = getRandomUsername();
    username2 = getRandomUsername();
    server = new Server(config);

    return server.start().then(() => wait(2000));
  });

  after(() => {
    return server.stop();
  });

  it('can create a new user', () => {
    return createUser(username1, mnemonic1, config.api.port).then(user => {
      assert(user.id, 'user.id is missing');
      assert(user.publicKey, 'user.publicKey is missing');
      assert(user.extendedPublicKey, 'user.extendedPublicKey is missing');
      assert(user.avatar, 'user.avatar is missing');
      assert.equal(user.username, username1, 'Username does not match');
    });
  });

  it('cannot create a user with the same mnemonic', () => {
    return createUser(username2, mnemonic1, config.api.port)
      .then(() => {
        assert(false, 'User with existing mnemonic was created');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'Conflict') {
          assert(false, error.message);
        }
      });
  });

  it('cannot create a user with the same username', () => {
    return createUser(username1, mnemonic2, config.api.port)
      .then(() => {
        assert(false, 'User with existing username was created');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'Conflict') {
          assert(false, error.message);
        }
      });
  });
});
