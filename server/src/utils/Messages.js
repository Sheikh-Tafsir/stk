const lengthValidationMessage = (min, max) => {
    if (min && max) return `Should be between ${min} and ${max} characters`;
    if (!min && max) return `Should be less than ${max} characters`;
    if (min && !max) return `Should be more than ${min} characters`;
    return null;
};

const intValueValidationMessage = (min, max) => {
    if (min && max) return `Value should be between ${min} and ${max}`;
    if (min && !max) return `Value should be more than ${min}`;
    if (!min && max) return `Value should be less than ${max}`;
    return null;
};

// Validation Messages
const IS_REQUIRED = "Required";
const IS_NUMERIC = "Should contain only numbers";
const UNSUPPORTED_IMAGE_FORMAT = "Unsupported image format";
const ALREADY_EXISTS = "Already exists"

// Response Messages
const NOT_FOUND = "Not Found";
const FOUND = "Found";
const CREATED = "Created successfully";
const UPDATED = "Updated successfully";
const DELETED = "Deleted successfully";
const FAILED = "Failed"
const RECIEVED = "Received";
const SENT = "Sent";

// Error Messages
const ACCESS_TOKEN_REQUIRED = "Access Token required or expired";
const REFRESH_TOKEN_REQUIRED = "Refresh token required or expired";
const ACCESS_AND_REFRESH_TOKEN_REQUIRED = "Access and Refresh token required or expired";
const UNAUTHORIZED = "Unauthorized";
const SOMETHING_WENT_WRONG = "Something went wrong";
const COULD_NOT_PROCESS = "Could not process";
const FORBIDDEN_ACCESS = "Accesss denied to user"
const AUTHORIZATION_ERROR = "User don’t have permission to access this resource"

module.exports = {
    lengthValidationMessage,
    intValueValidationMessage,
    IS_REQUIRED,
    IS_NUMERIC,
    UNSUPPORTED_IMAGE_FORMAT,
    ALREADY_EXISTS,
    NOT_FOUND,
    FOUND,
    CREATED,
    UPDATED,
    DELETED,
    FAILED,
    RECIEVED,
    SENT,
    ACCESS_TOKEN_REQUIRED,
    REFRESH_TOKEN_REQUIRED,
    ACCESS_AND_REFRESH_TOKEN_REQUIRED,
    UNAUTHORIZED,
    SOMETHING_WENT_WRONG,
    COULD_NOT_PROCESS,
    FORBIDDEN_ACCESS,
    AUTHORIZATION_ERROR,
};
