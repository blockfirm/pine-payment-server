import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  address: {
    type: Sequelize.STRING,
    allowNull: false
  },
  waitingForContactRequest: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },

  /**
   * Allocated Bitcoin Address is the most recent address that the contact "checked out".
   * When this is set, it will always be returned to the contact when they request a new
   * address. It is cleared when it has been used in a transaction.
   */
  allocatedBitcoinAddress: {
    type: Sequelize.STRING,
    allowNull: true
  }
};
