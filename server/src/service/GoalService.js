const { Op } = require('sequelize');

const sequelize = require('../config/SequelizeConfig.js');
const { Goal } = require('../model');
const { CREATED, UPDATED, DELETED, FOUND } = require('../utils/Messages.js');
const { RuntimeError, ApiResponse, ApiMessageResponse } = require('../utils/Utils.js');

const findTodaysTasks = async (userId) => {
    const today = getBangladeshToday()

    const upcomingLimit = new Date();
    upcomingLimit.setDate(today.getDate() + 3);

    const overdueLimit = new Date();
    overdueLimit.setDate(today.getDate() - 2);

    // 1️⃣ Fetch Overdue
    const overdueTasks = await Goal.findAll({
        where: {
            userId,
            completed: false,
            deadline: { [Op.lt]: today, [Op.gte]: overdueLimit },
        },
        order: [
            ['priority', 'DESC'],
            ['deadline', 'ASC']
        ],
        limit: 3
    });

    // 2️⃣ Fetch Today
    const todayTasks = await Goal.findAll({
        where: {
            userId,
            // completed: false,
            deadline: today
        },
        order: [['priority', 'DESC']],
        limit: 12
    });

    // 3️⃣ Fetch Upcoming (next 3 days, high priority)
    const upcomingTasks = await Goal.findAll({
        where: {
            userId,
            // completed: false,
            deadline: { [Op.gt]: today, [Op.lte]: upcomingLimit },
            // priority: { [Op.gte]: 2 } // medium or high
        },
        order: [['priority', 'DESC'], ['deadline', 'ASC']],
        limit: 12 - todayTasks.length
    });

    // 3️⃣ Add status attribute
    const formattedOverdue = overdueTasks.map(task => ({
        ...task.toJSON(),
        status: 'past'
    }));

    const formattedToday = todayTasks.map(task => ({
        ...task.toJSON(),
        status: 'current'
    }));
    const formattedUpcoming = upcomingTasks.map(task => ({
        ...task.toJSON(),
        status: 'upcoming'
    }));

    // 4️⃣ Combine and sort again if needed
    const combinedTasks = [...formattedOverdue, ...formattedToday, ...formattedUpcoming];
    return ApiResponse(FOUND, combinedTasks);
};

const findById = async (id, userId) => {
    const goal = await findByIdHelper(id, null);
    checkAccess(userId, goal.userId);

    return ApiResponse(FOUND, goal);
}

const create = async (reqBody, userId) => {
    const transaction = await sequelize.transaction();
    try {
        await Goal.create(
            {
                userId,
                name: reqBody.name,
                description: reqBody.description,
                priority: reqBody.priority,
                deadline: reqBody.deadline,
            },
            { transaction }
        );

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const update = async (id, reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const goal = await findByIdHelper(id, transaction);
        checkAccess(userId, goal.userId);

        goal.name = reqBody.name;
        goal.description = reqBody.description;
        goal.priority = reqBody.priority;
        goal.deadline = reqBody.deadline;
        goal.completed = reqBody.completed;

        await goal.save({ transaction });
        await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const updateCheck = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const goal = await findByIdHelper(id, transaction);
        checkAccess(userId, goal.userId);

        goal.completed = !goal.completed;

        await goal.save({ transaction });
        await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const remove = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const goal = await findByIdHelper(id, transaction);
        checkAccess(userId, goal.userId);

        await goal.destroy({ transaction });
        await transaction.commit();

        return ApiMessageResponse(DELETED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const findByIdHelper = async (id, transaction) => {
    const goal = await Goal.findByPk(id, { transaction });
    if (!goal) throw new RuntimeError(404, 'Goal not found with id: ' + id);

    return goal;
}

const checkAccess = (userId, resourceUserId) => {
    if (userId !== resourceUserId) {
        throw new RuntimeError(403, "User " + userId + "do not have permission to access resource " + resourceUserId);
    }
}

const getBangladeshToday = () => {
    const now = new Date();

    // get BD offset in minutes (+360 for +6:00)
    const bdOffset = 6 * 60;

    // convert current UTC time to BD time
    const bdNow = new Date(now.getTime() + bdOffset * 60 * 1000);

    // strip to midnight BD time
    bdNow.setUTCHours(0, 0, 0, 0);

    return bdNow;
}

module.exports = {
    findTodaysTasks,
    findById,
    create,
    update,
    updateCheck,
    remove,
};