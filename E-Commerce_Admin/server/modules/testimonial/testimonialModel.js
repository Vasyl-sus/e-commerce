
var pool = require('../../utils/mysqlService');
var bluebird = require('bluebird');
var uuid = require('uuid');

var Testimonial = function () {};

//Create testimonial
Testimonial.prototype.createTestimonial = testimonial => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }

    var sql_insert_testimonial = `INSERT INTO testimonials
    (id, full_name, profession, category, country, gender, sort_order, language, content, favourite, url, facebook_link, instagram_link, show_home)
    value ( ${connection.escape(testimonial.id)}, ${connection.escape(testimonial.full_name)}, ${connection.escape(testimonial.profession)},
            ${connection.escape(testimonial.category)}, ${connection.escape(testimonial.country)},
            ${connection.escape(testimonial.gender)}, ${connection.escape(testimonial.sort_order)},
            ${connection.escape(testimonial.language)}, ${connection.escape(testimonial.content)}, ${connection.escape(testimonial.favourite)},
            ${connection.escape(testimonial.url)}, ${connection.escape(testimonial.facebook_link)}, ${connection.escape(testimonial.instagram_link)}, ${connection.escape(testimonial.show_home)})`;

    var insert_data1 = "";

    if(testimonial.files){
      for(var i=0;i<testimonial.files.length;i++){
        insert_data1 += `(${connection.escape(testimonial.files[i].id)}, ${connection.escape(testimonial.id)}, ${connection.escape(testimonial.files[i].profile_img)},
                          ${connection.escape(testimonial.files[i].name)}, ${connection.escape(testimonial.files[i].type)}, ${connection.escape(testimonial.files[i].link)},
                          ${connection.escape(testimonial.files[i].instagram_img)}, ${connection.escape(testimonial.files[i].timeline_img)}, ${connection.escape(testimonial.files[i].img_size)}), `;
      }
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_ti = `INSERT INTO testimonials_images
    (id, testimonial_id, profile_img, name, type, link, instagram_img, timeline_img, img_size) values ${insert_data1} `;

    if(testimonial.therapies && testimonial.therapies.length){
      var sql_insert_therapies = `INSERT INTO testimonials_therapies(id, testimonial_id, therapy_id) VALUES `;
      for(var i = 0; i < testimonial.therapies.length; ++i){
        sql_insert_therapies += `(${connection.escape(uuid.v4())}, ${connection.escape(testimonial.id)}, ${connection.escape(testimonial.therapies[i])}), `;
      }
    }

    if(sql_insert_therapies && sql_insert_therapies.length>2){
      sql_insert_therapies=sql_insert_therapies.substring(0,sql_insert_therapies.length-2);
    }

    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_insert_testimonial));
      if(insert_data1.length>2){
        queries.push(connection.query(sql_ti));
      }
      if(testimonial.therapies && testimonial.therapies.length > 0 && sql_insert_therapies.length>2){
        queries.push(connection.query(sql_insert_therapies));
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

Testimonial.prototype.getTestimonialDetails = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM testimonials
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

Testimonial.prototype.getTestimonialBy = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM testimonials
    WHERE id IS NOT NULL `;
    for(var k in data){
      sql_select += `AND ${k} = ${connection.escape(data[k])} `;
    }
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

Testimonial.prototype.getTestimonialDetailsFull = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM testimonials
    WHERE id = ${connection.escape(id)}`;
    connection.query(sql_select, (err, rows) => {
      if (err) {
        connection.release();
        reject(err);
        return;
      }
      if(rows[0]){
        var testimonial = rows[0];
        var sql_select1 = `SELECT *
        FROM testimonials_images
        WHERE testimonial_id = ${connection.escape(id)}`;
        connection.query(sql_select1, (err, rows) => {
          connection.release();
          if (err) {
            reject(err);
            return;
          }
          testimonial.profile_image = rows.find(r=>{return r.profile_img==1}) || null;
          testimonial.images = rows.filter(r=>{return r.profile_img==0 && r.instagram_img==0});
          testimonial.instagram_images = rows.filter(r=>{return r.instagram_img==1});

          var sql_select_therapies = `select t.* from testimonials_therapies as tt
          inner join therapies as t on tt.therapy_id = t.id
          where tt.testimonial_id = ${connection.escape(id)})`;

          connection.query(sql_select_therapies, (err, therapies) => {
            connection.release();
            if(err){
              reject(err);
              return;
            }

            testimonial.therapies = [];
            for(var j=0; j < therapies.length; ++j){
              if(testimonial.id == therapies[j].testimonial_id){

                let therapiesIdsHolder = testimonial.therapies.map(t=>{return t.id});
                if(!therapiesIdsHolder.includes(therapies[j].id)){
                  let therapy = {
                  id: therapies[j].therapy_id,
                  name: therapies[j].name,
                  total_price: therapies[j].total_price
                  }

                  testimonial.therapies.push(therapy);

                  delete therapies[j].therapy_id;
                  delete therapies[j].name;
                  delete therapies[j].total_price;
                }

              }
            }
            resolve(testimonial);
          });

          // resolve(testimonial);
        });
      } else {
        connection.release();
        resolve(rows[0]);
      }
    });
  });

  });
}

