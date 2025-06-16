const pool = require('../../utils/mysqlService');

class Payment {
  async updatePaymentAmount(paymentIntentId, amount) {
    try {
      const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          resolve(connection);
        });
      });

      const sql_update = `UPDATE payments
      SET amount = ${amount}
      WHERE setup_intent_id = '${paymentIntentId}'`;

      const result = await new Promise((resolve, reject) => {
        connection.query(sql_update, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new Payment();