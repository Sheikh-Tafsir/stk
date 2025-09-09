const sequelize = require('../config/SequelizeConfig');
const { textAndImageFile, textOnly } = require('../config/GeminiConfig');
const { Task, TaskTodo } = require('../model');
const { UNAUTHORIZED, FOUND, DELETED, SOMETHING_WENT_WRONG, CREATED, UPDATED, NOT_FOUND } = require('../utils/Messages');
const { ApiResponse, ApiMessageResponse, RuntimeError } = require('../utils/Utils');

const PRE_PROMPT = `"prompt": "Provide a step-by-step guide for completing the following task: {WORK_TO_BE_SIMPLIFIED}.  Return the steps in JSON format, where each step is an object with the keys 'step' (string).  Ensure the steps are clear, concise, and easy to follow. Don't need index in steps. Prioritize clarity and completeness in your response.",
    "example_work_to_be_simplified": `;

const getAllTasksByUserId = async (userId) => {
    const taskList = await Task.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
    });

    return ApiResponse(FOUND, taskList);
};

const simplifyTask = async (userId, reqBody, image) => {
    const { prompt } = reqBody;
    const transaction = await sequelize.transaction();

    try {
        const taskId = await saveTask(userId, prompt, transaction);
        let rawResponse = image
            ? await textAndImageFile(PRE_PROMPT + prompt, image)
            : await textOnly(PRE_PROMPT + prompt);

        if (!rawResponse) throw new Error(SOMETHING_WENT_WRONG);

        const todos = parseTodos(rawResponse, taskId);
        await saveTodo(todos, transaction);
        await transaction.commit();

        return ApiResponse(CREATED, taskId);
    } catch (error) {
        await transaction.rollback();
        console.error('Simplify Task Error:', error);
        throw error;
    }
};

const deleteTask = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        await TaskTodo.destroy({ where: { taskId: id }, transaction });
        await Task.destroy({ where: { id }, transaction });
        await transaction.commit();

        return ApiMessageResponse(DELETED);
    } catch (error) {
        await transaction.rollback();
        console.error('Delete Task Error:', error);
        throw error;
    }
};

const getAllTodosByTaskId = async (taskId, userId) => {
    await validateTaskOfUser(taskId, userId);

    const todoList = await TaskTodo.findAll({
        where: { taskId },
        order: [['id', 'ASC']], // ASC for ascending order
    });

    if (!todoList) throw new RuntimeError(404, NOT_FOUND);

    return ApiResponse(FOUND, todoList);
};

const updateTodoDone = async (id, todoId, reqBody, userId) => {
    await validateTaskOfUser(id, userId);

    const transaction = await sequelize.transaction();

    try {
        const todo = await TaskTodo.findByPk(todoId, { transaction });
        if (!todo) {
            throw new RuntimeError(404, NOT_FOUND);
        }

        validateTodoOfTask(todo, id);

        // console.log(reqBody.done)
        todo.done = reqBody.done;
        await todo.save({ transaction });
        await transaction.commit();

        return ApiResponse(UPDATED, todo);
    } catch (error) {
        await transaction.rollback();
        console.error('Delete Task Error:', error);
        throw error;
    }
}


// Helper Functions
const saveTask = async (userId, prompt, transaction) => {
    const task = Task.build({ userId, prompt });
    await task.validate();
    await task.save({ transaction });
    return task.id;
};

const saveTodo = async (todos, transaction) => {
    const stepPromises = todos.map(item =>
        TaskTodo.create({
            taskId: item.taskId,
            step: item.step,
            done: item.done
        }, { transaction })
    );

    await Promise.all(stepPromises);
};

const parseTodos = (rawResponse, taskId) => {
    const cleaned = rawResponse.trim()
        .replace(/^```json\s*/, '')
        .replace(/```$/, '')
        .trim();

    const parsedSteps = JSON.parse(cleaned);
    // console.log(parsedSteps);
    return parsedSteps.map(step => ({
        ...step,
        taskId,
        done: false
    }));
};

const validateTaskOfUser = async (taskId, userId) => {
    const task = await Task.findByPk(taskId);
    if (!task || task.userId !== userId) {
        throw new RuntimeError(403, UNAUTHORIZED);
    }
}

const validateTodoOfTask = (todo, taskId) => {
    if (todo.taskId != taskId) {
        throw new RuntimeError(403, UNAUTHORIZED);
    }
}

module.exports = {
    getAllTasksByUserId,
    simplifyTask,
    getAllTodosByTaskId,
    deleteTask,
    saveTask,
    saveSteps: saveTodo,
    updateTodoDone,
};