Testimonial.prototype.filterTestimonials = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }
    var sql_select = `SELECT *
    FROM testimonials
    WHERE id IS NOT NULL `;

    if(data.country){
      sql_select += `AND country = ${connection.escape(data.country)} `;
    }
    if(data.lang){
      sql_select += `AND language = ${connection.escape(data.lang)} `;
    }
    if(data.category){
      sql_select += `AND category = ${connection.escape(data.category)} `;
    }
    if(data.gender){
      sql_select += `AND gender = ${connection.escape(data.gender)} `;
    }

    if(data.sort=='gender' || data.sort=='country' || data.sort=='lang' || data.sort=='category' || data.sort=='full_name'){
      if(data.sort=='lang'){
        data.sort = 'language';
      }
      sql_select += `ORDER BY ${data.sort} ${data.sortOpt} `;
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

      if(rows[0]){
        var testimonials = rows;
        var testimonial_ids = rows.map(x=>{
          return connection.escape(x.id);
        });

        var sql_select_ti = `SELECT ti.* FROM testimonials_images as ti WHERE ti.testimonial_id IN(${testimonial_ids.join()}) `;

        connection.query(sql_select_ti, (err, testimonials_images) => {
          if(err){
            connection.release();
            reject(err);
            return;
          }

          for(var i=0;i<testimonials.length;i++){
            testimonials[i].profile_image = testimonials_images && testimonials_images.find(r=>{return r.profile_img==1 && r.testimonial_id==testimonials[i].id}) || null;
            testimonials[i].images = testimonials_images && testimonials_images.filter(r=>{return r.profile_img==0 && r.instagram_img==0 && r.testimonial_id==testimonials[i].id}) || [];
            testimonials[i].instagram_images = testimonials_images && testimonials_images.filter(r=>{return r.instagram_img==1 && r.testimonial_id==testimonials[i].id}) || [];
            testimonials[i].timeline_image = testimonials_images && testimonials_images.filter(r=>{return r.timeline_img==1 && r.testimonial_id==testimonials[i].id}) || [];
          }

          var sql_select_productcategories = `SELECT tt.testimonial_id, tt.therapy_id, pc.id as pc_id, pc.name as pc_name, pc.sort_order, pc.css_class_name FROM testimonials_therapies as tt INNER JOIN productcategories as pc ON tt.therapy_id = pc.id WHERE tt.testimonial_id IN (${testimonial_ids.join()})`;

          connection.query(sql_select_productcategories, (err, productcategories) => {
            if(err){
              connection.release();
              reject(err);
              return;
            }

            if(productcategories[0]){
              var productcategories_ids = productcategories.map(pc=>{
                return pc.pc_id;
              });

              var sql_select_productcategories_images = `SELECT * FROM productcategories_images as pci WHERE pci.category_id IN (${"'"+productcategories_ids.join("','")+"'"})`;
              var sql_select_productcategories_translations = `SELECT * FROM productcategories_translations as pct WHERE pct.category_id IN (${"'"+productcategories_ids.join("','")+"'"})`;


              connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
              connection.query = bluebird.promisify(connection.query);
              connection.rollback = bluebird.promisify(connection.rollback);
              connection.beginTransaction().then(() => {
                var queries = [];
                queries.push(connection.query(sql_select_productcategories_images));
                queries.push(connection.query(sql_select_productcategories_translations));
                return bluebird.all(queries);
              }).then((results) => {
                for(let i = 0; i < productcategories.length; ++i){
                  productcategories[i].images = results[0] && results[0].filter(img=>{return img.category_id === productcategories[i].pc_id }) || [];
                  productcategories[i].translations = results[1] && results[1].filter(t=>{return t.category_id === productcategories[i].pc_id }) || [];
                }
                for(let i = 0; i < testimonials.length; ++i){
                  testimonials[i].productcategories = productcategories.filter(pc=>{return testimonials[i].id == pc.testimonial_id}) || [];
                }
                return connection.commit();
              }).then(() => {
                connection.release();
                resolve(testimonials);
                return;
              }).catch(err => {
                return connection.rollback().then(() => {
                  connection.release();
                  reject(err);
                  return;
                });
              });
            }
            else{
              for(let i = 0; i < testimonials.length; ++i){
                testimonials[i].productcategories = [];
              }
              connection.release();
              resolve(testimonials);
            }

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

// Testimonial.prototype.filterTestimonials = data => {
//   return new Promise((resolve, reject) => {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.log(err);
//       reject(err);
//       return;
//     }
//     var sql_select = `SELECT *
//     FROM testimonials
//     WHERE id IS NOT NULL `;

//     if(data.country){
//       sql_select += `AND country = ${connection.escape(data.country)} `;
//     }
//     if(data.lang){
//       sql_select += `AND language = ${connection.escape(data.lang)} `;
//     }
//     if(data.category){
//       sql_select += `AND category = ${connection.escape(data.category)} `;
//     }
//     if(data.gender){
//       sql_select += `AND gender = ${connection.escape(data.gender)} `;
//     }

//     if(data.sort=='gender' || data.sort=='country' || data.sort=='lang' || data.sort=='category' || data.sort=='full_name'){
//       if(data.sort=='lang'){
//         data.sort = 'language';
//       }
//       sql_select += `ORDER BY ${data.sort} ${data.sortOpt} `;
//     }

//     if(data.pageNumber && data.pageLimit){
//       data.from = (data.pageNumber-1)*data.pageLimit;
//       sql_select += `limit ${data.from}, ${data.pageLimit}`;
//     }
//     //console.log(sql_select);
//     connection.query(sql_select, (err, rows) => {
//       if (err) {
//         connection.release();
//         reject(err);
//         return;
//       }

//       if(rows[0]){
//         var testimonials = rows;
//         var testimonial_ids = rows.map(x=>{
//           return connection.escape(x.id);
//         });

//         var sql_select_ti = `SELECT ti.* FROM testimonials_images as ti WHERE ti.testimonial_id IN(${testimonial_ids.join()}) `;
//         connection.query(sql_select_ti, (err, rows) => {
//           if (err) {
//             reject(err);
//             return;
//           }

//           for(var i=0;i<testimonials.length;i++){
//             testimonials[i].profile_image = rows.find(r=>{return r.profile_img==1 && r.testimonial_id==testimonials[i].id}) || null;
//             testimonials[i].images = rows.filter(r=>{return r.profile_img==0 && r.instagram_img==0 && r.testimonial_id==testimonials[i].id});
//             testimonials[i].instagram_images = rows.filter(r=>{return r.instagram_img==1 && r.testimonial_id==testimonials[i].id});
//             testimonials[i].timeline_image = rows.filter(r=>{return r.timeline_img==1 && r.testimonial_id==testimonials[i].id});
//           }

//           var sql_select_therapies = `select t.* from testimonials_therapies as tt
//                                       inner join therapies as t on tt.therapy_id = t.id
//                                       where tt.testimonial_id IN (${testimonial_ids.join()})`;

//           connection.query(sql_select_therapies, (err, therapies) => {
//             connection.release();
//             if(err){
//               reject(err);
//               return;
//             }

//             for(var i= 0; i < testimonials.length; ++i){
//               testimonials[i].therapies = [];
//               for(var j=0; j < therapies.length; ++j){
//                 if(testimonials[i].id == therapies[j].testimonial_id){

//                   let therapiesIdsHolder = testimonials[i].therapies.map(t=>{return t.id});
//                   if(!therapiesIdsHolder.includes(therapies[j].id)){
//                     let therapy = {
//                       id: therapies[j].therapy_id,
//                       name: therapies[j].name,
//                       total_price: therapies[j].total_price
//                     }

//                     testimonials[i].therapies.push(therapy);

//                     delete therapies[j].therapy_id;
//                     delete therapies[j].name;
//                     delete therapies[j].total_price;
//                   }

//                 }
//               }
//             }
//             resolve(testimonials);
//           });

//         });
//       } else {
//         connection.release();
//         resolve(rows);
//       }
//     });
//   });

//   });
// }

Testimonial.prototype.countFilterTestimonials = data => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_select = `SELECT count(id) as count
    FROM testimonials
    WHERE id IS NOT NULL `;

    if(data.country){
      sql_select += `AND country = ${connection.escape(data.country)} `;
    }
    if(data.lang){
      sql_select += `AND language = ${connection.escape(data.lang)} `;
    }
    if(data.category){
      sql_select += `AND category = ${connection.escape(data.category)} `;
    }
    if(data.gender){
      sql_select += `AND gender = ${connection.escape(data.gender)} `;
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

Testimonial.prototype.updateTestimonial = (id, data) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var update_data = "";
    if(data.therapies){
      var therapies = data.therapies;
      delete data.therapies;
    }
    for (var i in data) {
      if(i!="files"){
        update_data += `${i} = ${connection.escape(data[i])}, `;
      }
    }
    if(update_data.length>2){
      update_data=update_data.substring(0,update_data.length-2);
    }

    var sql_update = `UPDATE testimonials SET ${update_data} WHERE id = ${connection.escape(id)}`;

    var t=0;
    var has_profile_pic = data.files && data.files.find(r=>{return r.profile_img==1});
    if(has_profile_pic) t=1;
    var insert_data1 = "";

    var has_timeline_pic = data.files && data.files.find(r=>{return r.timeline_img==1});
    var has_instagram_img = data.files && data.files.find(r=>{return r.instagram_img==1});

    if(data.files){
      if(has_profile_pic){
        var sql_delete1 = `DELETE FROM testimonials_images WHERE profile_img=1 AND testimonial_id=${connection.escape(id)} `
      }

      var sql_delete2 = `DELETE FROM testimonials_images WHERE profile_img=0 AND timeline_img=0 AND testimonial_id=${connection.escape(id)} `

      if(has_timeline_pic){
        var sql_delete3 = `DELETE FROM testimonials_images WHERE timeline_img=1 AND testimonial_id=${connection.escape(id)} `
      }

      // if(has_instagram_img){
      //   var sql_delete4 = `DELETE FROM testimonials_images WHERE instagram_img=1 AND testimonial_id=${connection.escape(id)} `
      // }

      for(var i=0;i<data.files.length;i++){
        insert_data1 += `(${connection.escape(data.files[i].id)}, ${connection.escape(id)}, ${connection.escape(data.files[i].profile_img)},
                          ${connection.escape(data.files[i].name)}, ${connection.escape(data.files[i].type)}, ${connection.escape(data.files[i].link)},
                          ${connection.escape(data.files[i].instagram_img)}, ${connection.escape(data.files[i].timeline_img)}, ${connection.escape(data.files[i].img_size)}), `;
      }
    }

    if(therapies && therapies.length > 0){
      var sql_delete5 = `DELETE FROM testimonials_therapies WHERE testimonial_id = ${connection.escape(id)}`;
      var sql_insert_therapies = `INSERT INTO testimonials_therapies(id, testimonial_id, therapy_id) VALUES `;
      for(var i = 0; i < therapies.length; ++i){
        sql_insert_therapies += `(${connection.escape(uuid.v1())}, ${connection.escape(id)}, ${connection.escape(therapies[i])}), `;
      }
    }

    if(sql_insert_therapies && sql_insert_therapies.length>2){
      sql_insert_therapies=sql_insert_therapies.substring(0,sql_insert_therapies.length-2);
    }

    if(insert_data1.length>2){
      insert_data1=insert_data1.substring(0,insert_data1.length-2);
    }

    var sql_insert_mi = `INSERT INTO testimonials_images
    (id, testimonial_id, profile_img, name, type, link, instagram_img, timeline_img, img_size) values ${insert_data1} `;


    var x=0;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries2 = [];
      if(update_data.length>2){
        queries2.push(connection.query(sql_update));
        x=1;
      }
      if(insert_data1.length>2){
        if(has_profile_pic){
          queries2.push(connection.query(sql_delete1));
        }
        if(has_timeline_pic){
            queries2.push(connection.query(sql_delete3));
        }
        // if(has_instagram_img){
        //   queries2.push(connection.query(sql_delete4));
        // }
        /*
        if(data.files && data.files.length>t){
          queries.push(connection.query(sql_delete2));
        }*/
        if(insert_data1.length>2){
          queries2.push(connection.query(sql_insert_mi));
        }
        x=1;
      }
      if(therapies && therapies.length > 0){
        queries2.push(connection.query(sql_delete5));
        queries2.push(connection.query(sql_insert_therapies));
      }
      return bluebird.all(queries2);
    }).then((results) => {
      return connection.commit();
    }).then((results) => {
      connection.release();
      resolve(x);
    }).catch(err => {
      console.log(err)
      return connection.rollback().then(() => {
        connection.release();
        reject(err);
        return;
      });
    });
  });

  });
}

Testimonial.prototype.deleteTestimonial = id => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      reject(err);
      return;
    }

    var sql_delete_testimonial = `DELETE FROM testimonials WHERE id = ${connection.escape(id)} `;
    var sql_delete_ti = `DELETE FROM testimonials_images WHERE testimonial_id = ${connection.escape(id)} `;

    var x;
    connection.beginTransaction = bluebird.promisify(connection.beginTransaction);
    connection.query = bluebird.promisify(connection.query);
    connection.rollback = bluebird.promisify(connection.rollback);
    connection.beginTransaction().then(() => {
      var queries = [];
      queries.push(connection.query(sql_delete_ti));
      queries.push(connection.query(sql_delete_testimonial));
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


Testimonial.prototype.deleteTestimonialImage = (id) => {
  return new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
      return;
    }
    var sql_delete = `DELETE FROM testimonials_images WHERE id = ${connection.escape(id)} `;

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

module.exports = new Testimonial();
