import Sequelize from 'sequelize';

export const fields = {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  from: {
    type: Sequelize.STRING,
    allowNull: false
  }
};
