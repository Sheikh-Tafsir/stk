const sequelize = require('../config/SequelizeConfig.js');
const { Quiz, QuizQuestion, QuizUserAnswer } = require('../model');
const { CREATED, FOUND } = require('../utils/Messages.js');
const { RuntimeError, ApiMessageResponse, ApiResponse, isAdmin } = require('../utils/Utils.js');
const UserService = require('./UserService.js');

const findByCourseAndDiff = async (reqQuery, userId) => {
    const user = UserService.getByIdReduced(userId);

    const includeForStudent = [
        {
            model: QuizUserAnswer,
            as: 'Answer',
            attributes: ['answer'],
            where: { userId },
            required: false,
        },
    ];

    const quizInclude = {
        model: QuizQuestion,
        as: 'questions',
    }


    if (!isAdmin(user.role)) {
        quizInclude.include = includeForStudent;
    }

    const quiz = await Quiz.findOne({
        where: {
            course: reqQuery.course,
            difficulty: reqQuery.difficulty,
        },
        include: [quizInclude],
    })

    if (!quiz || isAdmin(user.role)) return ApiResponse(FOUND, quiz);

    const formattedQuiz = quiz.toJSON();

    let participated = false;
    let score = 0;

    formattedQuiz.questions = formattedQuiz.questions.map((q) => {
        const answer = q.Answer ? q.Answer.answer : null;
        if (answer) participated = true;

        if (answer && answer === q.correctAnswer) {
            score++;
        }

        return {
            ...q,
            answer,
        };
    });

    formattedQuiz.participated = participated;
    formattedQuiz.score = score;

    return ApiResponse(FOUND, formattedQuiz);
}

const create = async (reqBody) => {
    const transaction = await sequelize.transaction();

    try {
        const existingQuiz = await Quiz.findOne({
            where: {
                course: reqBody.course,
                difficulty: reqBody.difficulty,
            }
        });

        if (existingQuiz) throw new RuntimeError(422, "Quiz already exists");

        const quiz = await Quiz.create(
            {
                course: reqBody.course,
                difficulty: reqBody.difficulty,
            },
            { transaction }
        )

        const questionsToInsert = reqBody.questions.map(q => ({
            quizId: quiz.id,
            questionText: q.questionText,
            a: q.a,
            b: q.b,
            c: q.c,
            d: q.d,
            correctAnswer: q.correctAnswer,
        }));

        // Bulk insert questions
        await QuizQuestion.bulkCreate(questionsToInsert, { transaction });

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const saveUserAnswers = async (reqBody, userId) => {
    console.log(reqBody);
    const transaction = await sequelize.transaction();

    try {
        const answers = reqBody.answers;
        const formattedAnswers = answers.map(item => ({
            ...item,
            userId,
        }));

        await QuizUserAnswer.bulkCreate(formattedAnswers, { transaction });

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

module.exports = {
    findByCourseAndDiff,
    create,
    saveUserAnswers,
}