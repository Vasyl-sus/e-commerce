var pool = require('../../utils/mysqlService');

var Notification = function () {};

Notification.prototype.createNotification = (data) => {
  return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
          if (err) {
              console.log(err);
              return reject(err);
          }
          var sql_insert = `INSERT INTO notifications(id, type, date_created, content, for_who) VALUES(${connection.escape(data.id)}, ${connection.escape(data.type)}, now(), ${connection.escape(data.content)}, (select ag.id from admingroups as ag where ag.name = ${connection.escape(data.forWho)}))`;
          console.log(sql_insert);
          connection.query(sql_insert, (err, rows) => {
              connection.release();
              if (err) {
                  console.log(err);
                  return reject(err);
              } else {
                  resolve();
              }
          });
      });
  });
};

module.exports = new Notification();