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
  }
};
