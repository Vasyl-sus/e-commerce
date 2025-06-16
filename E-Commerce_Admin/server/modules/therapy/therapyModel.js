
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');

var Therapy = function () {};

//Create therapy
Therapy.prototype.createTherapy = therapy => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_therapy = `INSERT INTO therapies
    (id, name, country, category, active,
     seo_link, view_label, total_price, inflated_price,
     meta_title, meta_description, language, title_color, percent, bonus, second_bonus, therapy_name, box_title, box_subtitle, inflated_price_label)
    value (${connection.escape(therapy.id)},${connection.escape(therapy.name)}, ${connection.escape(therapy.country)}, ${connection.escape(therapy.category)}, ${connection.escape(therapy.active)},
     ${connection.escape(therapy.seo_link)}, ${connection.escape(therapy.view_label)}, ${connection.escape(therapy.total_price)}, ${connection.escape(therapy.inflated_price)},
     ${connection.escape(therapy.meta_title)}, ${connection.escape(therapy.meta_description)}, ${connection.escape(therapy.language)}, ${connection.escape(therapy.title_color)}, ${connection.escape(therapy.percent)}
     , ${connection.escape(therapy.bonus)}, ${connection.escape(therapy.second_bonus)}, ${connection.escape(therapy.therapy_name)}, ${connection.escape(therapy.box_title)}, ${connection.escape(therapy.box_subtitle)}, ${connection.escape(therapy.inflated_price_label)}) `;

    if(therapy.products && therapy.products.length>0){
      var sql_insert_tp = `INSERT INTO therapies_products
      (therapy_id, product_id, product_quantity) values `
      for(var i=0; i<therapy.products.length; i++){
        sql_insert_tp+= `(${connection.escape(therapy.id)},${connection.escape(therapy.products[i].id)},${connection.escape(therapy.products[i].product_quantity)}),`
      }
      sql_insert_tp = sql_insert_tp.substring(0, sql_insert_tp.length - 1);
    }

    var insert_data1 = "";

    if(therapy.files && therapy.files.length>0){
      for(var i=0;i<therapy.files.length;i++){
        insert_data1 += `(${connection.escape(therapy.files[i].id)}, ${connection.escape(therapy.id)}, ${connection.escape(therapy.files[i].profile_img)},
                          ${connection.escape(therapy.files[i].name)}, ${connection.escape(therapy.files[i].type)}, ${connection.escape(therapy.files[i].link)}, ${connection.escape(therapy.files[i].pattern_img)}, ${connection.escape(therapy.files[i].background_img)}), `;
      }
    } else if(therapy.display_image){
        insert_data1 += `(${connection.escape(therapy.display_image.id)}, ${connection.escape(therapy.id)}, ${connection.escape(1)},
                          ${connection.escape(therapy.display_image.name)}, ${connection.escape(therapy.display_image.type)}, ${connection.escape(therapy.display_image.link)}, ${connection.escape(0)}, ${connection.escape(0)}), `;
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_ti = `INSERT INTO therapies_images
    (id, therapy_id, profile_img, name, type, link, pattern_img, background_img) values ${insert_data1} `;

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_therapy));
      if(therapy.products && therapy.products.length>0){
        queries.push(connection.query(sql_insert_tp));
      }
      if(insert_data1.length>2){
        queries.push(connection.query(sql_ti));
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

Therapy.prototype.getTherapyByName = name => {
  return new Promise((resolve, reject) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM therapies
    WHERE name = ${connection.escape(name)} `;
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

Therapy.prototype.getTherapyDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM therapies
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

Therapy.prototype.filterTherapies = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    // var sql_select = `SELECT t.*, tp.product_id, tp.product_quantity as quantity, ti.profile_img, ti.background_img, ti.pattern_img, ti.id as img_id, ti.name as img_name, ti.type as img_type, ti.link as img_link
    // FROM therapies as t
    // INNER JOIN therapies_products as tp ON t.id=tp.therapy_id
    // LEFT JOIN therapies_images as ti ON (ti.therapy_id=t.id AND (ti.profile_img=1 OR ti.background_img=1 OR ti.pattern_img=1))
    // WHERE t.id IS NOT NULL `;

    var sql_select = `SELECT t.*, tp.product_id, tp.product_quantity as quantity, c.id as category_id
    FROM therapies as t
    INNER JOIN productcategories as c on c.name = t.category
    INNER JOIN therapies_products as tp ON t.id=tp.therapy_id
    WHERE t.id IS NOT NULL `;

    if (data.search) {
      sql_select += `AND t.name like '%${data.search}%' `;
    }
    if (data.country) {
      sql_select += `AND t.country = '${data.country}' `;
    }
    if (data.lang) {
      sql_select += `AND t.language = '${data.lang}' `;
    }
    if (data.hasOwnProperty('active') && (data.active==0 || data.active==1)) {
      sql_select += `AND t.active = '${data.active}' `;
    }

    sql_select += ` GROUP BY t.id `;

    if(data.sort=='name' || data.sort=='country' || data.sort=='total_price'){
      sql_select += `ORDER BY t.${data.sort} ${data.sortOpt} `
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
      //console.log(JSON.stringify(rows));
      var allTherapies = rows;
      //var product_ids = [];
      var product_map = {};
      //var therapies = [];
      //var therapies_images= [];

      rows.map(x=>{
      //   // if(x.img_id){
      //   //   var img = {
      //   //     id: x.img_id,
      //   //     name: x.img_name,
      //   //     type: x.img_type,
      //   //     link: x.img_link,
      //   //     image_type: ''
      //   //   }
      //   //   if(x.profile_img==1){
      //   //     img.image_type = 'profile_img';
      //   //     // x.display_image = img;
      //   //     therapies_images.push(img);
      //   //   }
      //   //   else if(x.pattern_img==1){
      //   //     img.image_type = 'pattern_img';
      //   //     // x.pattern_img = img;
      //   //     therapies_images.push(img);
      //   //   }
      //   //   else if(x.background_img==1){
      //   //     img.image_type = 'background_img';
      //   //     // x.background_img = img;
      //   //     therapies_images.push(img);
      //     // }
      //   // }
      //   var product_id = connection.escape(x.product_id);
      //   if(product_ids.indexOf(product_id)==-1){
      //     product_ids.push(product_id);
      //   }
      //   var elt = {};
      //   for(var k in x){
      //     if(k != "product_id" && k != "quantity" && k!="img_id" && k!="img_name" && k!="img_type" && k!="img_link"){
      //       elt[k]=x[k];
      //     }
      //   }

      //   if(!therapies.find(y=>{ return y.id==elt.id; })){
      //     therapies.push(elt);
      //   }

        if(!product_map[x.id]) product_map[x.id] = [];
        product_map[x.id].push({product_id: x.product_id, product_quantity: x.quantity});
      });


      // console.log('productMap: ', product_map);
      if(allTherapies[0]){
        var therapies_ids = allTherapies.map(therapy=>{
          return therapy.id;
        });
        // var sql_select_products = `SELECT p.*, pi.id as img_id, pi.name as img_name, pi.type as img_type, pi.link as img_link
        //                            FROM products as p
        //                            LEFT JOIN products_images as pi ON (pi.product_id=p.id AND pi.profile_img=1)
        //                            WHERE p.id IN (${product_ids.join()})`;

        var sql_select_products1 = `SELECT tp.therapy_id, p.*, pi.id as img_id, pi.name as img_name, pi.type as img_type, pi.link as img_link, tp.product_quantity
        FROM products as p
        INNER JOIN therapies_products as tp ON p.id = tp.product_id
        LEFT JOIN products_images as pi ON (pi.product_id=p.id AND pi.profile_img=1)
        where tp.therapy_id IN (${"'"+therapies_ids.join("','")+"'"})`;

        connection.query(sql_select_products1, (err, rows) => {
          // connection.release();
          if (err) {
            reject(err);
            return;
          }

          var products = rows.map(x=>{
            if(x.img_id){
              var img={
                id: x.img_id,
                name: x.img_name,
                type: x.img_type,
                link: x.img_link
              };
              x.post_image=img;
            }
            delete x.img_id;
            delete x.img_name;
            delete x.img_type;
            delete x.img_link;
            return x;
          });

          for(var i=0;i<allTherapies.length;i++){
            // for(var j=0;j<product_map[allTherapies[i].id].length;j++){
            //   var found = products.find(x=>{
            //     return x.id==product_map[allTherapies[i].id][j].product_id;
            //   });
            //   if(found){
            //     var insert_obj = Object.assign({product_quantity: product_map[allTherapies[i].id][j].product_quantity}, found);
            //     if(!allTherapies[i].products) allTherapies[i].products=[];
            //     allTherapies[i].products.push(insert_obj);
            //   }
            // }
            allTherapies[i].products = products && products.filter(p=>{return p.therapy_id == allTherapies[i].id}) || [];
          }

          var sql_select_therapies_images = `SELECT ti.id, ti.therapy_id, ti.profile_img, ti.background_img, ti.pattern_img, ti.name, ti.type, ti.link
          FROM therapies_images AS ti
          INNER JOIN therapies AS t ON ti.therapy_id = t.id
          WHERE t.id IN (${"'"+therapies_ids.join("','")+"'"});`;

          connection.query(sql_select_therapies_images, (err, therapies_images) => {
            connection.release();
            if(err){
              console.log(err);
              reject(err);
              return;
            }
            for(let i=0;i<allTherapies.length;++i){
              var therapy_images = [];
              for(let j=0;j<therapies_images.length;++j){
                if(allTherapies[i].id == therapies_images[j].therapy_id){
                  let img = {
                    id: therapies_images[j].id,
                    therapy_id: therapies_images[j].therapy_id,
                    name: therapies_images[j].name,
                    type: therapies_images[j].type,
                    link: therapies_images[j].link,
                    img_type: ''
                  }
                  if(therapies_images[j].profile_img == 1){
                    img.img_type = 'profile_img';
                  }else if(therapies_images[j].background_img == 1){
                    img.img_type = 'background_img';
                  }else if(therapies_images[j].pattern_img == 1){
                    img.img_type = 'pattern_img';
                  }
                  therapy_images.push(img);
                }
              }
              allTherapies[i].images = therapy_images;
            }
            resolve(allTherapies);
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

Therapy.prototype.countFilterTherapies = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(t.id) as count
    FROM therapies as t
    WHERE t.id IS NOT NULL `;

    if (data.search) {
      sql_select += `AND t.name like '%${data.search}%' `;
    }
    if (data.country) {
      sql_select += `AND t.country = '${data.country}' `;
    }
    if (data.lang) {
      sql_select += `AND t.language = '${data.lang}' `;
    }
    if (data.hasOwnProperty('active') && (data.active==0 || data.active==1)) {
      sql_select += `AND t.active = '${data.active}' `;
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

Therapy.prototype.updateTherapy = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var update_data = "";
    for (var i in data) {
      if(i!="products" && i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `;
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }
    var sql_update = `UPDATE therapies SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var sql_delete = `DELETE FROM therapies_products WHERE therapy_id = ${connection.escape(id)} `;
    if(data.products && data.products.length>0){
      var sql_insert = `INSERT INTO therapies_products
      (therapy_id, product_id, product_quantity) values `

      for(var i=0; i<data.products.length; i++){
        sql_insert+=`(${connection.escape(id)},${connection.escape(data.products[i].id)},${connection.escape(data.products[i].product_quantity)})`;
        if(i!=data.products.length-1){
          sql_insert+=`,`;
        }
      }
    }

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    var has_pattern_image = data.files && data.files.find(r=>{return r.pattern_img==1});
    var has_background_image = data.files && data.files.find(r=>{return r.background_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM therapies_images WHERE profile_img=1 AND therapy_id=${connection.escape(id)} `
      }
      if(has_pattern_image){
        var sql_delete2 = `DELETE FROM therapies_images WHERE pattern_img=1 AND therapy_id=${connection.escape(id)} `
      }
      if(has_background_image){
        var sql_delete3 = `DELETE FROM therapies_images WHERE background_img=1 AND therapy_id=${connection.escape(id)} `
      }
      //var sql_delete4 = `DELETE FROM mediums_images WHERE profile_img=0 AND medium_id=${connection.escape(id)} `

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)}, ${connection.escape(data.files[i].pattern_img)}, ${connection.escape(data.files[i].background_img)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO therapies_images
    (id, therapy_id, profile_img, name, type, link, pattern_img, background_img) values ${insert_data1} `;

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
      if(data.products){
        queries.push(connection.query(sql_delete));
        if(data.products.length>0)
          queries.push(connection.query(sql_insert));
        x=1;
      }
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries.push(connection.query(sql_delete1));
        }/*
        if(data.files && data.files.length>t){
          queries.push(connection.query(sql_delete4));
        }*/
        if(has_pattern_image){
          queries.push(connection.query(sql_delete2));
        }
        if(has_background_image){
          queries.push(connection.query(sql_delete3));
        }
        if(insert_data1.length>2){
          queries.push(connection.query(sql_insert_mi));
        }
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



Therapy.prototype.deleteTherapy = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_therapy = `DELETE FROM therapies WHERE id = ${connection.escape(id)} `;
    var sql_delete_ti = `DELETE FROM therapies_images WHERE therapy_id = ${connection.escape(id)} `;
    var sql_delete_tp = `DELETE FROM therapies_products WHERE therapy_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_ti));
      queries.push(connection.query(sql_delete_tp));
      queries.push(connection.query(sql_delete_therapy));
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

Therapy.prototype.deleteTherapyImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM therapies_images WHERE id = ${connection.escape(id)} `;

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

module.exports = new Therapy();
