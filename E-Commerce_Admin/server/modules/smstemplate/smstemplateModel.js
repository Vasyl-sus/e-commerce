
var pool = require('../../utils/mysqlService');

var Smstemplate = function () {};

//Create smstemplate
Smstemplate.prototype.createSmstemplate = smstemplate => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_smstemplate = `INSERT INTO smstemplates
    (title, text, country)
    value ( ${connection.escape(smstemplate.title)}, ${connection.escape(smstemplate.text)},
     ${connection.escape(smstemplate.country)})`;

    connection.query(sql_insert_smstemplate, (err, rows) => {
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

Smstemplate.prototype.getSmstemplateDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM smstemplates
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

Smstemplate.prototype.filterSmstemplates = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM smstemplates `;

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
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

Smstemplate.prototype.countFilterSmstemplates = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM smstemplates `;

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

Smstemplate.prototype.updateSmstemplate = (id, data) => {
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
    var sql_update = `UPDATE smstemplates SET ${update_data} WHERE id = ${connection.escape(id)}`;
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

Smstemplate.prototype.deleteSmstemplate = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_smstemplate = `DELETE FROM smstemplates WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete_smstemplate, (err, rows) => {
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

module.exports = new Smstemplate();