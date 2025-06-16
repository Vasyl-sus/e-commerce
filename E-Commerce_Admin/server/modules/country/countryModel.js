
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Country = function () {};

Country.prototype.createCountry = country => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_country = `
      INSERT INTO countries (
        id, name, 
        full_name, ddv, 
        country_number, send_reminders
      ) value (
        ${connection.escape(country.id)}, ${connection.escape(country.name)}, 
        ${connection.escape(country.full_name)}, ${connection.escape(country.ddv)}, 
        ${connection.escape(country.country_number)}, ${connection.escape(country.send_reminders)}
      )`;

    var sql_insert_cc = `INSERT INTO currencies_countries
    (currency_id, country_id)
    value (${connection.escape(country.currency_id)}, ${connection.escape(country.id)}) `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_country));
      queries.push(connection.query(sql_insert_cc));
      return bluebird.all(queries);
    }).then(() => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(country.id);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  });

  });
};

Country.prototype.getCountryDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM countries
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

Country.prototype.getCountryByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM countries
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

Country.prototype.getCountriesByNames = names => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM countries
    WHERE name IN (${connection.escape(names)})`;
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

Country.prototype.filterCountries = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT co.*, cu.name as currency_name, cu.code, cu.symbol, cu.value
    FROM countries as co
    INNER JOIN currencies_countries as cc ON co.id=cc.country_id
    INNER JOIN currencies as cu ON cu.id=cc.currency_id `;

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

Country.prototype.countFilterCountries = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(co.id) as count
    FROM countries as co
    INNER JOIN currencies_countries as cc ON co.id=cc.country_id
    INNER JOIN currencies as cu ON cu.id=cc.currency_id`;

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

Country.prototype.updateCountry = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    for (var i in data) {
      if(i!="currency_id"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }
    var sql_update = `UPDATE countries SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var sql_delete = `DELETE FROM currencies_countries WHERE country_id=${connection.escape(id)} `;
    var sql_insert = `INSERT INTO currencies_countries 
    (currency_id, country_id)
    value (${connection.escape(data.currency_id)}, ${connection.escape(id)}) `;

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.currency_id){
        queries.push(connection.query(sql_delete));
        queries.push(connection.query(sql_insert));
        x=1;
      }
      return bluebird.all(queries);
    }).then((results) => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(x);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  });

  });
}

Country.prototype.deleteCountry = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_country = `DELETE FROM countries WHERE id = ${connection.escape(id)} AND name<>'SI' `;
    var sql_delete_cc = `DELETE FROM currencies_countries WHERE country_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_cc));
      queries.push(connection.query(sql_delete_country));
      return bluebird.all(queries);
    }).then((results) => {
      x = results[1].affectedRows;
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(x);
      return;
    }).catch(err => {
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  });

  });
}


module.exports = new Country();