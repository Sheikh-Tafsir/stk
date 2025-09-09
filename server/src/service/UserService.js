const { Op } = require('sequelize');

const Repository = require('../common/Repository');
const sequelize = require('../config/SequelizeConfig.js');
const { User, Participant, CareGiver } = require('../model');
const { USER_STATUS, UserRole } = require('../utils/Enum');
const { FOUND, UPDATED } = require('../utils/Messages');
const { ApiResponse, ApiMessageResponse, RuntimeError } = require('../utils/Utils');
const { changeImageByteToBase64 } = require('../utils/ImageUtils.js');
const ParticipantService = require('./ParticipantService.js');
const CareGiverService = require('./CareGiverService.js');

const getById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Participant,
                as: 'Participant',
                attributes: ['age', 'gender', 'expCount', 'type', 'predictedType', 'predictionConfidence'],
            },
            {
                model: CareGiver,
                as: 'CareGiver',
                attributes: ['maxParticipantCount', 'participantCount'],
            }
        ]
    });

    if (!user) {
        throw new RuntimeError(404, "User Profile not found for id:", id);
    }

    if (user.image) {
        user.image = changeImageByteToBase64(user.image);
    }

    if (user.Participant) {
        user.setDataValue('age', user.Participant.age);
        user.setDataValue('gender', user.Participant.gender);
        user.setDataValue('type', user.Participant.type);
        user.setDataValue('expCount', user.Participant.expCount);
        user.setDataValue('predictedType', user.Participant.predictedType);
        user.setDataValue('predictionConfidence', user.Participant.predictionConfidence);
    } else if (user.CareGiver) {
        user.setDataValue('maxParticipantCount', user.CareGiver.maxParticipantCount);
        user.setDataValue('participantCount', user.CareGiver.participantCount);
    }

    user.setDataValue('Participant', undefined);
    user.setDataValue('CareGiver', undefined);

    return ApiResponse(FOUND, user);
};

const getAll = async (userId) => {
    const users = await User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'image'],
        where: {
            id: {
                [Op.ne]: userId,
            },
        },
    });

    const updatedUsers = users.map(user => {
        user.image = changeImageByteToBase64(user.image);
        return user;
    });

    return ApiResponse(FOUND, updatedUsers);
};

const getAllByPagination = async (reqQuery) => {
    const {
        page = 1,
        search = null,
        filters = {},
        role,
        status,
    } = reqQuery;

    if (role) filters.role = role;
    if (status) filters.status = status;

    const data = await Repository.findAllByPagination(User, {
        page,
        search,
        searchFields: ['name', 'role', 'email'],
        filters,
    });

    return ApiResponse(FOUND, data);
}

const create = async (reqBody, transaction) => {
    const password = await Repository.hashPassword(reqBody.password);
    return await User.create(
        {
            name: reqBody.name,
            email: reqBody.email,
            password,
            role: reqBody.role || UserRole.PARTICIPANT,
            image: reqBody.image || null,
        },
        {
            transaction,
            validate: false
        }
    );
}

const update = async (reqBody, file, id) => {
    if (file && file?.buffer) {
        if (!file.mimetype.startsWith("image/")) {
            throw new RuntimeError(422, "Only image files are allowed");
        }
        reqBody.image = file.buffer;
        //console.log(req.image.toString('base64'))
    }

    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(id, { transaction });
        if (!user) {
            throw new RuntimeError(404, "user not found for id:", id);
        }

        user.name = reqBody.name;
        user.phone = reqBody.phone;
        user.gender = reqBody.gender;
        user.type = reqBody.type;
        user.image = reqBody.image;

        await user.save({ transaction });

        if (user.role == UserRole.PATIENT) {
            await ParticipantService.update(id, reqBody, transaction);
        } else if (user.role == UserRole.CARE_GIVER) {
            await CareGiverService.update(id, reqBody, transaction);
        }


        const accessToken = Repository.generateAccessToken(user);
        await transaction.commit();
        return ApiResponse(UPDATED, accessToken);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const remove = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        await User.update(
            { status: USER_STATUS.DELETED },
            { where: { id } },
            { transaction }
        );

        await transaction.commit();
        return ApiMessageResponse(DELETED);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getByIdReduced = async (id) => {
    return await User.findByPk(id, {
        attributes: { exclude: ['password', 'image'] },
    });
}

const getByEmail = async (email) => {
    return await User.findOne({
        attributes: { exclude: ['password', 'image'] },
        where: { email }
    });
};

const getNameById = async (id) => {
    return await User.findByPk(id, {
        attributes: ['name'],
    });
}

module.exports = {
    getById,
    getAll,
    getAllByPagination,
    create,
    update,
    remove,
    getByEmail,
    getByIdReduced,
    getNameById,
};
