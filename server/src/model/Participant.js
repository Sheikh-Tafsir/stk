const { intValueValidationMessage, IS_REQUIRED } = require('../utils/Messages');
const { PARTICIPANT_TYPE, GENDER_TYPE } = require('../utils/Enum');

module.exports = (sequelize, DataTypes) => {
  const Participant = sequelize.define('Participant', {
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

    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true,
        max: {
          args: 80,
          msg: intValueValidationMessage(null, 80)
        },
      }
    },

    gender: {
      type: DataTypes.ENUM(...Object.values(GENDER_TYPE)),
      allowNull: true,
    },

    expCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        notNull: { msg: IS_REQUIRED },
        isInt: true,
        max: {
          args: 5,
          msg: intValueValidationMessage(null, 5)
        },
      }
    },

    type: {
      type: DataTypes.ENUM(...Object.values(PARTICIPANT_TYPE)),
      allowNull: true,
    },

    predictedType: {
      type: DataTypes.ENUM(...Object.values(PARTICIPANT_TYPE)),
      allowNull: true,
    },

    predictionConfidence: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
    {
      tableName: 'aspire_patients',
      underscored: true,
      timestamps: true,
      version: true,
    }
  );

  Participant.associate = models => {
    Participant.belongsTo(models.User, { foreignKey: 'userId', as: 'User', onDelete: 'CASCADE' });
  }

  return Participant;
};