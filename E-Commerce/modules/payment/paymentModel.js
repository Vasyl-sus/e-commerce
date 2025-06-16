var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Payment = function () {};

Payment.prototype.getPaymentById = (id) => {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      var sql_select = `SELECT p.*
      FROM payments as p
      WHERE p.order_id = ${connection.escape(id)}`;
      connection.query(sql_select, function (err, rows) {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
      });
    });
  });
}

module.exports = new Payment();