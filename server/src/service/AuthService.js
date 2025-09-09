const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const { default: axios } = require('axios');

const Repository = require('../common/Repository.js');
const sendEmail = require('../config/MailConfig.js');
const sequelize = require('../config/SequelizeConfig.js');
const { User, ResetPasswordToken } = require('../model');
const { USER_STATUS } = require('../utils/Enum.js');
const { NOT_FOUND, SENT, UPDATED } = require('../utils/Messages.js');
const { RuntimeError, isNull, ApiMessageResponse, generatePassword } = require('../utils/Utils.js');
const ParticipantService = require('./ParticipantService.js');
const UserService = require('./UserService.js');

dotenv.config();

const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY;

const EMAIL_DOES_NOT_EXIST = 'User with this email does not exist';
const INCORRECT_PASSWORD = "Password incorrect";

const signup = async (reqBody) => {
  const user = User.build(reqBody);
  await user.validate();

  const existingUser = await UserService.getByEmail(user?.email);
  if (existingUser) {
    throw new RuntimeError(422, 'User with this email already exists');
  }

  return await create(reqBody);
};

const login = async (reqBody) => {
  const user = User.build(reqBody);
  await user.validate({
    fields: ['email', 'password']
  });

  const existingUser = await UserService.getByEmail(user.email);
  if (!existingUser) {
    throw new RuntimeError(422, EMAIL_DOES_NOT_EXIST);
  }

  checkStatus(existingUser);

  const isPasswordValid = await bcrypt.compare(user.password, existingUser.password);
  if (!isPasswordValid) {
    throw new RuntimeError(422, INCORRECT_PASSWORD);
  }

  return getTokens(existingUser);
};

const googleLogin = async (reqBody) => {
  const token = reqBody.token;
  if (isNull(token)) {
    throw new RuntimeError(422, "Token is required");
  }

  let response;
  try {
    response = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      { params: { access_token: token } }
    );
  } catch (err) {
    throw new RuntimeError(401, "Failed to fetch Google user info");
  }

  if (!response.data.verified_email) {
    throw new RuntimeError(403, "Google account email not verified");
  }

  const googleUser = response.data;

  const existingUser = await UserService.getByEmail(googleUser?.email);

  if (!existingUser) {
    googleUser.password = generatePassword(googleUser?.name);
    return await create(googleUser);
  } else {
    checkStatus(existingUser);
    return getTokens(existingUser);
  }
};

const forgotPassword = async (reqBody) => {
  const user = await UserService.getByEmail(reqBody.email);
  if (!user) throw new RuntimeError(404, NOT_FOUND);

  const rawToken = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const transaction = await sequelize.transaction();

  try {
    await ResetPasswordToken.create({
      userId: user.id,
      token: hashedToken,
    }, { transaction });

    await sendEmail(
      reqBody.email,
      'Aspire Password Reset',
      "Use this token below:\n" + rawToken
    );

    await transaction.commit();
    return ApiMessageResponse(SENT);
  } catch (error) {
    await transaction.rollback();
    console.log("Failed to send reset token", error);
    throw error;
  }
}

const resetPassword = async (reqBody) => {
  const { token, password, confirmPassword } = reqBody;
  const transaction = await sequelize.transaction();

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetPasswordToken = await ResetPasswordToken.findOne({
      attributes: ['id'],
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id'],
        },
      ],
      where: {
        token: hashedToken,
        used: false,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      },
      order: [['createdAt', 'DESC']],
      transaction
    });

    if (!resetPasswordToken) throw new RuntimeError(400, "Invalid reset token");
    if (password.lenth < 1 || password.lenth > 8) throw new RuntimeError(422, "Password should be between 1 and 8 characters");
    if (password != confirmPassword) throw new RuntimeError(422, "Password and confirm password doesn't match");

    const hashedPassword = await Repository.hashPassword(password);
    await User.update(
      {
        password: hashedPassword,
      },
      {
        where: { id: resetPasswordToken?.User?.id },
        transaction,
        validate: false
      }
    );

    await resetPasswordToken.update(
      { used: true },
      { transaction }
    );

    await transaction.commit();
    return ApiMessageResponse(UPDATED);
  } catch (error) {
    await transaction.rollback();
    console.log("Failed to reset password", error);
    throw error;
  }
}

//helpers
const create = async (reqBody) => {
  const transaction = await sequelize.transaction();

  try {
    const user = await UserService.create(reqBody, transaction);
    await ParticipantService.create(user.id);
    await transaction.commit();

    return getTokens(user);
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    throw error;
  }
}

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new RuntimeError(401, "Refresh token required");
  }

  try {
    const verifiedUser = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);

    const user = await UserService.getByIdReduced(verifiedUser.id);
    return Repository.generateAccessToken(user);
  } catch (error) {
    throw new RuntimeError(401, "Refresh token also invalid");
  }
};

const getTokens = (user) => {
  const refreshToken = Repository.generateRefreshToken(user);
  const accessToken = Repository.generateAccessToken(user);

  return { accessToken, refreshToken };
}

const AuthResponse = (message, isRefreshTokenValid) => {
  return {
    message,
    refreshTokenValid: isRefreshTokenValid,
  }
}

const checkStatus = (user) => {
  if (user.status != USER_STATUS.ACTIVE && user.status != USER_STATUS.INACTIVE) {
    throw new RuntimeError(422, "User is " + user.status);
  }
}

module.exports = {
  signup,
  login,
  googleLogin,
  refreshAccessToken,
  AuthResponse,
  forgotPassword,
  resetPassword,
};
