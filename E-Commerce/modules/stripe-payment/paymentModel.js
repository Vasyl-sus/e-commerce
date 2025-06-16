var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Payment = function() {};

Payment.prototype.paymentIntent = order => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      var createRecord = `INSERT INTO payments (amount, payment_intent_id, customer_id, setup_intent_id, order_id, order_id2, created ) values (${connection.escape(order.total*100)}, ${connection.escape(order.id)}, ${connection.escape(order.customer)}, ${connection.escape(order.setupIntentId)}, ${connection.escape(order.order_id)}, ${connection.escape(order.order_id2)}, ${connection.escape(order.created)});`;
      var queries = [];
      connection.query = bluebird.promisify(connection.query);
      queries.push(connection.query(createRecord));
      bluebird.all(queries)
      .then(results => {
        return connection.commit()
      })
      .then(() => {
        connection.release()
        resolve()
        return
      })
      .catch(err => {
        return connection.rollback().then(() => {
          connection.release()
          reject(err)
          return
        })
      })
    });
  });
}

module.exports = new Payment();