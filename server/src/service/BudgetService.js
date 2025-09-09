const { Op } = require('sequelize');

const sequelize = require('../config/SequelizeConfig.js');
const { BudgetType, BudgetTransaction, BudgetSummary } = require('../model');
const { CREATED, UPDATED, FOUND, DELETED, AUTHORIZATION_ERROR } = require('../utils/Messages');
const { RuntimeError, ApiMessageResponse, ApiResponse, isAdmin } = require('../utils/Utils');
const UserService = require('./UserService.js');

const ICON_DEFAULT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGc1Uuv3qbLCHlOkYv-4xnHf61Fkzvg9xgBQ&s";
//
// ---- Budget Types ----
//

const findAllTypesByUserId = async (userId) => {
    const types = await BudgetType.findAll({
        where: {
            [Op.or]: [
                { userId: null },    // global types
                { userId: userId }   // user-specific types
            ]
        },
        order: [['name', 'ASC']]
    });

    return ApiResponse(FOUND, types);
};

const findTypeById = async (id, userId) => {
    const type = await findTypeByIdHelper(id, null);
    await checkAccess(userId, type.userId);

    return ApiResponse(FOUND, type);
};

const createType = async (reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const user = await UserService.getByIdReduced(userId);

        await BudgetType.create(
            {
                userId: user.role === 'admin' ? null : userId,
                expense: reqBody.expense,
                name: reqBody.name,
                image: reqBody.image || ICON_DEFAULT_IMAGE,
            },
            { transaction }
        );

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateType = async (id, reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const type = await findTypeByIdHelper(id, transaction);
        await checkAccess(userId, type.userId);

        type.name = reqBody.name;
        type.image = reqBody.image;

        await type.save({ transaction });
        await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteType = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const type = await findTypeByIdHelper(id, transaction);
        await checkAccess(userId, type.userId);

        await type.destroy({ transaction });
        await transaction.commit();

        return ApiMessageResponse(DELETED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const findTypeByIdHelper = async (id, transaction = null) => {
    const type = await BudgetType.findByPk(id, { transaction });
    if (!type) throw new RuntimeError(404, "Budget Type not found with id: " + id);

    return type;
};

//
// ---- Budget Transactions ----
//

const findTransactionById = async (id, userId) => {
    const budgetTransaction = await findTransactionByIdHelper(id, userId, null);
    return ApiResponse(FOUND, budgetTransaction);
}

const findAllTransactions = async (reqQuery, userId) => {
    const { month, year, expense } = reqQuery;
    if (!month || !year) {
        throw new RuntimeError(422, "Month and Year are required");
    }

    const budgetTransactions = await BudgetTransaction.findAll({
        where: { userId, month, year },
        include: [
            {
                model: BudgetType,
                as: 'Type',
                attributes: ['id', 'name', 'expense'],
                where: expense !== undefined ? { expense } : {}
            },
        ],
        order: [['day', 'DESC']]
    });

    // const budgetSummary = await findSummaryByUserAndDateHelper(userId, null, month, year);

    const formattedBudgetTransactions = budgetTransactions.map(item => {
        const plain = item.get({ plain: true });
        
        const { Type, amount, ...rest } = plain;
        return {
            ...rest,
            amount: Number(amount),
            typeId: Type?.id,
            typeName: Type?.name,
            typeExpense: Type?.expense
        };
    });

    return ApiResponse(FOUND, formattedBudgetTransactions);
};

const createTransaction = async (reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const type = await BudgetType.findByPk(reqBody.typeId, { transaction });
        if (type?.userId && type?.userId !== userId) {
            throw new RuntimeError(403, AUTHORIZATION_ERROR);
        }

        if (!reqBody.date) throw new RuntimeError(422, "Transaction date is required");

        const { day, month, year } = getDateInParts(reqBody.date);
        await BudgetTransaction.create(
            {
                userId,
                typeId: reqBody.typeId,
                name: reqBody.name,
                description: reqBody.description,
                day,
                month,
                year,
                amount: Number(reqBody.amount),
            },
            { transaction }
        );

        await createSummary(reqBody, userId, day, month, year, type, transaction);

        await transaction.commit();
        return ApiMessageResponse(CREATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateTransaction = async (id, reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const budgetTransaction = await findTransactionByIdHelper(id, userId, transaction);
        await checkAccess(userId, budgetTransaction.userId);

        // console.log(reqBody);
        await updateSummaryWhenTransactionUpdatedAndDeleted(userId, budgetTransaction.day, budgetTransaction.month, budgetTransaction.year, budgetTransaction.amount, budgetTransaction.Type, transaction);

        const { day, month, year } = getDateInParts(reqBody.date);
        await createSummary(reqBody, userId, day, month, year, budgetTransaction.Type, transaction);

        budgetTransaction.amount = reqBody.amount;
        budgetTransaction.name = reqBody.name;
        budgetTransaction.description = reqBody.description;
        budgetTransaction.day = day;
        budgetTransaction.month = month;
        budgetTransaction.year = year;
        budgetTransaction.typeId = reqBody.typeId;
        
        await budgetTransaction.save({ transaction });

        await transaction.commit();
        return ApiMessageResponse(UPDATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteTransaction = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const budgetTransaction = await findTransactionByIdHelper(id, userId, transaction);
        await checkAccess(userId, budgetTransaction.userId);

        await updateSummaryWhenTransactionUpdatedAndDeleted(userId, budgetTransaction.day, budgetTransaction.month, budgetTransaction.year, budgetTransaction.amount, budgetTransaction.Type, transaction);

        await budgetTransaction.destroy({ transaction });

        await transaction.commit();
        return ApiMessageResponse(DELETED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const findTransactionByIdHelper = async (id, userId, transaction) => {
    const budgetTransaction = await BudgetTransaction.findByPk(id, {
        include: [
            {
                model: BudgetType,
                as: 'Type',
                attributes: ['id', 'expense'],
            },
        ],
        transaction
    });

    if (!budgetTransaction) throw new RuntimeError(404, "Budget transaction not found with id: " + id);

    await checkAccess(userId, budgetTransaction.userId);

    return budgetTransaction
}

//
// ---- Budget Personal ----
//

const findSummaryByUserAndDate = async (reqQuery, userId) => {
    const summary = await findSummaryByUserAndDateHelper(userId, reqQuery.day, reqQuery.month, reqQuery.year);
    return ApiResponse(FOUND, summary);
};

const createSummary = async (reqBody, userId, day, month, year, type, transaction) => {
    // --- find or create BudgetPersonal ---
    const [budgetSummary] = await BudgetSummary.findOrCreate({
        where: { userId, day, month, year },
        defaults: { totalAmount: 0 },
        transaction,
        // locking: true
    });

    // --- update totalAmount ---
    if (type.expense) budgetSummary.totalAmount = Number(budgetSummary.totalAmount) - Number(reqBody.amount);
    else budgetSummary.totalAmount = Number(budgetSummary.totalAmount) + Number(reqBody.amount);
    await budgetSummary.save({ transaction });
}

const updateSummaryWhenTransactionUpdatedAndDeleted = async (userId, day, month, year, amount, type, transaction) => {
    const budgetSummary = await findSummaryByUserAndDateHelper(userId, day, month, year, transaction);

    if (!budgetSummary) throw new RuntimeError(404, "Budget summary not found with user id: " + userId);

    if (type.expense) budgetSummary.totalAmount = Number(budgetSummary.totalAmount) + Number(amount);
    else budgetSummary.totalAmount = Number(budgetSummary.totalAmount) - Number(amount);

    await budgetSummary.save({ transaction });
}

const findSummaryByUserAndDateHelper = async (userId, day, month, year, transaction = null) => {
    if (!day || !month || !year) {
        throw new RuntimeError(422, "Day, Month and Year are required");
    }

    const budgetSummary = await BudgetSummary.findOne({
        where: {
            userId, day, month, year
        },
        transaction
    });

    return budgetSummary;
}

//
// ---- Exports ----
//

const getDateInParts = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const daysInMonth = new Date(year, month, 0).getDate(); // last day of month
    if (day < 1 || day > daysInMonth) {
        throw new RuntimeError(422, `Invalid date for month ${month}: ${day}`);
    }

    return { day, month, year };
}

const checkAccess = async (userId, resourceUserId) => {
    const user = await UserService.getByIdReduced(userId);

    if (!isAdmin(user.role)) {
        if (!resourceUserId || resourceUserId !== userId) {
            throw new RuntimeError(403, AUTHORIZATION_ERROR);
        }
    }
}

module.exports = {
    // Types
    findTypeById,
    findAllTypesByUserId,
    createType,
    updateType,
    deleteType,

    // Transactions
    findAllTransactions,
    findTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Summary
    findSummaryByUserAndDate,
};