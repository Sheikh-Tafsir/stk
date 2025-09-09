const { default: axios } = require('axios');

const { User, Participant } = require('../model');
const sequelize = require('../config/SequelizeConfig');
const Repository = require('../common/Repository');
const { FOUND, UPDATED } = require('../utils/Messages');
const { ApiResponse, RuntimeError, formateDateToRegular, ApiMessageResponse, isNull } = require('../utils/Utils');
// const { UserRole } = require('../utils/Enum');
// const CareGiverService = require('./CareGiverService');

const getAllByPagination = async (userId, reqQuery) => {
    // const user = await Repository.findById(User, userId);

    const {
        page = 1,
        search = null,
    } = reqQuery;

    // let filters = {};
    let include = [
        {
            model: User,
            as: 'User',
            attributes: ['name']
        }
    ];

    // if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
    //     include.push({
    //         model: CareGiver,
    //         as: 'CareGiver',
    //         include: [
    //             {
    //                 model: User,
    //                 as: 'User',
    //                 attributes: ['name']
    //             }
    //         ]
    //     });
    // } else {
    //     const careGiver = await CareGiverService.getByUserId(userId);
    //     filters.examinerId = careGiver.id;
    // }

    const { rows, totalPages } = await Repository.findAllByPagination(Participant, {
        page,
        limit: 10,
        search,
        searchFields: ['name', 'type'],
        // filters,
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

const getById = async (id) => {
    const participant = await Participant.findByPk(id, {
        include: [
            {
                model: User,
                as: 'User',
                attributes: ['name', 'image']
            },
        ]
    });

    if (!participant) {
        throw new RuntimeError(404, NOT_FOUND);
    }

    participant.setDataValue('name', participant.User.name);
    participant.setDataValue('image', participant.User.image);
    participant.setDataValue('User', undefined);

    return ApiResponse(FOUND, participant);
};

const create = async (userId, transaction) => {
    await Participant.create({
        userId,
    }, { transaction });
};

const update = async (id, reqBody, transaction) => {
    let localTransaction = false;

    if (!transaction) {
        transaction = await sequelize.transaction();
        localTransaction = true;
    }

    try {
        const participant = await Participant.findByPk(id, { transaction });
        if (!participant) {
            throw new RuntimeError(404, "Participant not found for id:", id);
        }

        if (!isNull(reqBody.age) || reqBody.age != 0) {
            participant.age = reqBody.age;
        }

        participant.gender = reqBody.gender;
        participant.type = reqBody.type;

        await participant.save({ transaction });

        if (localTransaction) await transaction.commit();

        return ApiMessageResponse(UPDATED);
    } catch (error) {
        if (localTransaction) await transaction.rollback();
        throw error;
    }
}

const getGazeById = async (id) => {
    const gazeData = await getGaze(id);
    return ApiResponse(FOUND, gazeData);
};

const getPredictionById = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        const gazeData = await getGaze(id);

        const response = await axios.post(`${process.env.MODEL_PATH}/predict`, gazeData);
        //console.log(response.data.type);

        if (response?.data) {
            const participant = await Participant.findByPk(id, { transaction });
            participant.prediction = response.data?.type;
            participant.predictionConfidence = response.data?.confidence;

            await participant.save({ transaction });
            await transaction.commit();

            return ApiResponse(FOUND, response.data);
        } else {
            throw new RuntimeError(500, "Prediction API call did not return valid data.");
        }
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

// helper
const updateExperimentCount = async (id, transaction) => {
    const participant = Repository.findById(Participant, id);
    participant.expCount += 1;
    await participant.save({ transaction });
}

const getIdsByTypeAndExpCount = async (type, expCount, offset, limit) => {
    return await Participant.findAll({
        where: {
            type,
            exp_count: expCount,
        },
        order: [['id', 'ASC']],
        offset,
        limit,
    });
}

// const getGaze = async (id) => {
//     const experiments = await ExperimentService.getAllByParticipantId(id);
//     const experimentIds = experiments.map(exp => exp.id);

//     return await GazeService.getAllByExperimentIds(experimentIds);
// };

const updatePrediction = async (participant) => {
    try {
        const gazeData = await getGaze(participant.id);

        const response = await axios.post(`${process.env.MODEL_PATH}/predict`, gazeData);
        //console.log(response.data.type);
        participant.prediction = response.data?.type;
        participant.predictionConfidence = response.data?.confidence;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllByPagination,
    getById,
    create,
    update,
    getGazeById,
    updateExperimentCount,
    getIdsByTypeAndExpCount,
    getPredictionById,
};
