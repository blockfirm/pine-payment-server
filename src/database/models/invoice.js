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
  }
};
