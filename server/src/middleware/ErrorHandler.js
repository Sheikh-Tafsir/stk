const { SOMETHING_WENT_WRONG } = require("../utils/Messages");
const { ApiMessageResponse } = require("../utils/Utils");

const ErrorHandler = (err, req, res, next) => {
    console.error('ErrorHandler caught:', err);

    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    if (err.status == 401) {
        return res.status(err.status).json(ApiMessageResponse("Authentication Required"));
    }

    if (err.status == 404) {
        return res.status(err.status).json(ApiMessageResponse("Resource Not Found"));
    }

    if (err.status == 422) {
        return res.status(err.status).json(ApiMessageResponse(err.message || SOMETHING_WENT_WRONG));
    }

    if (err.errors && Array.isArray(err.errors)) {
        const validationErrors = err.errors.reduce((acc, error) => {
            if (!acc[error.path]) {
                acc[error.path] = error.message;
            }
            return acc;
        }, {});

        return res.status(422).json(validationErrors);
    }

    return res.status(err.status || 500).json(ApiMessageResponse(SOMETHING_WENT_WRONG));
};

module.exports = ErrorHandler 