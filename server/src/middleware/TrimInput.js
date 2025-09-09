const TrimInput = (req, res, next) => {

    const trimAndConvert = (value) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
      }
      return value;
    };
  
    // Process `req.body`
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
          req.body[key] = trimAndConvert(req.body[key]);
        }
      }
    }
  
    // Process `req.query`
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (req.query.hasOwnProperty(key)) {
          req.query[key] = trimAndConvert(req.query[key]);
        }
      }
    }
  
    // Process `req.params`
    if (req.params && typeof req.params === 'object') {
      for (const key in req.params) {
        if (req.params.hasOwnProperty(key)) {
          req.params[key] = trimAndConvert(req.params[key]);
        }
      }
    }
  
    next();
  };
  
  module.exports = TrimInput;