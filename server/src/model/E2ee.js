const { IS_REQUIRED } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
  const E2ee = sequelize.define('E2ee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    publicKey: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'public_key',
      validate: {
        notNull: { msg: IS_REQUIRED },
      }
    },

    privateKey: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'private_key',
      validate: {
        notNull: { msg: IS_REQUIRED },
      }
    },

    iv: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
      }
    },

    salt: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
      }
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      validate: {
        notNull: { msg: IS_REQUIRED },
        isInt: true,
      }
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      field: 'updated_at'
    }
  },
    {
      tableName: 'aspire_e2ees',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      indexes: [
        {
          unique: true,
          fields: ['id', 'userId'],
          msg: 'Key pair for this user already exists'
        }
      ]
    }
  );

  E2ee.associate = models => {
    E2ee.belongsTo(models.User, { foreignKey: 'userId', as: "E2eeUser", onDelete: 'CASCADE' });
  }

  return E2ee;
};