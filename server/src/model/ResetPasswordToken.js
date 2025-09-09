const { IS_REQUIRED } = require("../utils/Messages");

module.exports = (sequelize, DataTypes) => {
    const ResetPasswordToken = sequelize.define('ResetPasswordToken', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            validate: {
                isInt: true,
                notNull: { msg: IS_REQUIRED },
            }
        },

        token: {
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
            }
        },

        used: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
        {
            tableName: 'aspire_reset_password_tokens',
            underscored: true,
            timestamps: true,
        }
    );

    ResetPasswordToken.associate = models => {
        ResetPasswordToken.belongsTo(models.User, { foreignKey: 'userId', as: "User" });
    }

    return ResetPasswordToken;
};