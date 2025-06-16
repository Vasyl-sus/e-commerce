var pool = require('../utils/mysqlService');
var logger = require('../utils/logger')

var couponMiddleware = function () {};

/***
* Coupon MIDDLEWARE
*/
function selectCoupon(data) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                logger.error("couponMiddleware: pool.getConnection - ERROR: " + err.message);
                return reject(err);
            }
            var sql_select_coupon = `select d.* from discountcodes as d where d.name="${data}"`;
            connection.query(sql_select_coupon, (err, rows) => {
                connection.release();
                if (err) {
                    logger.error("utmMiddleware: insertUtm: connection.query - ERROR: " + err.message);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    });
}

couponMiddleware.prototype.handleCoupon = function (req, res) {
    try {
        if (req.query && req.query.coupon) {
            selectCoupon(req.query.coupon).then(result => {
                if (req.session && req.session.cart && result.length > 0) {
                    req.session.cart.discountData = result[0];
                    req.session.cart.recalculate = true;
                }
                return;
            }).catch(err => {
                logger.error("couponMiddleware: handleUtm: selectCoupon - ERROR: " + err.message);
                return;
            });
        }
        return;

    } catch (err) {
        console.log(err);
        logger.error("couponMiddleware: try-catch - ERROR: " + err.message);
        return;
    }
};

module.exports = new couponMiddleware();