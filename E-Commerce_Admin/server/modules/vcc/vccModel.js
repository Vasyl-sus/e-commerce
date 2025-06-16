
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Vcc = function () {};

Vcc.prototype.insertVccData = data => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var sql_insert = `INSERT INTO orders_vcc
      (display_order_id, direction, source, destination,
       disposition_type, disposition_name, disposition_assesment, disposition_status,
       disposition_description, disposition_label, disposition_id, disposition_callback,
       next_calldate, create_time, agent_description)
       VALUES
       (${connection.escape(data.display_order_id)},${connection.escape(data.direction)},${connection.escape(data.source)},${connection.escape(data.destination)},
        ${connection.escape(data.disposition_type)},${connection.escape(data.disposition_name)},${connection.escape(data.disposition_assesment)},${connection.escape(data.disposition_status)},
        ${connection.escape(data.disposition_description)},${connection.escape(data.disposition_label)},${connection.escape(data.disposition_id)},${connection.escape(data.disposition_callback)},
        ${connection.escape(data.next_calldate)},${connection.escape(data.create_time)},${connection.escape(data.agent_description)})`;

      connection.query(sql_insert, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.insertId);
      });

    });

    });
}

Vcc.prototype.insertVccLoginData = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert = `INSERT INTO vcc_login
    (vcc_username, project_id)
    VALUES
    (${connection.escape(data.vcc_username)},${connection.escape(data.project_id)})`;

    connection.query(sql_insert, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.insertId);
    });

  });

  });
}

Vcc.prototype.getCallDataByOrderId = id => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      var sql_select = `SELECT o.order_id2, c.*
                        FROM orders as o
                        INNER JOIN customers as c ON c.id=o.customer_id
                        WHERE o.id = ${connection.escape(id)}`;

      connection.query(sql_select, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          resolve(rows[0]);
      });

    });

    });
}


function findTotalInData(data){
  var searchString = '"total":';
  var n = searchString.length;
  var x = data.indexOf(searchString);
  if(x>-1 && x<data.length-n){
      var numberString="";
      var possible = "1234567890."
      var i = x + n;
      while(possible.indexOf(data.charAt(i))!=-1){
          numberString+=data.charAt(i);
          i++;
      }
      return parseFloat(numberString);
  }
  return null;
}

Vcc.prototype.getAgentReport = admin_id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_select1 = `SELECT COUNT(ov.id) AS Skupaj,
                      SUM(CASE WHEN ov.disposition_description = 'Unreached' THEN 1 ELSE 0 END) AS Unreached,
                      SUM(CASE WHEN ov.disposition_description = 'Reached' THEN 1 ELSE 0 END) AS Reached,
                      SUM(CASE WHEN ov.disposition_description = 'Successful' THEN 1 ELSE 0 END) AS Successful
                      FROM orders_vcc AS ov
                      INNER JOIN orders AS o ON o.order_id2=ov.display_order_id
                      WHERE o.responsible_agent_id = ${connection.escape(admin_id)}`;

    var sql_select2 = `SELECT oh.*
                      FROM orderhistory AS oh
                      WHERE oh.isUpsale = 1
                      AND oh.responsible_agent_id = ${connection.escape(admin_id)}
                      ORDER BY oh.order_id, oh.date_added`;

    var sql_select3 = `SELECT AVG(o.total) AS Average_order_value
                      FROM orders AS o
                      WHERE o.responsible_agent_id = ${connection.escape(admin_id)}`;


    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select1));
      queries.push(connection.query(sql_select2));
      queries.push(connection.query(sql_select3));
      return bluebird.all(queries);
    }).then((results) => {
      //return connection.commit();
      var data = results[0][0];

      var ordersCount=0;
      var orders = {};
      for(var i=0;i<results[1].length;i++){
          var total = findTotalInData(results[1][i].data);
          if(!orders[results[1][i].order_id]){
              orders[results[1][i].order_id]={
                  admin_id: results[1][i].admin_id,
                  total: total,
                  upsale: 0
              };
              ordersCount++;
          } else if(total!=null) {
              var diff = total - orders[results[1][i].order_id].total;
              orders[results[1][i].order_id].upsale += diff;
              orders[results[1][i].order_id].total = total;
          }
      }
      var sumUpsale=0;
      for(var k in orders){
        if(orders[k].upsale<0){
          orders[k].upsale=0;
        }
        sumUpsale += orders[k].upsale;
      }

      data["Average_order_value"] = results[2][0].Average_order_value;
      data["Average_upsale"] = sumUpsale/ordersCount;

      for(var k in data){
        if(!data[k]) data[k]=0;
      }

      return data;
    }).then((result) => {
      connection.release();
      resolve(result);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });

  });

  });
}

Vcc.prototype.getLastProjectLogin = vcc_username => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_select = `SELECT * FROM vcc_login WHERE vcc_username = ${connection.escape(vcc_username)}
                      ORDER BY date_added DESC LIMIT 0,1 `;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows[0]);
    });

  });

  });
}

module.exports = new Vcc();
