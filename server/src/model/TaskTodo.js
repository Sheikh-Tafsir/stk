const { IS_REQUIRED, lengthValidationMessage } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
  const TaskTodo = sequelize.define('TaskTodo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'task_id',
      validate: {
        isInt: true,
        notNull: { msg: IS_REQUIRED },
      }
    },

    step: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
        len: {
          args: [1, 10000],
          msg: lengthValidationMessage(1, 10000)
        },
      }
    },

    done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      validate: {
        notNull: { msg: IS_REQUIRED },
      },
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
      tableName: 'aspire_tasktodos',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  TaskTodo.associate = models => {
    TaskTodo.belongsTo(models.Task, { foreignKey: 'taskId', as: "TaskDescriptionTaskId" });
  }

  return TaskTodo;
};