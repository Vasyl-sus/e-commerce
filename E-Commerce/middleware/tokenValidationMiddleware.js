var pool = require('../utils/mysqlService');
var tokenService = require('../utils/token');

var tokenValidationMiddleware = function () {
};

/***
* TOKEN VALIDATION MIDDLEWARE
*/
function getSession(session_id) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        logger.error("tokenValidationMiddleware: getSession: pool.getConnection - ERROR: " + err.message);
        return reject(err);
      }
      var sql_select = `SELECT *
      FROM sessions_admin
      WHERE session_id = ${connection.escape(session_id)} `;

      connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          logger.error("tokenValidationMiddleware: getSession: connection.query - ERROR: " + err.message);
          return reject(err);
        }
        resolve(rows[0]);
      });
    });
  });
}

tokenValidationMiddleware.prototype.validate = function (req, res, next) {
  var session_id = req.headers['authorization'];

  getSession(session_id).then(result => {
    var data = result && result.data || "{}";
    if (data) {
      try {
        data = JSON.parse(data);
      } catch (err) {
        logger.error("tokenValidationMiddleware: validate: JSON.parse - ERROR: " + err.message);
      }
    }
    var token = data.token;
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

    } catch (err) {
      logger.error("tokenValidationMiddleware: validate: try-catch - ERROR: " + err.message);
    }
  }).catch(err1 => {
    logger.error("tokenValidationMiddleware: validate: .catch - ERROR: " + err1.message);
    res.status(500).json({ success: false, error: err1.message });
    return;
  });

};

module.exports = new tokenValidationMiddleware();