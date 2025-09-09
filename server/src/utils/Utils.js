const { format } = require("date-fns");
const { UserRole } = require("./Enum");

const TABLE_PAGINATION_SIZE = 10;

const SALT_ROUNDS = 10;

const TOTAL_EXPERIMENTS = 2;

const FREEMIUM_USAGE_PARTICIPANT_LIMIT = 1;

const MAX_PARTICIPANT_COUNT = 20;

const REGULAR_DATE_FORMAT = "dd-MM-yyyy";

const INVERSE_DATE_FORMAT = "yyyy-MM-dd";

const REGULAR_TIME_FORMAT_12 = "hh:mm a";

const REGULAR_TIME_FORMAT_24 = "HH:mm";

const USER_IMAGE_PLACEHOLDER = "https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=";

const pageCount = (rowCount) => {
    return Math.floor((rowCount + TABLE_PAGINATION_SIZE - 1) / TABLE_PAGINATION_SIZE);
}

const isNull = (value) => {
    return !value || value == null || value == "" || value == undefined;
}

const isNotNull = (value) => {
    return !isNull(value);
}

const isString = (value) => {
    return typeof value === 'string';
}

class RuntimeError extends Error {
    constructor(status, message) {
        console.log("error: " + message);

        super(message);
        this.status = status;
        this.name = 'RuntimeError';
    }
}

const ApiResponse = (message, data) => {
    return {
        message,
        data
    }
}

const ApiMessageResponse = (message) => {
    return {
        message,
    }
}

const ApiErrorResponse = (message) => {
    return {
        message,
    }
}

const ApiResponseUtil = (status, message, data) => {
    return {
        status,
        message,
        data
    }
}

const isNewEntity = (reqBody) => {
    if (reqBody?.id) return false;
    else return true
}

const isFreemiumUser = (user) => {
    return user.role != UserRole.USER || (user.role == UserRole.USER && user.participantCount < FREEMIUM_USAGE_PARTICIPANT_LIMIT);
}

const changeImageByteToBase64 = (imageByte) => {
    const buffer = Buffer.from(imageByte);
    return "data:image/jpeg;base64," + buffer.toString('base64');
}

const generatePassword = (name) => {
    if (!name || name.length < 3) {
        throw new Error("Name must be at least 3 characters long");
    }

    // Take first 3 and last 3 letters (case insensitive)
    const firstPart = name.substring(0, 3);
    const lastPart = name.substring(name.length - 3);

    // Generate random 2-digit number (10–99)
    const randomNum = Math.floor(10 + Math.random() * 90);

    return `${firstPart}${lastPart}${randomNum}`;
}

const formateDateToRegular = (date) => {
    return format(date, REGULAR_DATE_FORMAT);
}

const isAdmin = (role) => {
    return role == UserRole.ADMIN || role == UserRole.SUPER_ADMIN
}

module.exports = {
    TABLE_PAGINATION_SIZE,
    SALT_ROUNDS,
    TOTAL_EXPERIMENTS,
    FREEMIUM_USAGE_PARTICIPANT_LIMIT,
    MAX_PARTICIPANT_COUNT,
    USER_IMAGE_PLACEHOLDER,
    pageCount,
    isNull,
    isNotNull,
    isString,
    RuntimeError,
    ApiResponse,
    ApiMessageResponse,
    ApiErrorResponse,
    ApiResponseUtil,
    isFreemiumUser,
    byteToBase64: changeImageByteToBase64,
    generatePassword,
    formateDateToRegular,
    isAdmin,
}