
var pool = require('../../utils/mysqlService');

var Utmmedium = function () {};

//Create utmmedium
Utmmedium.prototype.createUtmmedium = async utmmedium => {
  try {
    const connection = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          return reject(err);
        }
        resolve(connection);
      });
    });

    const sql_insert_utmmedium = `INSERT INTO utmmedia (name) value (${connection.escape(utmmedium.name)})`;

    const result = await new Promise((resolve, reject) => {
      connection.query(sql_insert_utmmedium, (err, rows) => {
        connection.release();
        if (err) {
          return reject(err);
        }
        resolve(rows.insertId);
      });
    });

    return result;
  } catch (err) {
    throw err;
  }
};

Utmmedium.prototype.getUtmmediumByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT p.*
    FROM utmmedia as p
    WHERE p.name = ${connection.escape(name)}`;
    connection.query(sql_select, function (err, rows) {
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

Utmmedium.prototype.getUtmmediumDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM utmmedia
    WHERE id = ${connection.escape(id)}`;
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

Utmmedium.prototype.filterUtmmedia = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM utmmedia `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }

    connection.query(sql_select, (err, rows) => {
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

Utmmedium.prototype.countFilterUtmmedia = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM utmmedia `;

    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows[0].count);
    });
  });

  });
}

Utmmedium.prototype.updateUtmmedium = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    var j = 0;
    for (var i in data) {
      if (j == Object.keys(data).length - 1) {
        update_data += `${i} = ${connection.escape(data[i])}`
      } else {
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
      j++;
    }
    var sql_update = `UPDATE utmmedia SET ${update_data} WHERE id = ${connection.escape(id)} `;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.affectedRows);
    });
  });

  });
}

Utmmedium.prototype.deleteUtmmedium = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_utmmedium = `DELETE FROM utmmedia WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete_utmmedium, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.affectedRows);
      });
  });

  });
}

module.exports = new Utmmedium();