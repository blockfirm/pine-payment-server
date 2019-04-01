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
  extendedPublicKey: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isBase58check(extendedPublicKey) {
        try {
          bs58check.decode(extendedPublicKey);
        } catch (error) {
          throw new Error('Extended public key must be base58check encoded');
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
      isNotTooLong(displayName) {
        if (displayName.length > 50) {
          throw new Error('Display name is too long');
        }
      }
    }
  },

  /**
   * Address Index is the current BIP44 index with the next unused address.
   */
  addressIndex: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },

  /**
   * Address Index Offset is the offset of released addresses since addressIndex was last updated.
   * This should never exceed 19 as that might break the address discovery gap limit. Instead it
   * should rotate when reaching 19.
   */
  addressIndexOffset: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isBelow20(addressIndexOffset) {
        if (addressIndexOffset > 19) {
          throw new Error('Address Index Offset must be a number between 0 and 19');
        }
      }
    }
  }
};
