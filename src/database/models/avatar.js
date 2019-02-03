import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  checksum: {
    type: Sequelize.STRING,
    allowNull: false
  },
  image: {
    type: Sequelize.BLOB,
    allowNull: false
  }
};
