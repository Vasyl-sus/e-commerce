
var pool = require('../../utils/mysqlService');

var Settings = function () {};

Settings.prototype.getSettings = () => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT data
    FROM miscellaneous
    WHERE name = 'settings'`;
    connection.query(sql_select, function (err, rows) {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      try{
        resolve(JSON.parse(rows[0].data));
      } catch(ex){
        reject(new Error("getSettings - JSON.parse: " + ex.message));
      }
    });
  });

  });
}

Settings.prototype.editSettings = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `UPDATE miscellaneous 
    SET data=${connection.escape(data)}
    WHERE name='settings' `;
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

module.exports = new Settings();