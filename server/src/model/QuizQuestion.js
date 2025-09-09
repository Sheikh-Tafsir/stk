const { IS_REQUIRED, IS_NUMERIC, lengthValidationMessage } = require("../utils/Messages");

module.exports = (sequelize, DataTypes) => {
    const QuizQuestion = sequelize.define("QuizQuestion", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        quizId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                isInt: { msg: IS_NUMERIC },

            },
            references: {
                model: "Quiz",
                key: "id",
            },
        },

        questionText: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 512],
                    msg: lengthValidationMessage(4, 512)
                },
            }
        },

        a: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 128],
                    msg: lengthValidationMessage(4, 128)
                },
            }
        },

        b: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 128],
                    msg: lengthValidationMessage(4, 128)
                },
            }
        },

        c: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 128],
                    msg: lengthValidationMessage(4, 128)
                },
            }
        },

        d: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 128],
                    msg: lengthValidationMessage(4, 128)
                },
            }
        },

        correctAnswer: {
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
        tableName: "stk_questions",
        underscored: true,
        timestamps: false,
    });

    // Define associations
    QuizQuestion.associate = models => {
        QuizQuestion.hasOne(models.QuizUserAnswer, { foreignKey: 'questionId', as: 'Answer' });
    };

    return QuizQuestion;
}
