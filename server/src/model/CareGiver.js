const { IS_REQUIRED } = require('../utils/Messages');
const { MAX_PARTICIPANT_COUNT } = require('../utils/Utils');

module.exports = (sequelize, DataTypes) => {
  const CareGiver = sequelize.define('CareGiver', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
        isInt: true,
      },
      references: {
        model: 'User',
        key: 'id',
      },
    },

    maxParticipantCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: MAX_PARTICIPANT_COUNT,
      validate: {
        isInt: true,
        max: MAX_PARTICIPANT_COUNT,
      }
    },

    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        isInt: true,
      }
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
    {
      tableName: 'aspire_caregivers',
      underscored: true,
      timestamps: true,
      version: true,
    }
  );

  CareGiver.associate = models => {
    CareGiver.belongsTo(models.User, { foreignKey: 'userId', as: 'User', onDelete: 'CASCADE' });
  }

  return CareGiver;
};