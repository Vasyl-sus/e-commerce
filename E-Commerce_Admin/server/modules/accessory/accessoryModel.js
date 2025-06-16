
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');


var Accessory = function () {};

//Create accessory
Accessory.prototype.createAccessory = accessory => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_accessory = `INSERT INTO accessories (
      id, name, description, regular_price,
      reduced_price, seo_link, meta_title,
      meta_description, category, product_id,
      country, lang, status, is_gift, min_order_total, long_description, sort_order
    ) value (
      ${connection.escape(accessory.id)}, ${connection.escape(accessory.name)}, ${connection.escape(accessory.description)}, ${connection.escape(accessory.regular_price)},
      ${connection.escape(accessory.reduced_price)}, ${connection.escape(accessory.seo_link)}, ${connection.escape(accessory.meta_title)},
      ${connection.escape(accessory.meta_description)}, ${connection.escape(accessory.category)}, ${connection.escape(accessory.product_id)},
      ${connection.escape(accessory.country)}, ${connection.escape(accessory.lang)}, ${connection.escape(accessory.status)}, ${connection.escape(accessory.is_gift)},
      ${connection.escape(accessory.min_order_total)}, ${connection.escape(accessory.long_description)}, ${connection.escape(accessory.sort_order)}
    )`;

    var insert_data1 = "";

    if(accessory.files){
      for(var i=0;i<accessory.files.length;i++){
        insert_data1 += `(${connection.escape(accessory.files[i].id)}, ${connection.escape(accessory.id)}, ${connection.escape(accessory.files[i].profile_img)}, ${connection.escape(accessory.files[i].product_img)},
                          ${connection.escape(accessory.files[i].name)}, ${connection.escape(accessory.files[i].type)}, ${connection.escape(accessory.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_ai = `INSERT INTO accessories_images
    (id, accessory_id, profile_img, product_image, name, type, link) values ${insert_data1} `;


    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_accessory));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_ai));
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

Accessory.prototype.getAccessoryByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM accessories
    WHERE name = ${connection.escape(name)}`;
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

Accessory.prototype.getAccessoryDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM accessories
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

Accessory.prototype.getAccessoryDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM accessories
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var accessory = rows[0];
        var sql_select1 = `SELECT *
        FROM accessories_images
        WHERE accessory_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          accessory.profile_image = rows.find(r=>{return r.profile_img==1}) || null;
          accessory.images = rows.filter(r=>{return r.profile_img==0});

          var sql_select2 = `SELECT p.* FROM products AS p
            INNER JOIN accessories AS a
            WHERE a.category = p.category
            AND a.id = "${accessory_id}"
            LIMIT 1;`;

          connection.query(sql_select2, (err, rows2) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }

            accessory.product_id = rows2[0].id;

            resolve(accessory);
          })


        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Accessory.prototype.filterAccessories = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT * FROM accessories WHERE id is not null`;

    if (data.search)
      sql_select += ` AND name like '%${data.search}%' `

    if (data.country)
      sql_select += ` AND country = ${connection.escape(data.country)} `

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += ` limit ${data.from}, ${data.pageLimit}`;
    }

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }

      if(rows[0]){
        var accessories = rows;
        var accessory_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_ai = `SELECT ai.* FROM accessories_images as ai WHERE ai.accessory_id IN(${accessory_ids.join()}) `;
        connection.query(sql_select_ai, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          var sql_select_ap = `SELECT pt.name as name, p.id, p.date_added, p.category, pt.lang FROM products as p
                                            INNER JOIN product_translations as pt on pt.product_id = p.id
                                            WHERE p.active=1`;
          connection.query(sql_select_ap, (err, rows1) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }

            let options = rows1;
            for(var i=0;i<accessories.length;i++){
              let option = options.filter(o => {
                return o.category === accessories[i].category
              })
              accessories[i].options = option
              accessories[i].profile_image = rows.find(r=>{return r.profile_img==1 && r.accessory_id==accessories[i].id}) || null;
              accessories[i].images = rows.filter(r=>{return r.profile_img==0 && r.accessory_id==accessories[i].id});
            }

            resolve(accessories);
          });
        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Accessory.prototype.countFilterAccessories = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM accessories WHERE id is not null`;

    if (data.search)
      sql_select += ` AND name like '%${data.search}%' `

    if (data.country)
      sql_select += ` AND country = ${connection.escape(data.country)} `


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


Accessory.prototype.updateAccessory = (id, data) => {
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

    var sql_update = `UPDATE accessories SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM accessories_images WHERE profile_img=1 AND accessory_id=${connection.escape(id)} `
      }
      var sql_delete2 = `DELETE FROM accessories_images WHERE profile_img=0 AND accessory_id=${connection.escape(id)} `

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)}, ${connection.escape(data.files[i].product_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO accessories_images
    (id, accessory_id, profile_img, product_image, name, type, link) values ${insert_data1} `;

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

Accessory.prototype.deleteAccessory = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_accessory = `DELETE FROM accessories WHERE id = ${connection.escape(id)} `;
    var sql_delete_ai = `DELETE FROM accessories_images WHERE accessory_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_ai));
      queries.push(connection.query(sql_delete_accessory));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[0].affectedRows;
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


Accessory.prototype.deleteAccessoryImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM accessories_images WHERE id = ${connection.escape(id)} `;

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

module.exports = new Accessory();
