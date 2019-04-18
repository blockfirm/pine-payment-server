import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  from: {
    type: Sequelize.STRING,
    allowNull: false
  },
  encryptedMessage: {
    // eslint-disable-next-line new-cap
    type: Sequelize.STRING(4096),
    allowNull: false
  },
  signature: {
    type: Sequelize.STRING,
    allowNull: false
  }
};
