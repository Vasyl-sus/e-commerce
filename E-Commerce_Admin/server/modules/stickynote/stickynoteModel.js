
var pool = require('../../utils/mysqlService');

var Stickynote = function () {};

Stickynote.prototype.createStickyNote = stickynote => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    if(stickynote.from_date){
      stickynote.from_date = new Date(stickynote.from_date);
      stickynote.from_date = connection.escape(stickynote.from_date);
    } else {
      stickynote.from_date="NOW()";
    }
    if(stickynote.to_date){
      stickynote.to_date=new Date(stickynote.to_date);
    }

    var sql_insert = `INSERT INTO sticky_notes
    (active, content, link, country, button_text, language, from_date, to_date, has_button)
    value (${connection.escape(stickynote.active)}, ${connection.escape(stickynote.content)},
     ${connection.escape(stickynote.link)}, ${connection.escape(stickynote.country)}, 
     ${connection.escape(stickynote.button_text)}, ${connection.escape(stickynote.language)},
     ${stickynote.from_date}, ${connection.escape(stickynote.to_date)}, ${connection.escape(stickynote.has_button)}) `;

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
};

Stickynote.prototype.getStickyNoteByCountryAndLang = (country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM sticky_notes
    WHERE country = ${connection.escape(country)}
    AND language = ${connection.escape(lang)}; `;

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

Stickynote.prototype.getStickyNoteDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM sticky_notes
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

Stickynote.prototype.filterStickyNotes = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM sticky_notes `;

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

Stickynote.prototype.countFilterStickyNotes = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM sticky_notes `;

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

Stickynote.prototype.updateStickyNote = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    if(data.from_date){
      data.from_date=new Date(data.from_date);
    }
    if(data.to_date){
      data.to_date=new Date(data.to_date);
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
    var sql_update = `UPDATE sticky_notes SET ${update_data} WHERE id = ${connection.escape(id)}`;
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

Stickynote.prototype.deleteStickyNote = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM sticky_notes WHERE id = ${connection.escape(id)} `;
    
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

module.exports = new Stickynote();