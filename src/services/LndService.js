/* eslint-disable camelcase */
import createLnrpc from 'lnrpc';

const SUBSCRIPTION_REOPEN_DELAY = 2000; // 2s
const SETTLE_INDEX_REDIS_KEY = 'pine:lightning:settle-index';

const getInvoiceIdFromMemo = (memo) => {
  if (!memo) {
    return;
  }

  const params = memo.split(';').reduce((map, param) => {
    const [key, value] = param.split(':');
    map[key] = value;
    return map;
  }, {});

  return params.id;
};

export default class LndService {
  constructor(config, database, redis) {
    this.config = config;
    this.database = database;
    this.redis = redis;

    this._getSettleIndex()
      .then(settleIndex => {
        this._currentSettleIndex = settleIndex;
        this._connect();
      })
      .catch(error => {
        console.error('[LND] Unable to load settle index from redis:', error.message);
        process.exit(1);
      });
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
        this._subscribeToInvoices();
        console.log('[LND] Connected');
      })
      .catch(error => {
        console.error(`[LND] Unable to connect to lnd: ${error.message}`);
      });
  }

  _disconnect() {
    if (this._invoiceSubscription) {
      this._invoiceSubscription.close();
      delete this._invoiceSubscription;
    }

    delete this.rpc;
  }

  async _getSettleIndex() {
    const settleIndex = await this.redis.get(SETTLE_INDEX_REDIS_KEY);
    return parseInt(settleIndex) || 0;
  }

  _setSettleIndex(settleIndex) {
    this._currentSettleIndex = settleIndex;

    this.redis.set(SETTLE_INDEX_REDIS_KEY, settleIndex.toString()).catch(error => {
      console.error('[LND] Unable to save settle index to redis:', error.message);
    });
  }

  async _subscribeToInvoices() {
    this._invoiceSubscription = this.rpc.subscribeInvoices({
      settle_index: this._currentSettleIndex
    });

    this._invoiceSubscription.on('data', (invoice) => {
      if (invoice.settled && invoice.settle_index >= 0) {
        this._onInvoiceSettled(invoice).catch(error => {
          console.error('[LND] Invoice error:', error.message);
        });
      }
    });

    this._invoiceSubscription.on('error', (error) => {
      console.error('[LND] Invoice subscription error:', error.message);

      // Try to reopen subscription.
      setTimeout(this._subscribeToInvoices.bind(this), SUBSCRIPTION_REOPEN_DELAY);
    });
  }

  // eslint-disable-next-line max-statements
  async _onInvoiceSettled(invoice) {
    const memo = invoice.memo;
    const settleIndex = parseInt(invoice.settle_index.toString());
    const settleDate = parseInt(invoice.settle_date.toString());
    const amountPaid = invoice.amt_paid_sat.toString();
    const invoiceId = getInvoiceIdFromMemo(memo);
    console.log('[INVOICE]', invoice);
    if (!invoiceId) {
      throw new Error(`Invoice ID is missing from memo (memo: ${memo})`);
    }

    const dbInvoice = await this.database.invoice.findOne({
      where: { id: invoiceId }
    });

    if (!dbInvoice) {
      throw new Error(`Invoice not found (id: ${invoiceId})`);
    }

    if (dbInvoice.paid) {
      throw new Error(`Invoice has already been paid (id: ${invoiceId})`);
    }

    dbInvoice.paid = true;
    dbInvoice.amountPaid = amountPaid;
    dbInvoice.paidAt = new Date(settleDate * 1000);

    await dbInvoice.save({ fields: ['paid', 'amountPaid', 'paidAt'] });
    await this._setSettleIndex(settleIndex);
    console.log('Invoice processed');
  }

  async getInvoice(amount, memo) {
    if (!this.rpc) {
      throw new Error('Not connected to gateway node');
    }

    const lndInvoice = await this.rpc.addInvoice({ value: amount, memo });

    return {
      paymentRequest: lndInvoice.payment_request
    };
  }
}
