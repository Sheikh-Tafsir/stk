const { IS_REQUIRED, lengthValidationMessage } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    prompt: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: IS_REQUIRED },
        notEmpty: { msg: IS_REQUIRED },
        len: {
          args: [1, 100],
          msg: lengthValidationMessage(1, 100)
        },
      }
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      validate: {
        isInt: true,
        notNull: { msg: IS_REQUIRED },
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
      tableName: 'aspire_tasks',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  Task.associate = models => {
    Task.belongsTo(models.User, { foreignKey: 'userId', as: "TaskUserId" });
  }

  return Task;
};