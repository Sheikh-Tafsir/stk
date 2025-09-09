const { COURSES, DIFFICULTY_LEVEL } = require("../utils/Enum");
const { IS_REQUIRED, lengthValidationMessage } = require("../utils/Messages");

module.exports = (sequelize, DataTypes) => {
    const Quiz = sequelize.define("Quiz", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        course: {
            type: DataTypes.ENUM(...Object.values(COURSES)),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [6, 100],
                    msg: lengthValidationMessage(6, 128)
                },
            }
        },

        difficulty: {
            type: DataTypes.ENUM(...Object.values(DIFFICULTY_LEVEL)),
            allowNull: false,
            validate: {
                notNull: { msg: IS_REQUIRED },
                len: {
                    args: [4, 50],
                    msg: lengthValidationMessage(4,50)
                },
            }
        },

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: "stk_quizzes",
        underscored: true,
        timestamps: false,
    });

    // Define associations
    Quiz.associate = models => {
        Quiz.hasMany(models.QuizQuestion, { foreignKey: 'quizId', as: 'questions' });
    };

    return Quiz;
}
