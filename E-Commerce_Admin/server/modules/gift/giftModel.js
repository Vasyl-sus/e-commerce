
var pool = require('../../utils/mysqlService');

var Gift = function () {};

//Create gift
Gift.prototype.createGift = gift => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_gift = `INSERT INTO gifts
    (name, display_name, active, country, lang)
    value ( ${connection.escape(gift.name)}, ${connection.escape(gift.display_name)}, ${connection.escape(gift.active)},
    ${connection.escape(gift.country)}, ${connection.escape(gift.lang)})`;

    connection.query(sql_insert_gift, (err, rows) => {
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

Gift.prototype.createGiftConfigurator = gift => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_gift = `INSERT INTO gift_configurator
    (country, price, count, num_therapies)
    value ( ${connection.escape(gift.country)}, ${connection.escape(gift.price)}, ${connection.escape(gift.count)}, ${connection.escape(gift.num_therapies)})`;

    connection.query(sql_insert_gift, (err, rows) => {
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

Gift.prototype.getGiftDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM gifts
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

Gift.prototype.getGiftByName = name => {
    return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      var sql_select = `SELECT *
      FROM gifts
      WHERE name = ${connection.escape(name)}`;
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

Gift.prototype.getGiftByDisplayNameCountryLang = (display_name, country, lang) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM gifts
    WHERE display_name = ${connection.escape(display_name)}
    AND country = ${connection.escape(country)}
    AND lang = ${connection.escape(lang)}`;
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

Gift.prototype.filterGifts = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM gifts WHERE id IS NOT NULL `;

    if (data.active) {
        sql_select += `AND active=${connection.escape(data.active)} `;
    }
    if (data.country) {
      sql_select += `AND country=${connection.escape(data.country)} `;
    }
    if (data.lang) {
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

Gift.prototype.filterGiftsConfigurator = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM gift_configurator WHERE id IS NOT NULL `;

    if (data.country) {
      sql_select += `AND country=${connection.escape(data.country)} `;
    }

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

Gift.prototype.countFilterGifts = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM gifts WHERE id IS NOT NULL `;

    if (data.active) {
      sql_select += `AND active=${connection.escape(data.active)} `;
    }
    if (data.country) {
      sql_select += `AND country=${connection.escape(data.country)} `;
    }
    if (data.lang) {
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

Gift.prototype.countFilterGiftsConfigurator = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM gift_configurator WHERE id IS NOT NULL `;

    if (data.country) {
      sql_select += `AND country=${connection.escape(data.country)} `;
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

Gift.prototype.updateGift = (id, data) => {
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
    var sql_update = `UPDATE gifts SET ${update_data} WHERE id = ${connection.escape(id)}`;
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

Gift.prototype.updateGiftConfigurator = (id, data) => {
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
    var sql_update = `UPDATE gift_configurator SET ${update_data} WHERE id = ${connection.escape(id)}`;
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

Gift.prototype.deleteGift = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_gift = `DELETE FROM gifts WHERE id = ${connection.escape(id)} `;

    connection.query(sql_delete_gift, (err, rows) => {
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

Gift.prototype.deleteGiftConfigurator = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_gift = `DELETE FROM gift_configurator WHERE id = ${connection.escape(id)} `;

    connection.query(sql_delete_gift, (err, rows) => {
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
module.exports = new Gift();
