
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Otom = function () {};

//Create otom
Otom.prototype.createOtom = otom => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    
    var sql_insert_otom = ` INSERT INTO otoms (
        id, label, discount_id, 
        active, country, lang, 
        send_after_days, title,
        data, subject, sender,
        btn_text, image_link
    ) value (
        ${connection.escape(otom.id)}, ${connection.escape(otom.label)}, ${connection.escape(otom.discount_id)},
        ${connection.escape(otom.active)}, ${connection.escape(otom.country)}, ${connection.escape(otom.lang)},
        ${connection.escape(otom.send_after_days)}, ${connection.escape(otom.title)},
        ${connection.escape(otom.data)}, ${connection.escape(otom.subject)}, ${connection.escape(otom.sender)},
        ${connection.escape(otom.btn_text)}, ${connection.escape(otom.image_link)}) `;

    var sql_ot = `INSERT INTO otoms_therapies
    (otom_id, therapy_id, quantity)
    values `

    for(var i=0; i<otom.therapies.length; i++){
        sql_ot+=`(${connection.escape(otom.id)}, ${connection.escape(otom.therapies[i].id)},${connection.escape(otom.therapies[i].quantity)})`;
        if(i!=otom.therapies.length-1){
            sql_ot+=`,`;
        }
    }
    sql_ot+=` `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_otom));
      if(otom.therapies.length>0){
        queries.push(connection.query(sql_ot));
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


Otom.prototype.getOtomDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM otoms
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

Otom.prototype.filterOtoms = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT o.* from otoms as o `;
    
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
    
      var otoms = rows;

      if(otoms && otoms.length>0){
        var ids = rows.map((r) => {
            return connection.escape(r.id);
        });
        var discount_ids = rows.map((r) => {
            return connection.escape(r.discount_id);
        });
        
        var sql_d = ` SELECT d.* 
        FROM discountcodes as d
        WHERE d.id in (${discount_ids.join()}) `; 
        connection.query(sql_d, (err, rows1) => {
            if (err) {
                connection.release();
                reject(err);
                return;
            }

            var sql_p = ` SELECT ot.otom_id, t.* , ot.quantity
            FROM otoms_therapies as ot
            INNER JOIN therapies as t ON t.id=ot.therapy_id
            WHERE ot.otom_id in (${ids.join()}) `;   //(id1,id2,...,idn)
            connection.query(sql_p, (err, rows2) => {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }

                for(var i=0;i<otoms.length;i++){
                    otoms[i].discount = rows1.find(d=>{
                        return d.id==otoms[i].discount_id;
                    }) || null;

                    otoms[i].therapies = rows2.filter(r=>{
                        return r.otom_id==otoms[i].id;
                    }).map(r=>{
                        delete r.otom_id;
                        return r;
                    });
                }
                
                resolve(otoms);

            });
        });
      } else {
          connection.release();
          resolve(otoms);
      }
    });
  });

  });
}

Otom.prototype.countFilterOtoms = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM otoms `;

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

Otom.prototype.updateOtom = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var update_data = "";
    for (var i in data) {
      if(i!="therapies"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }
    
    //console.log(update_data);
    var sql_update = `UPDATE otoms SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_delete = `DELETE FROM otoms_therapies WHERE otom_id = ${connection.escape(id)} `;
    var sql_insert = `INSERT INTO otoms_therapies
                      (otom_id, therapy_id, quantity) values `

    if(data.therapies && data.therapies.length>0){
      for(var i=0; i<data.therapies.length; i++){
          sql_insert+=`(${connection.escape(id)}, ${connection.escape(data.therapies[i].id)}, ${connection.escape(data.therapies[i].quantity)})`;
          if(i!=data.therapies.length-1){
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
      if(data.therapies){
        queries.push(connection.query(sql_delete));
        if(data.therapies.length>0)
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

Otom.prototype.deleteOtom = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_otoms = `DELETE FROM otoms WHERE id = ${connection.escape(id)} `;
    var sql_delete_otoms_therapies = `DELETE FROM otoms_therapies WHERE otom_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_otoms_therapies));
      queries.push(connection.query(sql_delete_otoms));
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

module.exports = new Otom();