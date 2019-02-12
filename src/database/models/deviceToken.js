import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  ios: {
    type: Sequelize.STRING,
    allowNull: false
  }
};
