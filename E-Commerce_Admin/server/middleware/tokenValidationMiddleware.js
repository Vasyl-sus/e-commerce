var tokenService = require('../utils/token');

var tokenValidationMiddleware = function () {};

/***
* TOKEN VALIDATION MIDDLEWARE
*/
tokenValidationMiddleware.prototype.validate = function (req, res, next) {
  var token = req.session.token; //req.headers.Authorization//req.session.token;
  
  if (!token) {
    res.status(401).json({ success: false, error: "token_required" });
    return;
  }
  try {
    var decoded = tokenService.validateAndDecodeToken('admin', token);
    if (!decoded) {
        res.status(401).json({ success: false, error: "invalid_token" });
        return;
    } else {
        req.admin = decoded;
        next();
    }

  }
  catch (err) {
    logger.error("tokenValidationMiddleware: try-catch - ERROR: "+err.message);
  }

};


module.exports = new tokenValidationMiddleware();