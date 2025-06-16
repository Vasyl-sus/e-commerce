
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Stockreminder = function () {};

//Create stockreminder
Stockreminder.prototype.createStockreminder = stockreminder => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    //var pay_id = uuid.v4();
    var sql_insert_stockreminder = `INSERT INTO stockreminders
    (id, product_id, critical_value)
    value (${connection.escape(stockreminder.id)}, ${connection.escape(stockreminder.product_id)},
     ${connection.escape(stockreminder.critical_value)} )`;

    var sql_pc = `INSERT INTO stockreminders_emails
    (stockreminder_id, email)
    values `

    for(var i=0; i<stockreminder.emails.length; i++){
        sql_pc+=`(${connection.escape(stockreminder.id)}, ${connection.escape(stockreminder.emails[i])})`;
        //console.log(stockreminder.emails[i]);
        if(i!=stockreminder.emails.length-1){
            sql_pc+=`,`;
        }
    }
    sql_pc+=` `;

    //console.log(sql_pc);
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_stockreminder));
      queries.push(connection.query(sql_pc));
      return bluebird.all(queries);
    }).then(() => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve();
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

Stockreminder.prototype.getStockreminderByProductId = (product_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM stockreminders
    WHERE product_id = ${connection.escape(product_id)}`;
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

Stockreminder.prototype.getStockreminderDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM stockreminders
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

Stockreminder.prototype.filterStockreminders = product_id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT p.* from stockreminders as p WHERE p.product_id = ${connection.escape(product_id)} ORDER BY p.critical_value`;
    
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
    
      var ids = rows.map((r) => {
        return connection.escape(r.id);
      });
      var stockreminders = rows;

      if(ids && ids.length>0){
        var sql_p = `SELECT stockreminder_id, email 
        from stockreminders_emails 
        WHERE stockreminder_id in (${ids.join()})`;   //(id1,id2,...,idn)
        connection.query(sql_p, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          var stockremindersEmails = rows1;
          stockreminders.map((s) => {
            s.emails = [];
            var emails = stockremindersEmails.filter((p) => {
              return p.stockreminder_id == s.id;
            });

            s.emails = emails.map((r) => {
              return r.email;
            });
            
          });
          
          resolve(stockreminders);
          //console.log(payments)
        }); // payCountries
      } else {
        connection.release();
        resolve([]);
      }
    }); // payments
  }); //getConnection

  });
}

Stockreminder.prototype.countFilterStockreminders = product_id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM stockreminders WHERE product_id = ${connection.escape(product_id)}`;

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

Stockreminder.prototype.updateStockreminder = (id, data) => {
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
      if(i!="emails"){
        if(j < Object.keys(data).length){
          update_data += `${i} = ${connection.escape(data[i])}, `
        }
      }
      j++;
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }
    
    //console.log(update_data);
    var sql_update = `UPDATE stockreminders SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_delete = `DELETE FROM stockreminders_emails WHERE stockreminder_id = ${connection.escape(id)} `;
    var sql_insert = `INSERT INTO stockreminders_emails
                      (stockreminder_id, email) values `

    if(data.emails && data.emails.length>0){
      for(var i=0; i<data.emails.length; i++){
          sql_insert+=`(${connection.escape(id)}, ${connection.escape(data.emails[i])})`;
          //console.log(id +" , "+data.countries[i]);
          if(i!=data.emails.length-1){
              sql_insert+=`,`;
          }
      }
      sql_insert+=` `;
    }

    var x=0;;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.emails){
        queries.push(connection.query(sql_delete));
        if(data.emails.length>0)
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

Stockreminder.prototype.deleteStockreminder = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_stockreminder = `DELETE FROM stockreminders WHERE id = ${connection.escape(id)} `;
    var sql_delete_pc = `DELETE FROM stockreminders_emails WHERE stockreminder_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_pc));
      queries.push(connection.query(sql_delete_stockreminder));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[1].affectedRows;
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


module.exports = new Stockreminder();