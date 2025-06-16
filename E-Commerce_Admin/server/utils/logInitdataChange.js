const pool = require('./mysqlService');

class LogInitdataChange {
  async write() {
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

      const sql_update = `UPDATE local_storage_version SET version_counter = version_counter + 1`;

      const result = await new Promise((resolve, reject) => {
        connection.query(sql_update, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows.affectedRows);
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async get() {
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

      const sql_select = `SELECT version_counter FROM local_storage_version LIMIT 1`;

      const result = await new Promise((resolve, reject) => {
        connection.query(sql_select, (err, rows) => {
          connection.release();
          if (err) {
            return reject(err);
          }
          resolve(rows[0]);
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LogInitdataChange();