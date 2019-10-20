/* eslint-disable camelcase, max-lines */
import createLnrpc from 'lnrpc';

const SUBSCRIPTION_REOPEN_DELAY = 2000; // 2s
const SETTLE_INDEX_REDIS_KEY = 'pine:lightning:settle-index';

export default class LndService {
  // eslint-disable-next-line max-params
  constructor(config, database, redis, notifications) {
    this.config = config;
    this.database = database;
    this.redis = redis;
    this.notifications = notifications;

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
  async _onInvoiceSettled(lndInvoice) {
    const settleIndex = parseInt(lndInvoice.settle_index.toString());
    const settleDate = parseInt(lndInvoice.settle_date.toString());
    const amountPaid = lndInvoice.amt_paid_sat.toString();
    const preimageHash = lndInvoice.r_hash.toString('hex');

    const dbInvoice = await this.database.invoice.findOne({
      where: { preimageHash }
    });

    if (!dbInvoice) {
      throw new Error(`Invoice not found (hash: ${preimageHash})`);
    }

    if (dbInvoice.paid) {
      throw new Error(`Invoice has already been paid (id: ${dbInvoice.id})`);
    }

    dbInvoice.paid = true;
    dbInvoice.amountPaid = amountPaid;
    dbInvoice.paidAt = new Date(settleDate * 1000);

    await dbInvoice.save({ fields: ['paid', 'amountPaid', 'paidAt'] });

    await this._sendMessage({
      from: dbInvoice.payer,
      userId: dbInvoice.userId,
      encryptedMessage: dbInvoice.paymentMessage,
      signature: dbInvoice.paymentMessageSignature,
      invoiceId: dbInvoice.id
    });

    await this._setSettleIndex(settleIndex);

    console.log(`[LND] Invoice paid (id: ${dbInvoice.id})`);
  }

  async _sendMessage(message) {
    const { database, notifications } = this;
    const createdMessage = await database.message.create(message);

    notifications.notify(message.userId, notifications.INCOMING_PAYMENT, {
      address: message.from
    });

    return createdMessage;
  }

  async getInvoice(amount, memo) {
    if (!this.rpc) {
      throw new Error('Not connected to gateway node');
    }

    const lndInvoice = await this.rpc.addInvoice({ value: amount, memo });

    return {
      paymentRequest: lndInvoice.payment_request,
      rHash: lndInvoice.r_hash
    };
  }
}
