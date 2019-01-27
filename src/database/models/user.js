import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  publicKey: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  displayName: {
    type: Sequelize.STRING
  }
};
