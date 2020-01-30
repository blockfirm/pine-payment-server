'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('invoices', {
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
        }
      }, { transaction });

      await queryInterface.addColumn('messages', 'invoiceId', {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'invoices',
          key: 'id'
        },
        allowNull: true
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('messages', 'invoiceId', { transaction });
      await queryInterface.dropTable('invoices', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

