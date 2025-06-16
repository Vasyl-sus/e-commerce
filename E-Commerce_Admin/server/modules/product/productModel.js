
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require("uuid")

var Product = function () {};

//Create product
Product.prototype.createProduct = (product, admin) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var full_name = admin.firstname + " " + admin.lastname;
    var sql_insert_product = `INSERT INTO products
    (id, name, category, amount, sort_order, active)
    value (${connection.escape(product.id)}, ${connection.escape(product.name)}, ${connection.escape(product.category)},
    ${connection.escape(product.amount)}, ${connection.escape(product.sort_order)}, ${connection.escape(product.active)})`;

    var sql_insert_stockchange = `INSERT INTO stockchanges
    (product_id, product_name, admin_id, admin_full_name, value, comment)
    value ( ${connection.escape(product.id)}, ${connection.escape(product.name)},
    ${connection.escape(admin.id)}, ${connection.escape(full_name)},
    ${connection.escape(product.amount)}, 'initial' )`;

    var insert_data1 = "";

     if(product.files){
       for(var i=0;i<product.files.length;i++){
         insert_data1 += `(${connection.escape(product.files[i].id)}, ${connection.escape(product.id)}, ${connection.escape(product.files[i].profile_img)},
                           ${connection.escape(product.files[i].name)}, ${connection.escape(product.files[i].type)}, ${connection.escape(product.files[i].link)}), `;
       }
     }

     if(insert_data1.length>2){
       insert_data1=insert_data1.substring(0,insert_data1.length-2);
     }

     var sql_pi = `INSERT INTO products_images
     (id, product_id, profile_img, name, type, link) values ${insert_data1} `;

    if(product.translations){
      var sql_pct = `INSERT INTO product_translations (product_id, name, lang) VALUES `;
      var queryLength1 = sql_pct.length;
      for(var i=0;i<product.translations.length;i++){
        sql_pct += `(${connection.escape(product.id)}, ${connection.escape(product.translations[i].display_name)}, ${connection.escape(product.translations[i].lang)}), `;
      }
      if(sql_pct.length>queryLength1){
        sql_pct = sql_pct.substring(0,sql_pct.length-2);
      }
    }

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_product));
      queries.push(connection.query(sql_insert_stockchange));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_pi));
      }
      if(sql_pct.length>2){
        queries.push(connection.query(sql_pct));
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

Product.prototype.getProductByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT p.*
    FROM products as p
    WHERE p.name = ${connection.escape(name)}`;
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

Product.prototype.deleteProductReviews = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_review = `DELETE FROM reviews WHERE id = ${connection.escape(id)}`;
    var sql_delete_review_products = `DELETE FROM review_products WHERE review_id = ${connection.escape(id)}`;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_review));
      queries.push(connection.query(sql_delete_review_products));
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

Product.prototype.getProductDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM products
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

Product.prototype.getProductDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM products
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var product = rows[0];
        var sql_select1 = `SELECT *
        FROM products_images
        WHERE product_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          product.post_image = rows.find(r=>{return r.profile_img==1}) || null;

          resolve(product);
        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Product.prototype.filterProductReviews = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    let sql_select = `SELECT r.*, p.name as product_name, p.id as product_id FROM reviews as r
                      INNER JOIN review_products as rp on r.id = rp.review_id
                      INNER JOIN products as p on p.id = rp.product_id
                      WHERE r.id IS NOT NULL `;

    if (data.product_id) {
      sql_select += `AND rp.product_id = ${connection.escape(data.product_id)}`
    }

    if(data.pageNumber && data.pageLimit){
      data.from = (data.pageNumber-1)*data.pageLimit;
      sql_select += `limit ${data.from}, ${data.pageLimit}`;
    }

    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if (rows.length > 0) {
        var products = rows;
        var product_ids = rows.map(x=>{
          return connection.escape(x.id);
        });
        var sql_select_pct = `SELECT *
        FROM product_translations
        WHERE product_id IN (${product_ids.join()})
        ORDER BY product_id, lang`;
        connection.query(sql_select_pct, (err, rows1) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          for(var i=0;i<products.length;i++){
            products[i].translations = rows1.filter(r=>{return r.product_id==products[i].id});
          }
          resolve(products);
        })
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Product.prototype.countProductReviews = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    let sql_select = `SELECT count(r.id) as count FROM reviews as r
                      INNER JOIN review_products as rp on r.id = rp.review_id
                      INNER JOIN products as p on p.id = rp.product_id
                      WHERE r.id IS NOT NULL `;

    if (data.product_id) {
      sql_select += `AND rp.product_id = ${connection.escape(data.product_id)}`
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

Product.prototype.filterProducts = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT id, name, date_added, category, sort_order, amount, active
    FROM products `;

    if(!data.showAll) {
      sql_select += `WHERE active = 1 `
    }

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
      var products = rows;
      var product_ids = rows.map(x=>{
          return connection.escape(x.id);
      });

      if(products[0]){
        var sql_select_images = `SELECT * FROM products_images WHERE product_id IN (${product_ids.join()})`;
        connection.query(sql_select_images, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          for(var i=0;i<products.length;i++){
            products[i].post_image = rows.find(y=>{
              return y.product_id==products[i].id;
            });
          }

          var sql_select_pct = `SELECT *
          FROM product_translations
          WHERE product_id IN (${product_ids.join()})
          ORDER BY product_id, lang`;

          connection.query(sql_select_pct, (err, rows1) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }

            for(var i=0;i<products.length;i++){
              products[i].translations = rows1.filter(r=>{return r.product_id==products[i].id});
            }

            resolve(products);
          })

        });
      } else {
        connection.release();
        resolve(rows);
      }
    });
  });

  });
}

Product.prototype.countFilterProducts = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM products `;

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

Product.prototype.updateProduct = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    for (var i in data) {
      if(i!="files" && i != "translations"){
        update_data += `${i} = ${connection.escape(data[i])}, `;
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }
    var sql_update = `UPDATE products SET ${update_data} WHERE id = ${connection.escape(id)}`;
    var sql_update_stockchanges = `UPDATE stockchanges SET product_name=${connection.escape(data.name)} WHERE product_id = ${connection.escape(id)}`;

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM products_images WHERE profile_img=1 AND product_id=${connection.escape(id)} `
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

    var sql_insert_mi = `INSERT INTO products_images
    (id, product_id, profile_img, name, type, link) values ${insert_data1} `;

    if(data.translations){
      var sql_delete_pct = `DELETE FROM product_translations WHERE product_id=${connection.escape(id)} `;
      var sql_pct = `INSERT INTO product_translations (product_id, lang, name) VALUES `;
      var queryLength1 = sql_pct.length;
      for(var i=0;i<data.translations.length;i++){
        sql_pct += `(${connection.escape(id)}, ${connection.escape(data.translations[i].lang)}, ${connection.escape(data.translations[i].display_name)}), `;
      }
      if(sql_pct.length>queryLength1){
        sql_pct = sql_pct.substring(0,sql_pct.length-2);
      }
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
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_mi));
        }
        x=1;
      }

      if(sql_pct && sql_pct.length>2){
        queries.push(connection.query(sql_delete_pct));
        queries.push(connection.query(sql_pct));
      }
      if(data.name){
        queries.push(connection.query(sql_update_stockchanges));
        x=1;
      }
      return bluebird.all(queries);
    }).then(() => {
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

Product.prototype.editProductReviews = (id, data) => {
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
    var sql_update = `UPDATE reviews SET ${update_data} WHERE id = ${connection.escape(id)}`;
    connection.query(sql_update, (err, rows) => {
      connection.release();
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });

  });
}


Product.prototype.addProductReviews = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var insert_data_reviews = `INSERT INTO reviews (id, review, grade, date_added, name, active, lang) values `;
    var insert_data_rproducts = `INSERT INTO review_products (product_id, review_id) values `;

    var productsIds = {
      "eyelash": "e8c71400-f187-11e8-a5ef-133f52f18a6e",
      "tattoo": "f6a83d60-f187-11e8-a5ef-133f52f18a6e",
      "4d": "ffb0dca0-f187-11e8-a5ef-133f52f18a6e",
      "aqua": "fab26340-36a5-11ea-a911-11690eeb914e",
      "royal": "ec494530-36a5-11ea-a911-11690eeb914e",
      "caviar": "f98fd850-360d-11ea-a911-11690eeb914e"
    }

    for (let i = 0; i < data.length; i++) {
      let d = data[i];
      let id = uuid.v4();

      if (i < data.length - 1) {
        insert_data_reviews += `(${connection.escape(id)}, ${connection.escape(d.review)}, ${connection.escape(d.grade)}, ${connection.escape(d.date)}, ${connection.escape(d.name)}, 1, ${connection.escape(d.language && d.language.toUpperCase() || "NI")}), `

        insert_data_rproducts += `(${connection.escape(productsIds[d.product])}, ${connection.escape(id)}), `
      } else {
        insert_data_reviews += `(${connection.escape(id)}, ${connection.escape(d.review)}, ${connection.escape(d.grade)}, ${connection.escape(d.date)}, ${connection.escape(d.name)}, 1, ${connection.escape(d.language && d.language.toUpperCase() || "NI")})`

        insert_data_rproducts += `(${connection.escape(productsIds[d.product])}, ${connection.escape(id)})`
      }
    }

    connection.query(insert_data_reviews, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      connection.query(insert_data_rproducts, (err, rows) => {
        connection.release();
        if (err) {
          reject(err);
          return;
        }
        resolve();
      })
    });
  });

  });
}

Product.prototype.deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_product = `DELETE FROM products WHERE id = ${connection.escape(id)} `;
    var sql_delete_stockchanges = `DELETE FROM stockchanges WHERE product_id = ${connection.escape(id)} `;
    //var sql_delete_stockreminder = `DELETE FROM stockreminders WHERE product_id = ${connection.escape(id)} `;
    var sql_delete_stockreminders = `DELETE se.*,s.* FROM stockreminders_emails as se INNER JOIN stockreminders as s ON s.id=se.stockreminder_id WHERE s.product_id = ${connection.escape(id)}`;
    var sql_delete_pi = `DELETE FROM products_images WHERE product_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_pi));
      queries.push(connection.query(sql_delete_stockchanges));
      queries.push(connection.query(sql_delete_stockreminders));
      queries.push(connection.query(sql_delete_product));
      return bluebird.all(queries);
    }).then((result) => {
      x=result[3].affectedRows;
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

Product.prototype.updateProductStock = (product_id, data, amount) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    //console.log(data);
    var stockChangeId = null;
    var sql_update_product = `UPDATE products SET amount = amount+${connection.escape(data.value)} WHERE id = ${connection.escape(product_id)}`;
    var sql_insert_stockchange = `INSERT INTO stockchanges
    (product_id, product_name, admin_id, admin_full_name, value, comment)
    value ( ${connection.escape(product_id)}, ${connection.escape(data.product_name)},
     ${connection.escape(data.admin_id)}, ${connection.escape(data.admin_full_name)},
     ${connection.escape(data.value)}, ${connection.escape(data.comment)} )`;

     var sql_update_stockreminder = `UPDATE stockreminders as s
      SET s.sendEmails=1
      WHERE s.critical_value < ${connection.escape(amount + data.value)}
      AND s.product_id = ${connection.escape(product_id)} `

     connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
     connection.query = bluebird.promisify(connection.query);
     connection.rollback = bluebird.promisify(connection.rollback);
     connection.beginTransaction().then(() => {
       var queries = [];
       queries.push(connection.query(sql_update_product));
       queries.push(connection.query(sql_insert_stockchange));
       queries.push(connection.query(sql_update_stockreminder));
       return bluebird.all(queries);
     }).then((result) => {
       stockChangeId = result[1].insertId;
       return connection.commit();
     }).then(() => {
       connection.release();
       resolve(stockChangeId);
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

Product.prototype.deleteProductImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM products_images WHERE id = ${connection.escape(id)} `;

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

Product.prototype.getStockchanges = (product_id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT *
    FROM stockchanges
    WHERE product_id=${connection.escape(product_id)}
    ORDER BY date DESC`;

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

Product.prototype.getAllStockchanges = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT *
    FROM stockchanges
    ORDER BY date DESC `;

    if(data.pageNumberStock && data.pageLimitStock){
      data.from = (data.pageNumberStock-1)*data.pageLimitStock;
      sql_select += `limit ${data.from}, ${data.pageLimitStock}`;
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

Product.prototype.countAllStockchanges = (data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM stockchanges
    ORDER BY date DESC `;

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
module.exports = new Product();
