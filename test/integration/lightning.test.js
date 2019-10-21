import assert from 'assert';
import * as bip39 from 'bip39';
import bs58check from 'bs58check';
import uuidv4 from 'uuid/v4';

import config from '../../src/config';
import Server from '../../src/Server';
import { getKeyPairFromMnemonic, encrypt, sign } from './client/crypto';

import {
  createUser,
  addContact,
  createLightningInvoice,
  getLightningInvoice,
  redeemLightningInvoice
} from './client';

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const getRandomUsername = () => {
  return uuidv4().split('-')[0];
};

const encryptPaymentMessage = async (message, publicKey, keyPair) => {
  const encryptedMessage = await encrypt(JSON.stringify(message), publicKey);
  const signature = sign(encryptedMessage, keyPair);

  return { encryptedMessage, signature };
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

  it('can create a lightning invoice for a contact', async () => {
    const amount = '25000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      assert(createdInvoice.id, 'Invoice ID is missing');
      assert(createdInvoice.amount !== amount, 'Invoice amount is not matching');
      assert(createdInvoice.paymentRequest, 'Invoice payment request is missing');
    });
  });

  it('cannot create a lightning invoice for a user that is not a contact', async () => {
    const amount = '35000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[2],
      mnemonic: mnemonics[2]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port)
      .then(() => {
        assert(false, 'Managed to get an invoice for a non-contact');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'Unauthorized') {
          assert(false, error.message);
        }
      });
  });

  it('cannot create a lightning invoice without an amount', async () => {
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port)
      .then(() => {
        assert(false, 'Managed to get an invoice without an amount');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'BadRequest') {
          assert(false, error.message);
        }
      });
  });

  it('cannot create a lightning invoice without a payment message', async () => {
    const amount = '1234';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const invoice = {
      amount,
      payee: payee.id
    };

    return createLightningInvoice(invoice, credentials, config.api.port)
      .then(() => {
        assert(false, 'Managed to get an invoice without specifying a payment message');
      })
      .catch(error => {
        if (!error.response || error.response.data.code !== 'BadRequest') {
          assert(false, error.message);
        }
      });
  });

  it('can get a lightning invoice when the external user is the payer', async () => {
    const amount = '25000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      return getLightningInvoice({
        id: createdInvoice.id,
        payee: payee.id
      }, credentials, config.api.port).then(fetchedInvoice => {
        assert(fetchedInvoice.id, 'Invoice ID is missing');
      });
    });
  });

  it('cannot get a lightning invoice when the external user is not the payer', async () => {
    const amount = '25000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      const unauthorizedCredentials = {
        username: usernames[2],
        mnemonic: mnemonics[2]
      };

      return getLightningInvoice({
        id: createdInvoice.id,
        payee: payee.id
      }, unauthorizedCredentials, config.api.port)
        .then(() => {
          assert(false, 'Managed to get an invoice that does not belong to the user');
        })
        .catch(error => {
          if (!error.response || error.response.data.code !== 'NotFound') {
            assert(false, error.message);
          }
        });
    });
  });

  it('can get a lightning invoice when the internal user is the payee', async () => {
    const amount = '25000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      const payeeCredentials = {
        userId: payee.id,
        mnemonic: mnemonics[0]
      };

      return getLightningInvoice({
        id: createdInvoice.id,
        payee: payee.id
      }, payeeCredentials, config.api.port).then(fetchedInvoice => {
        assert(fetchedInvoice.id, 'Invoice ID is missing');
      });
    });
  });

  it('cannot get a lightning invoice when the internal user is not the payee', async () => {
    const amount = '25000';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      const unauthorizedCredentials = {
        userId: users[1].id,
        mnemonic: mnemonics[1]
      };

      return getLightningInvoice({
        id: createdInvoice.id,
        payee: payee.id
      }, unauthorizedCredentials, config.api.port)
        .then(() => {
          assert(false, 'Managed to get an invoice that does not belong to the user');
        })
        .catch(error => {
          if (!error.response || error.response.data.code !== 'Unauthorized') {
            assert(false, error.message);
          }
        });
    });
  });

  it('cannot redeem a lightning invoice when the internal user is not the payee', async () => {
    const amount = '1500';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      const paymentRequest = 'fake-payment-request';

      const unauthorizedCredentials = {
        userId: users[2].id,
        mnemonic: mnemonics[2]
      };

      return redeemLightningInvoice(
        createdInvoice,
        paymentRequest,
        unauthorizedCredentials,
        config.api.port
      )
        .then(() => {
          assert(false, 'Managed to redeem invoice of another user');
        })
        .catch(error => {
          if (!error.response || error.response.data.code !== 'NotFound') {
            assert(false, error.message);
          }
        });
    });
  });

  it('cannot redeem an unpaid lightning invoice', async () => {
    const amount = '1500';
    const payee = users[0]; // Payee = the recipient of the payment

    const credentials = {
      username: usernames[1],
      mnemonic: mnemonics[1]
    };

    const message = {
      version: 1,
      type: 'ln_payment',
      data: {}
    };

    const { encryptedMessage, signature } = await encryptPaymentMessage(
      message,
      bs58check.decode(payee.publicKey),
      getKeyPairFromMnemonic(credentials.mnemonic)
    );

    const invoice = {
      amount,
      payee: payee.id,
      paymentMessage: encryptedMessage,
      paymentMessageSignature: signature
    };

    return createLightningInvoice(invoice, credentials, config.api.port).then(createdInvoice => {
      const paymentRequest = 'lnsb15u1pw6uwcupp5rrtlst2g3kqr7ge68qv4lg3fax0e6hlksxs6sthz954v92z29eusdqqcqzpg9sqcygx8xyserlwfna995ytxy5en8r4pxjq9e6tr2wf5flqzzxkktw9zedfry6xt6zgckkrtnnzyxg8jymvpknzfvg4v6xwfmw5rc3cq0u03tl';

      const payeeCredentials = {
        userId: payee.id,
        mnemonic: mnemonics[0]
      };

      return redeemLightningInvoice(
        createdInvoice,
        paymentRequest,
        payeeCredentials,
        config.api.port
      )
        .then(() => {
          assert(false, 'Managed to redeem unpaid invoice');
        })
        .catch(error => {
          if (!error.response || error.response.data.code !== 'Forbidden') {
            assert(false, error.message);
          }
        });
    });
  });
});
