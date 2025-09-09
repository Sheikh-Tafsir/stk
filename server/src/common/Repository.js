const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { uploadToCloudinary } = require('../config/CloudinaryConfig');
const { textOnly } = require('../config/GeminiConfig');
const sequelize = require('../config/SequelizeConfig');
const { reduceImageBySize } = require('../utils/ImageUtils');
const { FOUND, CREATED, NOT_FOUND } = require('../utils/Messages');
const { RuntimeError, ApiResponse, isNull, SALT_ROUNDS } = require('../utils/Utils');

const TABLE_PAGINATION_SIZE = 10;
const MAX_VIDEO_CHUNK_SIZE = 1024 * 1024;
const FILES_FOLDER_LOCATION = '../../files';

const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

const findById = async (model, id) => {
    const entity = await model.findByPk(id);

    if (!entity) {
        throw new RuntimeError(404, NOT_FOUND);
    }

    return entity;
}

const findAllByPagination = async (model, options = {}) => {
    const {
        page = 1,
        limit = TABLE_PAGINATION_SIZE,
        search = null,
        searchFields = [],
        order = [['createdAt', 'DESC']],
        include = [],
        attributes = null
    } = options

    const filters = typeof options?.filters === 'string' ? JSON.parse(options?.filters) : options?.filters;
    const offset = (page - 1) * limit;

    const searchCondition = search && searchFields.length > 0 ?
        {
            [Op.or]: searchFields.map(field => ({
                [field]: {
                    [Op.iLike]: `%${search}%`
                }
            }))
        } : {};

    const where = {
        ...filters, ...searchCondition
    }

    const result = await model.findAndCountAll({
        where,
        limit,
        offset,
        order,
        include,
        ...(attributes && { attributes }),
    });

    const totalPage = Math.ceil(result.count / limit);
    return {
        rows: result.rows,
        totalPages: totalPage >= 1 ? totalPage : 1,
    };
}

const create = async (model, reqBody) => {
    const transaction = await sequelize.transaction();

    try {
        const entity = await model.create({ ...reqBody }, { transaction });

        await transaction.commit();
        return entity;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const update = async (model, id, reqBody) => {
    const transaction = await sequelize.transaction();

    try {
        const entity = await model.findByPk(id, { transaction });
        if (!entity) {
            throw new RuntimeError(404, NOT_FOUND);
        }

        entity.set(reqBody);
        await entity.save({ transaction });

        await transaction.commit();
        return entity;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const remove = async (model, id) => {
    const transaction = await sequelize.transaction();

    try {
        const deletedCount = await model.destroy({
            where: { id },
            transaction
        });

        if (deletedCount === 0) {
            throw new RuntimeError(404, NOT_FOUND);
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

const uploadImage = async (image) => {
    if (!image) {
        throw RuntimeError(500, "Image not uploaded");
    }

    const reducedBuffer = await reduceImageBySize(image.buffer);
    const uploaded = await uploadToCloudinary(reducedBuffer);
    const imageUrl = uploaded.secure_url;
    // console.log("image url: ", imageUrl);
    return ApiResponse(FOUND, imageUrl);
}

const generateStory = async (reqBody) => {
    var prompt = "generate a children story.";
    if (reqBody?.prompt) prompt = prompt + `The story should have something like ${reqBody.propmt}`;

    let rawResponse = await textOnly(prompt);
    if (!rawResponse) throw new Error(SOMETHING_WENT_WRONG);

    return ApiResponse(CREATED, rawResponse);
}

const streamVideo = async (filename, range) => {
    console.log("1");
    const filePath = path.join(__dirname, FILES_FOLDER_LOCATION, filename);

    if (!fs.existsSync(filePath)) {
        console.log("2");
        throw new RuntimeError(404, 'VIDEO_NOT_FOUND');
    }

    console.log("3" + range);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    console.log("4" + range);
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + MAX_VIDEO_CHUNK_SIZE, fileSize) - 1;
    //const end = parts[1] ? parseInt(parts[1], 10) : fileSize -1;
    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(filePath, { start, end });

    return {
        statusCode: 206,
        headers: {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/webm',
        },
        stream,
    };
};

const downloadFile = (reqQuery) => {
    const requestedFile = reqQuery.filename;

    if (!requestedFile) throw new RuntimeError(422, 'Missing filename.');

    // ✅ Prevent path traversal attacks (e.g., ../../etc/passwd)
    const safeFileName = path.basename(requestedFile);

    // 🔒 You might want to whitelist allowed extensions or names
    const filePath = path.join(__dirname, FILES_FOLDER_LOCATION, safeFileName);

    if (!fs.existsSync(filePath)) {
        throw new RuntimeError(404, 'File not found');
    }

    return { filePath, fileName: safeFileName };
};

const hashPassword = async (password) => {
  if (isNull(password)) return;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

const generateAccessToken = (user) => {
  return jwt.sign(toPlainUser(user), ACCESS_TOKEN_SECRET_KEY, { expiresIn: '6h', noTimestamp: true });
};

const generateRefreshToken = (user) => {
  return jwt.sign(toPlainUser(user), REFRESH_TOKEN_SECRET_KEY, { expiresIn: '7d' });
};

const toPlainUser = (user) => {
  return user.get({ plain: true });
}

module.exports = {
    findById,
    findAllByPagination,
    create,
    update,
    remove,
    uploadImage,
    generateStory,
    streamVideo,
    downloadFile,
    hashPassword,
    generateAccessToken,
    generateRefreshToken,
}