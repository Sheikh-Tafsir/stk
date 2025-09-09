const Repository = require('../common/Repository.js');
const sendEmail = require('../config/MailConfig.js');
const sequelize = require('../config/SequelizeConfig.js');
const { User, CareGiver } = require('../model');
const { UserRole } = require('../utils/Enum.js');
const { NOT_FOUND, FOUND, UPDATED } = require('../utils/Messages');
const { RuntimeError, generatePassword, ApiResponse, formateDateToRegular, ApiMessageResponse } = require('../utils/Utils');
const UserService = require('./UserService.js');

const getAllByPagination = async (reqQuery) => {
    const {
        page = 1,
        search = null,
    } = reqQuery;

    let include = [
        {
            model: User,
            as: 'User',
            attributes: ['name']
        }
    ];

    const { rows, totalPages } = await Repository.findAllByPagination(CareGiver, {
        page,
        limit: 10,
        search,
        searchFields: ['name', 'type'],
        include,
    });

    rows.forEach(r => {
        if (r.User) {
            r.setDataValue('name', r.User.name);
            r.setDataValue('User', undefined);
            r.setDataValue('createdAt', formateDateToRegular(r.createdAt));
        }
    });

    return ApiResponse(FOUND, { rows, totalPages });
};

const getForAssignParticipant = async (transaction) => {
    const careGiver = await CareGiver.findOne({
        order: [['participantCount', 'ASC']],
        transaction
    });

    if (!careGiver) {
        throw new RuntimeError(404, NOT_FOUND);
    }

    return careGiver;
}

const getById = async (id) => {
    const careGiver = await CareGiver.findByPk(id, {
        include: [
            {
                model: User,
                as: 'User',
                attributes: ['name', 'email', 'image']
            },
        ]
    });

    if (!careGiver) {
        throw new RuntimeError(404, NOT_FOUND);
    }

    careGiver.setDataValue('name', careGiver.User.name);
    careGiver.setDataValue('email', careGiver.User.email);
    careGiver.setDataValue('image', careGiver.User.image);
    careGiver.setDataValue('User', undefined);

    return ApiResponse(FOUND, careGiver);
};

const create = async (reqBody) => {
    const userInstance = User.build(reqBody);
    await userInstance.validate({
        fields: ['email', 'name']
    });

    const existingUser = await UserService.getByEmail(userInstance.email);
    if (existingUser) {
        throw new RuntimeError(422, EMAIL_ALREADY_EXIST);
    }

    reqBody.role = UserRole.CARE_GIVER;
    reqBody.password = generatePassword(reqBody?.name);

    const transaction = await sequelize.transaction();

    try {
        const user = await UserService.create(reqBody, transaction);

        await CareGiver.create({
            userId: user.id,
            maxParticipantCount: reqBody.maxParticipantCount,
        }, { transaction })

        await sendEmail(
            reqBody.email,
            'Aspire Care Giver Account Created',
            "User credentials:\n" +
            "Email: " + reqBody.email + "\n" +
            "Password: " + reqBody.password + "\n"
        );

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.log("Failed to create care giver", error);
        throw error;
    }
}

const update = async (id, reqBody, transaction) => {
    let localTransaction = false;

    if (!transaction) {
        transaction = await sequelize.transaction();
        localTransaction = true;
    }

    try {
        const careGiver = await CareGiver.findByPk(id, { transaction });
        if (!careGiver) {
            throw new RuntimeError(404, "Care Giver not found for id:", id);
        }

        if (careGiver.participantCount > reqBody.maxParticipantCount) {
            throw new RuntimeError(422, "Max participant count cannot be less than current participant count");
        }

        careGiver.maxParticipantCount = reqBody.maxParticipantCount;
        await careGiver.save({ transaction });

        if (localTransaction) await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        if (localTransaction) await transaction.rollback();
        throw error;
    }
}

const assignCareGiverAndUpdateParticipantCount = async (careGiver, transaction) => {
    careGiver.participantCount += 1;
    await careGiver.save({ transaction });
};


const updateParticipantCount = async (userId, transaction) => {
    const [affectedRows] = await CareGiver.increment('participantCount', {
        by: 1,
        where: { userId },
        transaction,
    });

    if (affectedRows === 0) {
        throw new RuntimeError(404, NOT_FOUND);
    }
}

module.exports = {
    getAllByPagination,
    getById,
    create,
    update,
    getForAssignParticipant,
    assignCareGiverAndUpdateParticipantCount,
    updateParticipantCount,
}