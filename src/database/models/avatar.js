import Sequelize from 'sequelize';

export default {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
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
