const { IS_REQUIRED, IS_NUMERIC, lengthValidationMessage } = require("../utils/Messages");

module.exports = (sequelize, DataTypes) => {
    const QuizUserAnswer = sequelize.define("QuizUserAnswer", {
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
                model: "QuizQuestion",
                key: "id",
            },
        },

        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [1, 1],
                    msg: lengthValidationMessage(1, 1)
                },
            }
        },

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "stk_user_answers",
        underscored: true,
        timestamps: false,
    });

    return QuizUserAnswer;
}
