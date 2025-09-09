const AsyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);  // Automatically passes errors to next (errorHandler)
};

module.exports = AsyncHandler;