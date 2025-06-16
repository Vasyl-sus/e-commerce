
var pool = require('../../utils/mysqlService');

var GoogleSheetOrder = function () {};

GoogleSheetOrder.prototype.getOrderById = async (orderId) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT 
          o.order_id2,
          o.shipping_country,
          SUM(o.initial_order_value/o.currency_value) as initial_order_value,
          SUM(o.upsell_value/o.currency_value) as upsell_value,
          SUM(o.total/o.currency_value) as total_value,
          o.responsible_agent_username,
          o.order_type,
          os.name as order_status
        FROM orders as o 
        LEFT JOIN orderstatuses as os on o.order_status = os.id
        WHERE order_id2 = ${orderId}`;
    connection.query(sql_select, async (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }

      try {
        resolve(rows[0]);
      } catch (error) {
        console.error('Error creating spreadsheet:', error);
        reject(err);
      }
    });
  });

  });
};

module.exports = new GoogleSheetOrder();