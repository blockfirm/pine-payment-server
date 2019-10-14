import createLnrpc from 'lnrpc';

export default class Lnd {
  constructor(config) {
    this.config = config;
    this._connect();
  }

  _connect() {
    const { rpcHost, macaroon } = this.config;

    const options = {
      server: rpcHost,
      macaroonPath: macaroon
    };

    this._disconnect();

    return createLnrpc(options)
      .then(lnrpc => {
        this.rpc = lnrpc;
        console.log('[LND] Connected');
      })
      .catch(error => {
        console.error(`[LND] Unable to connect to lnd: ${error.message}`);
      });
  }

  _disconnect() {
    delete this.rpc;
  }

  getInvoice(amount, memo) {
    if (!this.rpc) {
      return Promise.reject(new Error('Not connected to gateway node'));
    }

    return this.rpc.addInvoice({ value: amount, memo }).then(invoice => ({
      paymentRequest: invoice.payment_request
    }));
  }
}
