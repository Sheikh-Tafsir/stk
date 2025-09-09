const { IS_REQUIRED, IS_NUMERIC, lengthValidationMessage } = require('../utils/Messages');

module.exports = (sequelize, DataTypes) => {
    const BudgetTransaction = sequelize.define('BudgetTransaction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
            },
        },

        typeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
            },
            references: {
                model: 'BudgetType',
                key: 'id',
            },
        },

        name: {
            type: DataTypes.STRING(32),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 32],
                    msg: lengthValidationMessage(0, 32)
                },
            }
        },

        description: {
            type: DataTypes.STRING(128),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 128],
                    msg: lengthValidationMessage(0, 32)
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
                max: 31,
            }
        },

        month: {
            type: DataTypes.INTEGER,
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
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },
                min: 2000,
                max: 2100,
            }
        },

        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isDecimal: { msg: IS_NUMERIC },
            },
        },

        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'stk_budget_transactions',
        underscored: true,
        timestamps: true,
        version: true,
    });

    BudgetTransaction.associate = (models) => {
        BudgetTransaction.belongsTo(models.BudgetType, {
            foreignKey: 'typeId',
            as: 'Type'
        });
    };

    return BudgetTransaction;
};
