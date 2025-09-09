const { IS_REQUIRED, lengthValidationMessage, IS_NUMERIC } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Goal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
            },
            references: {
                model: 'User',
                key: 'id',
            }
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: IS_REQUIRED },
                notEmpty: { msg: IS_REQUIRED },
                len: {
                    args: [1, 56],
                    msg: lengthValidationMessage(1, 56)
                },
            }
        },

        description: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 512],
                    msg: lengthValidationMessage(0, 512)
                },
            }
        },

        priority: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 1,
                max: 3,
            }
        },

        deadline: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
            }
        },

        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
            },
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
        {
            tableName: 'stk_goals',
            underscored: true,
            timestamps: true,
            version: true,
        }
    );

    // Task.associate = models => {
    //     Task.belongsTo(models.User, { foreignKey: 'userId', as: "TaskUserId" });
    // }

    return Task;
};