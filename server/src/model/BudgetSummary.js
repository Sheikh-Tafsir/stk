const { IS_REQUIRED, IS_NUMERIC } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const BudgetSummary = sequelize.define('BudgetSummary', {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
            },
            references: {
                model: 'User',
                key: 'id',
            },
        },

        day: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 1,
                max: 31,
            }
        },

        month: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 1,
                max: 12,
            }
        },

        year: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 2000,
                max: 2100,
            }
        },

        totalAmount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'stk_budget_summary',
        underscored: true,
        timestamps: true,
        version: true,
    });

    return BudgetSummary;
};
