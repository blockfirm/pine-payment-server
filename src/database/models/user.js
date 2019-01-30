import bs58check from 'bs58check';
import Sequelize from 'sequelize';
import config from '../../config';

export default {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  publicKey: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isBase58check(publicKey) {
        try {
          bs58check.decode(publicKey);
        } catch (error) {
          throw new Error('Public key must be base58check encoded');
        }
      }
    }
  },
  username: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      is: ['^[a-z0-9\\._]+$'],

      isNotTooLong(username) {
        if (username.length > config.server.usernameMaxLength) {
          throw new Error('Username is too long');
        }
      },
      isNotTooShort(username) {
        if (username.length < config.server.usernameMinLength) {
          throw new Error('Username is too short');
        }
      },
      isNotReserved(username) {
        config.server.reservedUsernames.forEach((reservedUsername) => {
          if (reservedUsername instanceof RegExp) {
            if (reservedUsername.test(username)) {
              throw new Error('Username is reserved');
            }
          }

          if (typeof reservedUsername === 'string') {
            if (username === reservedUsername) {
              throw new Error('Username is reserved');
            }
          }
        });
      }
    }
  },
  displayName: {
    type: Sequelize.STRING,
    validate: {
      max: 50
    }
  }
};
