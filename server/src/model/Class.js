const { IS_REQUIRED, lengthValidationMessage, IS_NUMERIC } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
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
                isInt: true,
            },
            references: {
                model: 'User',
                key: 'id',
            },
        },

        course: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [6, 128],
                    msg: lengthValidationMessage(6, 128)
                },
            }
        },

        teacher: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [6, 100],
                    msg: lengthValidationMessage(6, 128)
                },
            }
        },

        day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 1,
                max: 7,
            }
        },

        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED }
            }
        },

        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED }
            }
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
        {
            tableName: 'stk_classes',
            underscored: true,
            timestamps: true,
            version: true,
        }
    );

    return Class;
};