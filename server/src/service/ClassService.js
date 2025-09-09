const { Op } = require('sequelize');

const sequelize = require('../config/SequelizeConfig.js');
const { Class } = require('../model');
const { CREATED, UPDATED, FOUND, DELETED } = require('../utils/Messages');
const { RuntimeError, ApiMessageResponse, ApiResponse } = require('../utils/Utils');

const findAllByUserId = async (userId) => { 
    const classes = await Class.findAll({
        where: {
            userId,
        },
        order: [['day', 'ASC']]
    })

    return ApiResponse(FOUND, classes);
}

const findById = async (id, userId) => {
    const selectedClass = await findByIdHelper(id, userId, null);
    checkAccess(userId, selectedClass.userId);
    
    return ApiResponse(FOUND, selectedClass);
}

const create = async (reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const existingClass = await Class.findOne({
            where: {
                userId,
                day: reqBody.day,
                [Op.and]: [
                    { startTime: { [Op.lt]: reqBody.endTime } }, // existing starts before new ends
                    { endTime: { [Op.gt]: reqBody.startTime } }  // existing ends after new starts
                ]
            },
            transaction
        });

        if (existingClass) {
            throw new RuntimeError(422, 'Class time overlaps with an existing schedule' + existingClass.course);
        }

        await Class.create(
            {
                userId,
                course: reqBody.course,
                teacher: reqBody.teacher,
                day: reqBody.day,
                startTime: reqBody.startTime,
                endTime: reqBody.endTime,
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

const update = async (id, reqBody, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const selectedClass = await findByIdHelper(id, userId, transaction);
        checkAccess(userId, selectedClass.userId);

        const existingClass = await Class.findOne({
            where: {
                userId,
                day: reqBody.day,
                id: { [Op.ne]: id },
                [Op.and]: [
                    { startTime: { [Op.lt]: reqBody.endTime } }, // existing starts before new ends
                    { endTime: { [Op.gt]: reqBody.startTime } }  // existing ends after new starts
                ]
            },
            transaction
        });

        if (existingClass) {
            throw new RuntimeError(422, 'Class time overlaps with an existing schedule' + existingClass.course);
        }

        selectedClass.teacher = reqBody.teacher;
        selectedClass.course = reqBody.course;
        selectedClass.day = reqBody.day;
        selectedClass.startTime = reqBody.startTime;
        selectedClass.endTime = reqBody.endTime;

        await selectedClass.save({ transaction });
        await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const remove = async (id, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const selectedClass = await findByIdHelper(id, userId, transaction);
        checkAccess(userId, selectedClass.userId)

        await selectedClass.destroy({ transaction });

        await transaction.commit();

        return ApiMessageResponse(DELETED);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

//helper
const findByIdHelper = async (id, userId, transaction = null) => {
    const selectedClass = Class.findByPk(id, { transaction });
    if (!selectedClass) throw new RuntimeError(404, "Class not found with id: " + id);

    return selectedClass;
}

const checkAccess = (userId, resourceUserId) => {
    if (userId != resourceUserId) {throw new RuntimeError(403, "Access Denied")}
}
    
module.exports = {
    findById,
    findAllByUserId,
    create,
    update,
    remove,
};