
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Orderstatus = function () {};

//Create orderstatus
Orderstatus.prototype.createOrderstatus = orderstatus => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    
    var sql_insert_orderstatus = ` INSERT INTO orderstatuses
    (id, name, color, sort_order, translations, hidden)
    value (${connection.escape(orderstatus.id)}, ${connection.escape(orderstatus.name)}, ${connection.escape(orderstatus.color)}, ${connection.escape(orderstatus.sort_order)}, ${connection.escape(orderstatus.translations)}, ${connection.escape(orderstatus.hidden)}) `;

    var sql_pc = `INSERT INTO orderstatuses_v
    (status_id, name)
    values `
    var n=orderstatus.next_statuses.length;
    for(var i=0; i<orderstatus.next_statuses.length; i++){
        sql_pc+=`(${connection.escape(orderstatus.id)}, ${connection.escape(orderstatus.next_statuses[i])})`;
        //console.log(orderstatus.next_statuses[i]);
        if(i!=orderstatus.next_statuses.length-1){
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
      queries.push(connection.query(sql_insert_orderstatus));
      if(n>0){
        queries.push(connection.query(sql_pc));
      }
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

Orderstatus.prototype.getOrderstatusByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT o.*
    FROM orderstatuses as o
    WHERE o.name = ${connection.escape(name)}`;
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

Orderstatus.prototype.checkStornoStatus = (ids) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT o.*
    FROM orderstatuses as o
    WHERE o.id IN (${connection.escape(ids)})
    AND o.name = "Storno"`;
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

Orderstatus.prototype.getOrderstatusDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM orderstatuses
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

Orderstatus.prototype.filterOrderstatuses = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT o.* from orderstatuses as o order by o.sort_order asc `;
    
    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }
    //console.log(sql_select);
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
    
      var statuses = rows;

      if(statuses && statuses.length>0){
        var ids = rows.map((r) => {
          return connection.escape(r.id);
        });
        var sql_p = ` SELECT osv.status_id, osv.name, os.sort_order
        from orderstatuses_v as osv 
        inner join orderstatuses as os on osv.name = os.name 
        WHERE osv.status_id in (${ids.join()}) order by os.sort_order asc `;   //(id1,id2,...,idn)

        connection.query(sql_p, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          var statuses_v = rows1;
          statuses.map((p) => {
            p.next_statuses = [];
            var next_statuses = statuses_v.filter((ns) => {
              return ns.status_id == p.id;
            });
            
            p.next_statuses = next_statuses.map((r) => {
              return r.name;
            });
            
          });
          
          resolve(statuses);
          //console.log(payments)
        }); // payCountries
      } else {
        connection.escape();
        resolve(statuses);
      }
    }); // payments
  }); //getConnection

  });
}

Orderstatus.prototype.countFilterOrderstatuses = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM orderstatuses `;

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

Orderstatus.prototype.updateOrderstatus = (id, data, newStatuses) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var update_data = "";
    for (var i in data) {
      if(i!="next_statuses"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }
    
    //console.log(update_data);
    var sql_update = `UPDATE orderstatuses SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_delete = `DELETE FROM orderstatuses_v WHERE status_id = ${connection.escape(id)} `;
    var sql_insert = `INSERT INTO orderstatuses_v
                      (status_id, name) values `;

    var sql_update2 = `INSERT INTO orderstatuses
    (id, name, color, sort_order)
    VALUES `;
    if(newStatuses && newStatuses.length > 0){
      
      for(var i = 0; i < newStatuses.length; ++i){
        let status = `(${connection.escape(newStatuses[i].id)},${connection.escape(newStatuses[i].name)}, ${connection.escape(newStatuses[i].color)}, ${newStatuses[i].sort_order})`;
        sql_update2 += status;
        if(i < newStatuses.length-1){
          sql_update2 += `,`;
        }        
      }
    
      sql_update2 += ` ON DUPLICATE KEY UPDATE name = VALUES(name), color = VALUES(color), sort_order = VALUES(sort_order); `;
    }

    if(data.next_statuses && data.next_statuses.length>0){
      for(var i=0; i<data.next_statuses.length; i++){
          sql_insert+=`(${connection.escape(id)}, ${connection.escape(data.next_statuses[i])})`;
          if(i!=data.next_statuses.length-1){
              sql_insert+=`,`;
          }
      }
      sql_insert+=` `;
    }

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
      if(data.next_statuses){
        queries.push(connection.query(sql_delete));
        if(data.next_statuses.length>0)
          queries.push(connection.query(sql_insert));
        x=1;
      }
      if(newStatuses && newStatuses.length > 0){
        queries.push(connection.query(sql_update2));
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

Orderstatus.prototype.deleteOrderstatus = (id, newStatuses) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_update = `INSERT INTO orderstatuses
                      (id, name, color, sort_order)
                      VALUES `;

    for(var i = 0; i < newStatuses.length; ++i){
      let status = `(${connection.escape(newStatuses[i].id)}, ${connection.escape(newStatuses[i].name)}, ${connection.escape(newStatuses[i].color)}, ${newStatuses[i].sort_order})`;
      sql_update += status;
      if(i < newStatuses.length-1){
        sql_update += `,`;
      }
      
    }

    sql_update += ` ON DUPLICATE KEY UPDATE name = VALUES(name), color = VALUES(color), sort_order = VALUES(sort_order); `;

    var sql_delete_orderstatus = `DELETE FROM orderstatuses WHERE id = ${connection.escape(id)} `;
    var sql_delete_orderstatus_v = `DELETE FROM orderstatuses_v WHERE status_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_orderstatus_v));
      queries.push(connection.query(sql_delete_orderstatus));
      queries.push(connection.query(sql_update));
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


module.exports = new Orderstatus();