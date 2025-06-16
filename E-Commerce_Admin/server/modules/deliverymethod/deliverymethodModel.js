
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Deliverymethod = function () {};

//Create deliverymethod
Deliverymethod.prototype.createDeliverymethod = deliverymethod => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_deliverymethod = `INSERT INTO deliverymethods
    (id, country, code, telephone, email, active, price, to_price, translations, is_other, default_method)
    value ( ${connection.escape(deliverymethod.id)}, ${connection.escape(deliverymethod.country)},
            ${connection.escape(deliverymethod.code)}, ${connection.escape(deliverymethod.telephone)},
            ${connection.escape(deliverymethod.email)}, ${connection.escape(deliverymethod.active)},
            ${connection.escape(deliverymethod.price)}, ${connection.escape(deliverymethod.to_price)},
            ${connection.escape(deliverymethod.translations)}, ${connection.escape(deliverymethod.is_other)}, ${connection.escape(deliverymethod.default)} )`;

    
    if (deliverymethod.default == 1) {
      var sql_update = `UPDATE deliverymethods as dm SET dm.default_method = 0 WHERE dm.id != ${connection.escape(deliverymethod.id)} AND dm.country = ${connection.escape(deliverymethod.country)}`
    }
    
    if(deliverymethod.therapies){
    var sql_insert_dt = `INSERT INTO deliverymethods_therapies
    (deliverymethod_id, therapy_id)
    values `;
      for(var i=0;i<deliverymethod.therapies.length;i++){
        sql_insert_dt += `(${connection.escape(deliverymethod.id)}, ${connection.escape(deliverymethod.therapies[i])})`
        if(i<deliverymethod.therapies.length-1)
          sql_insert_dt += `, `;
      }
    }

    var insert_data1 = "";

     if(deliverymethod.files){
       for(var i=0;i<deliverymethod.files.length;i++){
         insert_data1 += `(${connection.escape(deliverymethod.files[i].id)}, ${connection.escape(deliverymethod.id)}, ${connection.escape(deliverymethod.files[i].profile_img)},
                           ${connection.escape(deliverymethod.files[i].name)}, ${connection.escape(deliverymethod.files[i].type)}, ${connection.escape(deliverymethod.files[i].link)}), `;
       }
     }

     if(insert_data1.length>2){
       insert_data1=insert_data1.substring(0,insert_data1.length-2);
     }

     var sql_dmi = `INSERT INTO deliverymethods_images
     (id, deliverymethod_id, profile_img, name, type, link) values ${insert_data1} `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];

      if (deliverymethod.default == 1) {
        queries.push(connection.query(sql_update))
      }

      queries.push(connection.query(sql_insert_deliverymethod));
      if(deliverymethod.therapies && deliverymethod.therapies.length>0){
        queries.push(connection.query(sql_insert_dt));
      }
      if(insert_data1.length>2){
        queries.push(connection.query(sql_dmi));
      }
      return bluebird.all(queries);
    }).then((results) => {
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(true);
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

Deliverymethod.prototype.getDeliverymethodByCodeAndCountry = (code, country) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT p.*
    FROM deliverymethods as p
    WHERE p.code = ${connection.escape(code)} AND p.country = ${connection.escape(country)}`;
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

Deliverymethod.prototype.getDeliverymethodDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM deliverymethods
    WHERE id = ${connection.escape(id)}`;

    var sql_select_c = `SELECT t.*
    FROM deliverymethods_therapies as dt
    INNER JOIN therapies as t ON t.id=dt.therapy_id
    WHERE dt.deliverymethod_id = ${connection.escape(id)}`;

    var deliverymethod;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_select));
      queries.push(connection.query(sql_select_c));
      return bluebird.all(queries);
    }).then((results) => {
      deliverymethod = results[0][0];
      if(deliverymethod){
        deliverymethod.therapies = results[1];
      }
      return connection.commit();
    }).then(() => {
      connection.release();
      resolve(deliverymethod);
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

Deliverymethod.prototype.filterDeliverymethods = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM deliverymethods WHERE active=1 `;

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
      var deliverymethods = rows;
      if(deliverymethods && deliverymethods.length>0){
        var dm_ids = deliverymethods.map(dm=>{return dm.id;});

        var sql_select = `SELECT dt.deliverymethod_id, t.*
        FROM deliverymethods_therapies as dt
        INNER JOIN therapies as t ON t.id=dt.therapy_id
        WHERE dt.deliverymethod_id IN (${connection.escape(dm_ids)}) `;
        connection.query(sql_select, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var sql_select_images = `SELECT * FROM deliverymethods_images WHERE deliverymethod_id IN (${connection.escape(dm_ids)})`;
          connection.query(sql_select_images, (err, rows1) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }

            for(var i=0;i<deliverymethods.length;i++){
              deliverymethods[i].therapies = rows.filter(r=>{
                return r.deliverymethod_id==deliverymethods[i].id;
              }).map(r=>{
                delete r.deliverymethod_id;
                return r;
              });

              if(deliverymethods[i].translations && deliverymethods[i].translations!=""){
                deliverymethods[i].translations=JSON.parse(deliverymethods[i].translations);
              }

              deliverymethods[i].post_image = rows1.find(r=>{
                return r.deliverymethod_id==deliverymethods[i].id;
              }) || null;
            }

            resolve(deliverymethods);
          });
        });
      } else {
        connection.release();
        resolve(deliverymethods);
      }
    });
  });

  });
}

Deliverymethod.prototype.countFilterDeliverymethods = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM deliverymethods WHERE active=1`;

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

Deliverymethod.prototype.updateDeliverymethod = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    if (data.default_method == 1) {
      var update_q = `UPDATE deliverymethods SET default_method = 0 WHERE id != ${connection.escape(id)} AND country = ${connection.escape(data.country)}`
    }

    var update_data = "";
    for (var i in data) {
      if(i!="therapies" && i!="files") {
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE deliverymethods SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var sql_delete1 = `DELETE FROM deliverymethods_therapies WHERE deliverymethod_id = ${connection.escape(id)} `;
    if(data.therapies && data.therapies.length>0){
      var sql_insert1 = `INSERT INTO deliverymethods_therapies
                        (deliverymethod_id, therapy_id) values `

      for(var i=0; i<data.therapies.length; i++){
        sql_insert1+=`(${connection.escape(id)}, ${connection.escape(data.therapies[i])})`;
        if(i<data.therapies.length-1){
            sql_insert1+=`, `;
        }
      }
    }

    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete2 = `DELETE FROM deliverymethods_images WHERE profile_img=1 AND deliverymethod_id=${connection.escape(id)} `
      }

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_dmi = `INSERT INTO deliverymethods_images
    (id, deliverymethod_id, profile_img, name, type, link) values ${insert_data1} `;

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if (data.default_method == 1) {
        queries.push(connection.query(update_q))
      }
      if(update_data.length>2){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.therapies){
        queries.push(connection.query(sql_delete1));
        if(data.therapies.length>0)
          queries.push(connection.query(sql_insert1));
        x=1;
      }
      if(has_profile_pic){
        queries.push(connection.query(sql_delete2));
      }
      if(insert_data1.length>2){
        queries.push(connection.query(sql_insert_dmi));
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

Deliverymethod.prototype.deleteDeliverymethod = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_deliverymethod = `DELETE FROM deliverymethods WHERE id = ${connection.escape(id)} `;
    var sql_delete_dc = `DELETE FROM deliverymethods_therapies WHERE deliverymethod_id = ${connection.escape(id)} `;
    var sql_delete_di = `DELETE FROM deliverymethods_images WHERE deliverymethod_id = ${connection.escape(id)} `;

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_di));
      queries.push(connection.query(sql_delete_dc));
      queries.push(connection.query(sql_delete_deliverymethod));
      return bluebird.all(queries);
    }).then((results) => {
      x=results[2].affectedRows;
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

module.exports = new Deliverymethod();
