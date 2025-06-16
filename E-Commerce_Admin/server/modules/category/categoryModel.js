
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var axios = require('axios');
var config = require('../../config/environment')

var Category = function () {};

//Create category
Category.prototype.createCategory = category => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_insert_category = `INSERT INTO productcategories (
      id, name, sort_order, css_class_name
    ) value (
      ${connection.escape(category.id)}, ${connection.escape(category.name)}, ${connection.escape(category.sort_order)}, ${connection.escape(category.css_class_name)}
    ) `;

    if(category.translations){
      var sql_pct = `INSERT INTO productcategories_translations (category_id, lang, display_name, link_name, description, display_name_wrap) VALUES `;
      var queryLength1 = sql_pct.length;
      for(var i=0;i<category.translations.length;i++){
        sql_pct += `(${connection.escape(category.id)}, ${connection.escape(category.translations[i].lang)}, ${connection.escape(category.translations[i].display_name)}, ${connection.escape(category.translations[i].link_name)}, ${connection.escape(category.translations[i].description)}, ${connection.escape(category.translations[i].display_name_wrap)}), `;
      }
      if(sql_pct.length>queryLength1){
        sql_pct = sql_pct.substring(0,sql_pct.length-2);
      }
    }

    var insert_data1 = "";

    if(category.files){
      for(var i=0;i<category.files.length;i++){
        insert_data1 += `(${connection.escape(category.files[i].id)}, ${connection.escape(category.id)}, ${connection.escape(category.files[i].profile_img)},
                          ${connection.escape(category.files[i].name)}, ${connection.escape(category.files[i].type)}, ${connection.escape(category.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_ci = `INSERT INTO productcategories_images
    (id, category_id, profile_img, name, type, link) values ${insert_data1} `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_category));
      if(category.translations && category.translations.length>0){
        queries.push(connection.query(sql_pct));
      }
      if(insert_data1.length>2){
        queries.push(connection.query(sql_ci));
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

Category.prototype.getCategoryByName = (name) => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT p.*
    FROM productcategories as p
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

Category.prototype.getCategoryDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM productcategories
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      var category = rows[0]
      var sql_select_pct = `SELECT *
        FROM productcategories_translations
        WHERE category_id = ${connection.escape(id)}
        ORDER BY category_id, lang`;
      connection.query(sql_select_pct, (err, rows1) => {
          connection.release();
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          category.translations = rows1
          resolve(category);
      });
    });
  });

  });
}

Category.prototype.updateLangauge = (oldData, newData) => {
  var data = [];

  for (let i = 0; i < oldData.length; i++) {
    var obj = {};
    if (oldData[i].link_name != newData[i].link_name) {
      obj = {
        lang: newData[i].lang,
        oldData: oldData[i].link_name,
        newData: newData[i].link_name
      }
      data.push(obj)
    }
  }
  if (data.length > 0) {
    axios.post(`${config.catalogue_server.url}language/update_product_names`, data).then(result => {
      console.log(result)
    }).catch(error => {
      console.log(error.response)
    })
  }
}

Category.prototype.filterCategories = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM productcategories `;

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
      if(rows[0]){
        var categories = rows;
        var category_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_pct = `SELECT *
        FROM productcategories_translations
        WHERE category_id IN (${category_ids.join()})
        ORDER BY category_id, lang`;
        connection.query(sql_select_pct, (err, rows) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }
          var sql_select_pci = `SELECT *
          FROM productcategories_images
          WHERE category_id IN (${category_ids.join()})`;
          
          connection.query(sql_select_pci, (err, rows1) => {
            connection.release();
            if (err) {
              reject(err);
              return;
            }
            for(var i=0;i<categories.length;i++){
              categories[i].translations = rows.filter(r=>{return r.category_id==categories[i].id});
              categories[i].profile_image = rows1.find(r=>{return r.category_id==categories[i].id && r.profile_img==1}) || null;
              categories[i].background_image = rows1.find(r=>{return r.category_id==categories[i].id && r.profile_img==2}) || null;
              categories[i].pattern_image = rows1.find(r=>{return r.category_id==categories[i].id && r.profile_img==3}) || null;
              categories[i].additional_image = rows1.find(r=>{return r.category_id==categories[i].id && r.profile_img==4}) || null;
            }
            resolve(categories);
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

Category.prototype.countFilterCategories = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM productcategories `;

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

Category.prototype.updateCategory = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    for (var i in data) {
      if(i!="translations" && i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2)
    }

    var sql_update = `UPDATE productcategories SET ${update_data} WHERE id = ${connection.escape(id)}`;

    if(data.translations){
      var sql_delete_pct = `DELETE FROM productcategories_translations WHERE category_id=${connection.escape(id)} `;
      var sql_pct = `INSERT INTO productcategories_translations (category_id, lang, display_name, link_name, description, display_name_wrap) VALUES `;
      var queryLength1 = sql_pct.length;
      for(var i=0;i<data.translations.length;i++){
        sql_pct += `(${connection.escape(id)}, ${connection.escape(data.translations[i].lang)}, ${connection.escape(data.translations[i].display_name)}, ${connection.escape(data.translations[i].link_name)}, ${connection.escape(data.translations[i].description)}, ${connection.escape(data.translations[i].display_name_wrap)}), `;
      }
      if(sql_pct.length>queryLength1){
        sql_pct = sql_pct.substring(0,sql_pct.length-2);
      }
    }

    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    var has_background_pic = data.files && data.files.find(r=>{return r.profile_img==2});
    var has_pattern_pic = data.files && data.files.find(r=>{return r.profile_img==3});
    var has_additional_pic = data.files && data.files.find(r=>{return r.profile_img==4});
    
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM productcategories_images WHERE profile_img=1 AND category_id=${connection.escape(id)} `
      }
      if(has_background_pic){
        var sql_delete2 = `DELETE FROM productcategories_images WHERE profile_img=2 AND category_id=${connection.escape(id)} `
      }
      if(has_pattern_pic){
        var sql_delete3 = `DELETE FROM productcategories_images WHERE profile_img=3 AND category_id=${connection.escape(id)} `
      }
      if(has_additional_pic){
        var sql_delete4 = `DELETE FROM productcategories_images WHERE profile_img=4 AND category_id=${connection.escape(id)} `
      }

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_ci = `INSERT INTO productcategories_images
    (id, category_id, profile_img, name, type, link) values ${insert_data1} `;

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
      if(data.translations){
        queries.push(connection.query(sql_delete_pct));
        if(data.translations.length>0){
          queries.push(connection.query(sql_pct));
        }
        x=1;
      }
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }
        if(has_background_pic){
          queries.push(connection.query(sql_delete2));
        }
        if(has_pattern_pic){
          queries.push(connection.query(sql_delete3));
        }
        if(has_additional_pic){
          queries.push(connection.query(sql_delete4));
        }
        queries.push(connection.query(sql_insert_ci)); 
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

Category.prototype.deleteCategory = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_delete_category = `DELETE FROM productcategories WHERE id = ${connection.escape(id)} `;
    var sql_delete_pct = `DELETE FROM productcategories_translations WHERE category_id = ${connection.escape(id)} `;
    var sql_delete_pci = `DELETE FROM productcategories_images WHERE category_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_pct));
      queries.push(connection.query(sql_delete_pci));
      queries.push(connection.query(sql_delete_category));
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

module.exports = new Category();