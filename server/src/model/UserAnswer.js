const { IS_REQUIRED, IS_NUMERIC } = require("../utils/Messages");

module.exports = (sequelize, DataTypes) => {
    const UserAnswer = sequelize.define("UserAnswer", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },

            },
            references: {
                model: "User",
                key: "id",
            },
        },

        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },

            },
            references: {
                model: "Question",
                key: "id",
            },
        },

        selectedOptionId: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: { msg: IS_NUMERIC },
            },
            references: {
                model: "Option",
                key: "id",
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "stk_user_answers",
        underscored: true,
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ["userId", "questionId"],
                msg: "This question is already answered by the user"
            },
        ],
    });

    return UserAnswer;
}
