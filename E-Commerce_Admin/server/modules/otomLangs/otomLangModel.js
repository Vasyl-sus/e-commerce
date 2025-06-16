
var pool = require('../../utils/mysqlService');

var OtomLang = function () {};

//Create otom
OtomLang.prototype.createOtomLang = otom_lang => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    
    var sql_insert_otom = ` INSERT INTO otoms_languages (
        lang, title, data
    ) value (
        ${connection.escape(otom_lang.lang)}, ${connection.escape(otom_lang.title)}, ${connection.escape(otom_lang.data)}
    ) `;

    connection.query(sql_insert_otom, (err, rows) => {
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


OtomLang.prototype.getOtomLangDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM otoms_languages
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

OtomLang.prototype.filterOtomLangs = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT * from otoms_languages WHERE id IS NOT NULL `;

    if(data.lang){
        sql_select += `AND lang=${connection.escape(data.lang)} `;
    }
    
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

OtomLang.prototype.countFilterOtomLangs = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM otoms_languages WHERE id IS NOT NULL `;

    if(data.lang){
        sql_select += `AND lang=${connection.escape(data.lang)} `;
    }

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

OtomLang.prototype.updateOtomLang = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var update_data = "";
    for (var i in data) {
        update_data += `${i} = ${connection.escape(data[i])}, `
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }
    
    //console.log(update_data);
    var sql_update = `UPDATE otoms_languages SET ${update_data} WHERE id = ${connection.escape(id)}`;

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

OtomLang.prototype.deleteOtomLang = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM otoms_languages WHERE id = ${connection.escape(id)} `;
    
    connection.query(sql_delete, (err, rows) => {
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

module.exports = new OtomLang();