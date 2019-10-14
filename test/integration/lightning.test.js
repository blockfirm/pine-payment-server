import assert from 'assert';
import * as bip39 from 'bip39';
import uuidv4 from 'uuid/v4';

import config from '../../src/config';
import Server from '../../src/Server';
import { createUser, addContact, getLightningInvoice } from './client';

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getRandomUsername = () => {
  return uuidv4().split('-')[0];
};

describe('lightning', () => {
  let server;
  const usernames = [];
  const mnemonics = [];
  const users = [];

  before(() => {
    const apiPort = config.api.port;

    mnemonics[0] = bip39.generateMnemonic();
    mnemonics[1] = bip39.generateMnemonic();
    mnemonics[2] = bip39.generateMnemonic();

    usernames[0] = getRandomUsername();
    usernames[1] = getRandomUsername();
    usernames[2] = getRandomUsername();

    server = new Server(config);

    return server.start()
      .then(() => wait(2000))
      .then(() => {
        return createUser(usernames[0], mnemonics[0], apiPort).then(user => {
          users[0] = user;
        });
      })
      .then(() => {
        return createUser(usernames[1], mnemonics[1], apiPort).then(user => {
          users[1] = user;
        });
      })
      .then(() => {
        return createUser(usernames[2], mnemonics[2], apiPort).then(user => {
          users[2] = user;
        });
      })
      .then(() => {
        return addContact(`${usernames[1]}@localhost`, mnemonics[0], apiPort);
      })
      .then(() => {
        return addContact(`${usernames[0]}@localhost`, mnemonics[1], apiPort);
      });
  });

  after(() => {
    return server.stop();
  });

  it('can get a lightning invoice for a contact', () => {
    const amount = 25000;

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    return getLightningInvoice(amount, users[0].id, credentials, config.api.port).then(invoice => {
      assert(invoice.amount !== amount, 'Invoice amount is not matching');
      assert(invoice.paymentRequest, 'Invoice payment request is missing');
    });
  });

  it('cannot get a lightning invoice for a user that is not a contact', () => {
    const amount = 35000;

    const credentials = {
      username: usernames[2],
      mnemonic: mnemonics[2]
    };

    return getLightningInvoice(amount, users[0].id, credentials, config.api.port)
      .then(() => {
        assert(false, 'Managed to get an invoice for a non-contact');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'Unauthorized') {
          assert(false, error.message);
        }
      });
  });

  it('cannot get a lightning invoice without an amount', () => {
    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    return getLightningInvoice(null, users[0].id, credentials, config.api.port)
      .then(() => {
        assert(false, 'Managed to get an invoice without an amount');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'BadRequest') {
          assert(false, error.message);
        }
      });
  });
});
