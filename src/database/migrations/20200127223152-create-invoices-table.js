'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      preimageHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      payer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      paid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      paidAmount: {
        type: Sequelize.STRING
      },
      paidAt: {
        type: Sequelize.DATE
      },
      paymentMessage: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      paymentMessageSignature: {
        type: Sequelize.STRING,
        allowNull: false
      },
      redeemed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      redeemedAt: {
        type: Sequelize.DATE
      },
      redeemedWithPaymentRequest: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.DataTypes.STRING,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      messageId: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'messages',
          key: 'id'
        },
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('invoices');
  }
};

