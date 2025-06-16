
var pool = require('../../utils/mysqlService');

var Color = function () {};

Color.prototype.createColor = color => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_color = `INSERT INTO colors
    (description, value)
    value ( ${connection.escape(color.description)}, ${connection.escape(color.value)}) `;

    connection.query(sql_insert_color, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows.insertId);
      });
  });

  });
};

Color.prototype.getColorDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM colors
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

Color.prototype.getColorByDescription = description => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT *
      FROM colors
      WHERE description = ${connection.escape(description)}`;
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

Color.prototype.getColors = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM colors `;

    if (!data.from) {
      data.from = 0;
    }

    sql_select += `limit ${data.from}, 20`
    //console.log(sql_select);
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

Color.prototype.countGetColors = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM colors `;

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

Color.prototype.deleteColor = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_color = `DELETE FROM colors WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete_color, (err, rows) => {
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


module.exports = new Color();