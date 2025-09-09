const { IS_REQUIRED, lengthValidationMessage, IS_NUMERIC } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const BudgetType = sequelize.define('BudgetType', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                isInt: { msg: IS_NUMERIC },
            },
            references: {
                model: 'User',
                key: 'id',
            },
        },

        expense: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
            },
        },

        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [3, 100],
                    msg: lengthValidationMessage(3, 128)
                },
            }
        },

        image: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'stk_budget_types',
        underscored: true,
        timestamps: true,
        version: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'name'],
                msg: "This name is already taken"
            }
        ]

    });

    return BudgetType;
};
