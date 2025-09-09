const E2ee = require('../model/E2ee');

const getByUserId = (userId) => {
    return E2ee.findOne({
        where: {
            userId
        }
    })
};

const create = async (publicKey, privateKey, iv, salt, userId, transaction) => {
    return await E2ee.create({
        publicKey,
        privateKey,
        iv,
        salt,
        userId
    }, { transaction });
}

module.exports = {
    getByUserId,
    create,
}