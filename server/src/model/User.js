const { IS_REQUIRED, lengthValidationMessage } = require('../utils/Messages');
const { UserRole, USER_STATUS } = require('../utils/Enum');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
        len: {
          args: [6, 100],
          msg: lengthValidationMessage(6, 100)
        },
      }
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: IS_REQUIRED },
        isEmail: true,
      }
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
        len: {
          args: [1, 8],
          msg: lengthValidationMessage(1, 8)
        },
      }
    },

    image: {
      type: DataTypes.BLOB,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [11, 11],
          msg: 'Phone number must be 11 digits long',
        }
      }
    },

    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.PATIENT,
      validate: {
        notNull: { msg: IS_REQUIRED },
        len: {
          args: [1, 16],
          msg: lengthValidationMessage(1, 16)
        },
      }
    },

    status: {
      type: DataTypes.ENUM(...Object.values(USER_STATUS)),
      allowNull: false,
      defaultValue: USER_STATUS.ACTIVE,
      validate: {
        notNull: { msg: IS_REQUIRED },
        len: {
          args: [1, 16],
          msg: lengthValidationMessage(1, 16)
        },
      }
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
    {
      tableName: 'aspire_users',
      underscored: true,
      timestamps: true,
      version: true,
    }
  );
  
  User.associate = models => {
    User.hasOne(models.Participant, { foreignKey: 'userId', as: 'Participant', onDelete: 'CASCADE' });
    User.hasOne(models.CareGiver, { foreignKey: 'userId', as: 'CareGiver', onDelete: 'CASCADE' });
  }

  return User;
};
