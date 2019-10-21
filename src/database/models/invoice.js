import Sequelize from 'sequelize';

export const fields = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },

  /**
   * Hash of the invoice's preimage. Used for mapping
   * an invoice from lnd to an invoice in the database.
   */
  preimageHash: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },

  // Pine address of the user who will pay the invoice.
  payer: {
    type: Sequelize.STRING,
    allowNull: false
  },

  // Whether or not this invoice has been paid.
  paid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },

  // Amount that was paid in satoshis.
  paidAmount: {
    type: Sequelize.STRING
  },

  // Timestamp when the invoice was paid.
  paidAt: {
    type: Sequelize.DATE
  },

  /**
   * An encrypted payment message that will be sent to
   * the payee (recipient) once the invoice has been paid.
   */
  paymentMessage: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isNotTooLong(paymentMessage) {
        if (paymentMessage && paymentMessage.length > 50000) {
          throw new Error('Encrypted payment message is too long');
        }
      }
    }
  },

  // A signature of the payment message signed by the payer (sender).
  paymentMessageSignature: {
    type: Sequelize.STRING,
    allowNull: false
  },

  // Whether or not this invoice has been redeemed by the payee.
  redeemed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },

  // Timestamp when invoice was redeemed by the payee.
  redeemedAt: {
    type: Sequelize.DATE
  },

  // Payment request that was used to redeem this invoice.
  redeemedWithPaymentRequest: {
    type: Sequelize.STRING
  }
};
