
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Paymentmethod = function () {};

//Create paymentmethod
Paymentmethod.prototype.createPaymentmethod = paymentmethod => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    if (paymentmethod.default_method == 1) {
      var sql_update = `UPDATE paymentmethods SET default_method = 0 WHERE id != ${connection.escape(paymentmethod.id)}`
    }

    //var pay_id = uuid.v4();
    var sql_insert_paymentmethod = `INSERT INTO paymentmethods
    (id, title, code, active, translations,is_other)
    value (${connection.escape(paymentmethod.id)}, ${connection.escape(paymentmethod.title)},
    ${connection.escape(paymentmethod.code)}, ${connection.escape(paymentmethod.active)}, ${connection.escape(paymentmethod.translations)}, ${connection.escape(paymentmethod.is_other)})`;

    var sql_pc = `INSERT INTO paymentmethods_countries
    (paymentmethod_id, country_id)
    values `

    for(var i=0; i<paymentmethod.countries.length; i++){
        sql_pc+=`(${connection.escape(paymentmethod.id)}, ${connection.escape(paymentmethod.countries[i])})`;
        //console.log(paymentmethod.countries[i]);
        if(i!=paymentmethod.countries.length-1){
            sql_pc+=`,`;
        }
    }
    sql_pc+=` `;

    var insert_data1 = "";

     if(paymentmethod.files){
       for(var i=0;i<paymentmethod.files.length;i++){
         insert_data1 += `(${connection.escape(paymentmethod.files[i].id)}, ${connection.escape(paymentmethod.id)}, ${connection.escape(paymentmethod.files[i].profile_img)},
                           ${connection.escape(paymentmethod.files[i].name)}, ${connection.escape(paymentmethod.files[i].type)}, ${connection.escape(paymentmethod.files[i].link)}), `;
       }
     }

     if(insert_data1.length>2){
       insert_data1=insert_data1.substring(0,insert_data1.length-2);
     }

     var sql_bi = `INSERT INTO paymentmethods_images
     (id, paymentmethod_id, profile_img, name, type, link) values ${insert_data1} `;

    //console.log(sql_pc);
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if (paymentmethod.default_method == 1) {
        queries.push(connection.query(sql_update))
      }
      queries.push(connection.query(sql_insert_paymentmethod));
      queries.push(connection.query(sql_pc));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_bi));
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

Paymentmethod.prototype.getPaymentmethodByTitle = (title) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT p.*
    FROM paymentmethods as p
    WHERE p.title = ${connection.escape(title)}`;
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

Paymentmethod.prototype.getPaymentmethodDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM paymentmethods
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      var pm = rows[0];
      if(pm && pm.translations && pm.translations!=""){
        pm.translations=JSON.parse(pm.translations);
      }
      resolve(pm);
    });
  });

  });
}

Paymentmethod.prototype.getPaymentmethodDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM paymentmethods
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var paymentmethod = rows[0];
        if(paymentmethod && paymentmethod.translations && paymentmethod.translations!=""){
          paymentmethod.translations=JSON.parse(paymentmethod.translations);
        }
        var sql_select1 = `SELECT *
        FROM paymentmethods_images
        WHERE paymentmethod_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          paymentmethod.post_image = rows.find(r=>{return r.profile_img==1}) || null;
          //pharmacy.images = rows.filter(r=>{return r.profile_img==0});
          var sql_select2 = `SELECT c.*
          FROM paymentmethods_countries as pc
          INNER JOIN countries as c ON c.id=pc.country_id
          WHERE pc.paymentmethod_id = ${connection.escape(id)}`;
          connection.query(sql_select2, (err, rows) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }
            paymentmethod.countries = rows.map(r=>{return r.name});
            resolve(paymentmethod);
          });
        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Paymentmethod.prototype.filterPaymentmethods = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT p.* from paymentmethods as p WHERE p.active=1 `;

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

      var payments = rows;

      if(payments && payments.length>0){
        var ids = rows.map((r) => {
          return connection.escape(r.id);
        });

        var sql_p = `SELECT p.paymentmethod_id, c.name
        FROM paymentmethods_countries as p
        INNER JOIN countries as c ON c.id = p.country_id
        WHERE p.paymentmethod_id in (${ids.join()})`;   //(id1,id2,...,idn)
        connection.query(sql_p, (err, rows1) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var payCountries = rows1;

          var sql_select_images = `SELECT * FROM paymentmethods_images WHERE paymentmethod_id IN (${ids.join()})`;
          connection.query(sql_select_images, (err, rows) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }

            payments.map((p) => {
              if(p && p.translations && p.translations!=""){
                p.translations=JSON.parse(p.translations);
              }

              p.countries = payCountries.filter((pc) => {
                return pc.paymentmethod_id == p.id;
              }).map((r) => {
                return r.name;
              });

              p.post_image = rows.find(y=>{
                return y.paymentmethod_id==p.id;
              });
            });

            resolve(payments);
          });
        });
      } else {
        connection.release();
        resolve(payments);
      }
    }); // payments
  }); //getConnection

  });
}

Paymentmethod.prototype.countFilterPaymentmethods = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM paymentmethods WHERE active=1`;

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

