
var pool = require('../../utils/mysqlService');

var Notification = function () {};

Notification.prototype.getNotificationsByUserGroup = (criteria,limit) => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_insert = `SELECT n.id, n.type, n.date_created, n.content, n.for_who, n.seen FROM notifications as n INNER JOIN admingroups as ag ON n.for_who = ag.name AND ag.name = ${connection.escape(criteria)} LIMIT ${limit},5`;

      connection.query(sql_insert, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
    });
}

Notification.prototype.getNotificationsCountByUserGroup = (criteria) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT count(distinct n.id) as allCount, sum(CASE WHEN n.seen = 0 THEN 1 ELSE 0 END) unreadCount
                      FROM notifications as n 
                      INNER JOIN admingroups as ag ON n.for_who = ag.name AND ag.name =${connection.escape(criteria)};`;

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

Notification.prototype.markNotificationAsRead = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_update = `UPDATE notifications SET seen = 1 WHERE id = ${connection.escape(id)}`;

    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
  });
}

module.exports = new Notification();