var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Subscriber = function () {};

//Create order
Subscriber.prototype.createSubscription = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    
    var sql_insert = `INSERT INTO subscribers
    (email) value (${connection.escape(data.email)}) `;

    connection.query(sql_insert, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
    });
       
  });

  });
}

Subscriber.prototype.activateSubscription = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    
    var sql_update = `UPDATE subscribers SET active=1
    WHERE email=${connection.escape(data.email)} `;

    connection.query(sql_update, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.affectedRows);
    });
       
  });

  });
}

Subscriber.prototype.getSubscriberByEmail = email => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    
    var sql_select = `SELECT * FROM subscribers
    WHERE email=${connection.escape(email)} `;

    connection.query(sql_select, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows[0]);
    });
       
  });

  });
}

Subscriber.prototype.insertVccData = (data, order_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return reject(err);
    }
    
    // Construct the SQL query with proper handling for null order_id
    var orderIdValue = order_id === null ? 'NULL' : connection.escape(order_id);
    
    // Handle empty next_calldate values by converting them to NULL
    var nextCallDateValue = !data.next_calldate || data.next_calldate === '' ? 'NULL' : connection.escape(data.next_calldate);
    
    var sql_insert = `INSERT INTO orders_vcc 
    (display_order_id, direction, source, destination, 
     disposition_type, disposition_name, disposition_assesment, disposition_status,
     disposition_description, disposition_label, disposition_id, disposition_callback,
     next_calldate, create_time, client_data) 
     VALUES 
     (${orderIdValue},${connection.escape(data.direction)},${connection.escape(data.source)},${connection.escape(data.destination)},
      ${connection.escape(data.disposition_type)},${connection.escape(data.disposition_name)},${connection.escape(data.disposition_assesment)},${connection.escape(data.disposition_status)},
      ${connection.escape(data.disposition_description)},${connection.escape(data.disposition_label)},${connection.escape(data.disposition_id)},${connection.escape(data.disposition_callback)},
      ${nextCallDateValue},${connection.escape(data.create_time)},${connection.escape(data.client_data)})`;

    connection.query(sql_insert, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
    });
       
  });

  });
}

Subscriber.prototype.updateOtomsOpened = (otoms_sent_ids, delivery_reminder_ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    var sql_update1 = ` UPDATE otoms_sent SET opened=1, date_opened=now() WHERE id IN (${connection.escape(otoms_sent_ids)}) `;
    var sql_update2 = ` UPDATE delivery_reminders SET opened=1, date_opened=now() WHERE mail_id IN (${connection.escape(delivery_reminder_ids)}) `;
    
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(otoms_sent_ids && otoms_sent_ids.length>0){
        queries.push(connection.query(sql_update1));
      }
      if(delivery_reminder_ids && delivery_reminder_ids.length>0){
        queries.push(connection.query(sql_update2));
      }
      return bluebird.all(queries);
    }).then((results) => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(true);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
          connection.release();
          return reject(err);
      });
    }); 
  });
  });
}

module.exports = new Subscriber();