Paymentmethod.prototype.updatePaymentmethod = (id, data, prev_img_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      if(i!="countries" && i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    if (data.default_method == 1) {
      var sql_u = `UPDATE paymentmethods SET default_method = 0 WHERE id != ${connection.escape(id)}`
    }

    //console.log(update_data);
    var sql_update = `UPDATE paymentmethods SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_delete = `DELETE FROM paymentmethods_countries WHERE paymentmethod_id = ${connection.escape(id)} `;
    var sql_insert = `INSERT INTO paymentmethods_countries
                      (paymentmethod_id, country_id) values `

    if(data.countries && data.countries.length>0){
      for(var i=0; i<data.countries.length; i++){
          sql_insert+=`(${connection.escape(id)}, ${connection.escape(data.countries[i])})`;
          if(i!=data.countries.length-1){
              sql_insert+=`,`;
          }
      }
      sql_insert+=` `;
    }

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM paymentmethods_images WHERE profile_img=1 AND paymentmethod_id=${connection.escape(id)} `
      }
      //var sql_delete2 = `DELETE FROM mediums_images WHERE profile_img=0 AND medium_id=${connection.escape(id)} `

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO paymentmethods_images
    (id, paymentmethod_id, profile_img, name, type, link) values ${insert_data1} `;

    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      if (data.default_method == 1) {
        queries.push(connection.query(sql_u))
      }
      if(update_data.length>0){
        queries.push(connection.query(sql_update));
        x=1;
      }
      if(data.countries){
        queries.push(connection.query(sql_delete));
        if(data.countries.length>0)
          queries.push(connection.query(sql_insert));
        x=1;
      }
      if(has_profile_pic){
        queries.push(connection.query(sql_delete1));
      }/*
      if(data.files && data.files.length>t){
        queries.push(connection.query(sql_delete2));
      }*/
      if(insert_data1.length>2){
        queries.push(connection.query(sql_insert_mi));
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

Paymentmethod.prototype.deletePaymentmethod = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_pm = `DELETE FROM paymentmethods WHERE id = ${connection.escape(id)} `;
    var sql_delete_pc = `DELETE FROM paymentmethods_countries WHERE paymentmethod_id = ${connection.escape(id)} `;
    var sql_delete_pi = `DELETE FROM paymentmethods_images WHERE paymentmethod_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_pi));
      queries.push(connection.query(sql_delete_pc));
      queries.push(connection.query(sql_delete_pm));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[2].affectedRows;
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

Paymentmethod.prototype.deletePaymentmethodImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM paymentmethods_images WHERE id = ${connection.escape(id)} `;

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
};

module.exports = new Paymentmethod();
