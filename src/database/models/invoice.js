import Sequelize from 'sequelize';

export const fields = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },

  // Pine address of the user who will pay the invoice.
  payer: {
    type: Sequelize.STRING,
    allowNull: false
  },

  state: {
    type: Sequelize.ENUM,
    values: ['open', 'settled', 'canceled', 'accepted']
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
  }
};
