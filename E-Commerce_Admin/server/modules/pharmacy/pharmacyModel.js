
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Pharmacy = function () {};

//Create pharmacy
Pharmacy.prototype.createPharmacy = pharmacy => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_pharmacy = `INSERT INTO pharmacies
    (id, name, address, postcode, city, country, latitude, longitude, telephone, link)
    value ( ${connection.escape(pharmacy.id)}, ${connection.escape(pharmacy.name)}, ${connection.escape(pharmacy.address)},
     ${connection.escape(pharmacy.postcode)}, ${connection.escape(pharmacy.city)}, ${connection.escape(pharmacy.country)},
     ${connection.escape(pharmacy.latitude)}, ${connection.escape(pharmacy.longitude)}, ${connection.escape(pharmacy.telephone)}, 
     ${connection.escape(pharmacy.link)} ) `;

     var insert_data1 = "";

     if(pharmacy.files){
       for(var i=0;i<pharmacy.files.length;i++){
         insert_data1 += `(${connection.escape(pharmacy.files[i].id)}, ${connection.escape(pharmacy.id)}, ${connection.escape(pharmacy.files[i].profile_img)},
                           ${connection.escape(pharmacy.files[i].name)}, ${connection.escape(pharmacy.files[i].type)}, ${connection.escape(pharmacy.files[i].link)}), `;
       }
     }
 
     if(insert_data1.length>2){
       insert_data1=insert_data1.substring(0,insert_data1.length-2);
     }
 
     var sql_bi = `INSERT INTO pharmacies_images
     (id, pharmacy_id, profile_img, name, type, link) values ${insert_data1} `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_pharmacy));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_bi));
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

Pharmacy.prototype.getPharmacyDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM pharmacies
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

Pharmacy.prototype.getPharmacyDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM pharmacies
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var pharmacy = rows[0];
        var sql_select1 = `SELECT *
        FROM pharmacies_images
        WHERE pharmacy_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          pharmacy.post_image = rows.find(r=>{return r.profile_img==1}) || null;
          //pharmacy.images = rows.filter(r=>{return r.profile_img==0});

          resolve(pharmacy);
        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Pharmacy.prototype.filterPharmacies = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM pharmacies 
    ORDER BY name `;

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
      var pharmacies = rows;
      var pharmacy_ids = rows.map(x=>{
          return connection.escape(x.id);
      });

      //console.log(image_ids);
      if(pharmacies[0]){
        var sql_select_images = `SELECT * FROM pharmacies_images WHERE pharmacy_id IN (${pharmacy_ids.join()})`;
        connection.query(sql_select_images, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
    
          for(var i=0;i<pharmacies.length;i++){
            pharmacies[i].post_image = rows.find(y=>{
              return y.pharmacy_id==pharmacies[i].id;
            });
          }
          
          resolve(pharmacies);
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Pharmacy.prototype.countFilterPharmacies = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_select = `SELECT count(id) as count
    FROM pharmacies `;

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

Pharmacy.prototype.updatePharmacy = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    for (var i in data) {
      if(i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE pharmacies SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM pharmacies_images WHERE profile_img=1 AND pharmacy_id=${connection.escape(id)} `
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

    var sql_insert_mi = `INSERT INTO pharmacies_images
    (id, pharmacy_id, profile_img, name, type, link) values ${insert_data1} `;

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
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }/*
        if(data.files && data.files.length>t){
          queries.push(connection.query(sql_delete2));
        }*/
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_mi));
        }
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

Pharmacy.prototype.deletePharmacy = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    
    var sql_delete_pharmacy = `DELETE FROM pharmacies WHERE id = ${connection.escape(id)} `;
    var sql_delete_mi = `DELETE FROM pharmacies_images WHERE pharmacy_id = ${connection.escape(id)} `;
    
    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_mi)); 
      queries.push(connection.query(sql_delete_pharmacy));
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


Pharmacy.prototype.deletePharmacyImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM pharmacies_images WHERE id = ${connection.escape(id)} `;
    
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

module.exports = new Pharmacy();