import Sequelize from 'sequelize';

export const options = {
  paranoid: true // Flag messages as deleted instead of actually deleting them.
};

export const fields = {
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
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isNotTooLong(encryptedMessage) {
        if (encryptedMessage && encryptedMessage.length > 50000) {
          throw new Error('Encrypted message is too long');
        }
      }
    }
  },
  signature: {
    type: Sequelize.STRING,
    allowNull: false
  }
};
